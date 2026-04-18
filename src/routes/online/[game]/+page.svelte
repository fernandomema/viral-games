<script lang="ts">
	import type { GameDef } from '$lib/games/registry';
	import { getWordCategories } from '$lib/games/impostor';
	import { getDrawCategories } from '$lib/games/impostor-draw';
	import { getFactCategories } from '$lib/games/impostor-datos';
	import GameHero from '$lib/components/GameHero.svelte';
	import GameConfig from '$lib/components/GameConfig.svelte';
	import CategoryPicker from '$lib/components/CategoryPicker.svelte';
	import { haptic, hapticTap } from '$lib/haptics';
	import { t, getLocale } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { browser } from '$app/environment';

	let { data } = $props();
	let game: GameDef = $derived(data.game);

	const isGreen = $derived(game.type === 'draw' || game.type === 'fact');

	// Categories based on game type
	let categories = $derived(
		game.type === 'word' ? getWordCategories(getLocale()) :
		game.type === 'draw' ? getDrawCategories(getLocale()) :
		getFactCategories(getLocale())
	);

	// ── State ─────────────────────────────────────────────────────
	let phase = $state<'join' | 'connecting' | 'lobby' | 'playing' | 'voting' | 'results' | 'error'>('join');
	let errorMsg = $state('');
	let gameState = $state<any>(null);
	let myRole = $state<any>(null);
	let hostUserId = $state<string | null>(null);
	let myUserId = $state<string | null>(null);
	let votingTarget = $state<string | null>(null);
	let selectedCategory = $state<string | undefined>(undefined);
	let impostorNames = $state<string[]>([]);
	let impostorWon = $state(false);

	// Config
	let configImpostors = $state(1);
	let configTimer = $state(300);
	let configHint = $state(true);
	let configTurnTimer = $state(15);
	let configRounds = $state(2);

	// Join form
	let userName = $state('');
	let roomCode = $state('');

	// Public rooms
	let publicRooms = $state<{ code: string; gameId: string; playerCount: number; hostName: string; players: string[] }[]>([]);
	let loadingRooms = $state(true);
	let roomsLoaded = $state(false);
	let isPublic = $state(false);

	let ws: WebSocket | null = null;

	const isHost = $derived(myUserId === hostUserId);
	const alivePlayers = $derived(gameState?.players.filter((p: any) => !p.eliminated) ?? []);
	const maxImpostors = $derived(Math.max(1, Math.floor((gameState?.players.length || 3) / 3)));
	const myVoteSubmitted = $derived(
		myRole && gameState ? gameState.votes[myRole.playerId] !== undefined : false
	);
	const myRoleWord = $derived(myRole ? (myRole.word ?? myRole.fact ?? '') : '');

	// Read room code from URL
	$effect(() => {
		const urlRoom = page.url.searchParams.get('room');
		if (urlRoom && !roomCode) {
			roomCode = urlRoom.toUpperCase();
		}
	});

	// Fetch public rooms
	let roomPollInterval: ReturnType<typeof setInterval> | null = null;

	$effect(() => {
		if (browser && phase === 'join') {
			fetchPublicRooms();
			roomPollInterval = setInterval(fetchPublicRooms, 3000);
			return () => {
				if (roomPollInterval) clearInterval(roomPollInterval);
			};
		}
	});

	async function fetchPublicRooms() {
		try {
			if (!roomsLoaded) loadingRooms = true;
			const res = await fetch('/api/web/rooms');
			const data = await res.json();
			publicRooms = data.rooms?.filter((r: any) => r.gameId === game.id) ?? [];
		} catch {
			// Silently fail
		} finally {
			loadingRooms = false;
			roomsLoaded = true;
		}
	}

	// ── User ID ───────────────────────────────────────────────────
	function getOrCreateUserId(): string {
		const key = 'viral-games-user-id';
		let id = sessionStorage.getItem(key);
		if (!id) {
			id = 'web-' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
			sessionStorage.setItem(key, id);
		}
		return id;
	}

	function generateRoomCode(): string {
		const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
		let code = '';
		for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
		return code;
	}

	// ── Join / Create ─────────────────────────────────────────────
	function createRoom() {
		if (!userName.trim()) return;
		roomCode = generateRoomCode();
		connect();
	}

	function joinRoom(code?: string) {
		if (!userName.trim()) return;
		if (code) roomCode = code;
		if (!roomCode.trim()) return;
		connect();
	}

	function connect() {
		phase = 'connecting';
		myUserId = getOrCreateUserId();

		const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
		const wsUrl = `${protocol}//${location.host}/ws`;

		ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			ws!.send(JSON.stringify({
				type: 'join',
				roomId: `web-${game.id}-${roomCode.toUpperCase()}`,
				discordUserId: myUserId,
				userName: userName.trim(),
				avatar: null,
				gameId: game.id,
				isPublic,
			}));
		};

		ws.onmessage = (event) => {
			const msg = JSON.parse(event.data);
			if (msg.type === 'state') {
				const prevPhase = gameState?.phase;
				gameState = msg.state;
				myRole = msg.myRole;
				hostUserId = msg.hostDiscordUserId;
				impostorNames = msg.impostorNames ?? [];
				impostorWon = msg.impostorWon ?? false;

				const url = new URL(location.href);
				if (!url.searchParams.has('room')) {
					url.searchParams.set('room', roomCode);
					history.replaceState({}, '', url.toString());
				}

				if (gameState) {
					if (gameState.phase === 'lobby') {
						phase = 'lobby';
						votingTarget = null;
					} else if (gameState.phase === 'playing' || gameState.phase === 'reveal' || gameState.phase === 'drawing') {
						phase = 'playing';
						votingTarget = null;
					} else if (gameState.phase === 'voting') {
						phase = 'voting';
						if (prevPhase !== 'voting') haptic('nudge');
					} else if (gameState.phase === 'results') {
						phase = 'results';
						if (prevPhase !== 'results') haptic('success');
					}
				}
			} else if (msg.type === 'error') {
				errorMsg = msg.message;
				if (phase === 'connecting') phase = 'error';
			}
		};

		ws.onclose = () => {
			if (phase !== 'join' && phase !== 'error') {
				errorMsg = t('web.disconnected');
				phase = 'error';
			}
		};
	}

	// ── Actions ───────────────────────────────────────────────────
	function send(msg: any) {
		if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
	}

	function startGame() {
		if (game.type === 'draw') {
			send({ type: 'config', config: { impostorCount: configImpostors, timerPerTurn: configTurnTimer, rounds: configRounds, giveImpostorHint: configHint } });
		} else if (game.type === 'fact') {
			send({ type: 'config', config: { impostorCount: configImpostors, timerSeconds: configTimer } });
		} else {
			send({ type: 'config', config: { impostorCount: configImpostors, timerSeconds: configTimer, giveImpostorHint: configHint } });
		}
		send({ type: 'start', category: selectedCategory });
		haptic('success');
	}

	function castVote(targetId: string) {
		votingTarget = targetId;
		send({ type: 'vote', targetId });
		hapticTap();
	}

	function skipToVoting() {
		send({ type: 'skipToVoting' });
		haptic('nudge');
	}

	function playAgain() {
		votingTarget = null;
		impostorNames = [];
		impostorWon = false;
		send({ type: 'playAgain' });
		haptic('success');
	}

	function goHome() {
		ws?.close();
		goto('/');
	}

	function formatTime(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	}

	function copyRoomLink() {
		const url = new URL(location.href);
		url.searchParams.set('room', roomCode);
		navigator.clipboard.writeText(url.toString());
		hapticTap();
	}
</script>

<div class="min-h-dvh text-on-background flex flex-col">

	<!-- ═══════════════ JOIN PHASE — Hero + Room Browser ═══════════════ -->
	{#if phase === 'join'}
		<header class="fixed top-0 inset-x-0 z-50 backdrop-blur-lg bg-background/80 border-b border-outline-variant/10 flex items-center px-6 h-16">
			<a href="/" class="flex items-center gap-2" aria-label="Back">
				<span class="iconify material-symbols--arrow-back text-outline-variant"></span>
			</a>
			<span class="iconify {game.headerIcon} {isGreen ? 'text-secondary' : 'text-primary-dim'} text-xl ml-3"></span>
			<span class="text-lg font-bold tracking-tighter {isGreen ? 'text-primary' : 'text-primary-dim'} font-headline">{game.headerTitle}</span>
			<span class="ml-2 px-2 py-0.5 text-[10px] bg-primary/20 text-primary rounded-full font-bold uppercase">Online</span>
		</header>

		<main class="pt-20 pb-32 px-6 w-full min-h-dvh max-w-6xl mx-auto">
			<div class="lg:grid lg:grid-cols-[1fr_380px] lg:gap-12 lg:items-start">
				<!-- Left: Hero + Name input -->
				<div>
					<GameHero {game} {isGreen} subtitle={t('web.onlineMultiplayer')} />

					<!-- Name input -->
					<div class="mb-6">
						<div class="flex items-center gap-2 mb-2">
							<span class="{isGreen ? 'text-secondary' : 'text-primary-dim'} font-headline text-sm tracking-[0.2em] uppercase font-bold">{t(`game.${game.id}.playerLabel`)}</span>
							<div class="h-px grow bg-outline-variant/20"></div>
						</div>
						<p class="text-on-surface-variant text-sm">{t('web.enterName')}</p>
					</div>

					<div class="glass-panel p-1 rounded-xl mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
						<div class="flex items-center gap-2 bg-surface-container-lowest rounded-lg p-2">
							<div class="grow flex items-center px-3">
								<span class="iconify material-symbols--person text-outline mr-3"></span>
								<input
									bind:value={userName}
									class="bg-transparent border-none focus:outline-none text-on-surface w-full font-medium placeholder:text-outline/50"
									placeholder={t(`game.${game.id}.inputPlaceholder`)}
									type="text"
									maxlength="20"
								/>
							</div>
						</div>
					</div>

					<!-- Public/Private toggle -->
					<label class="flex items-center justify-between mb-4 cursor-pointer px-1">
						<div>
							<span class="text-on-surface text-sm font-medium">{t('web.publicRoom')}</span>
							<p class="text-on-surface-variant text-xs">{t('web.publicRoomHint')}</p>
						</div>
						<input type="checkbox" bind:checked={isPublic} class="accent-primary w-5 h-5" />
					</label>

					<button
						onclick={createRoom}
						disabled={!userName.trim()}
						class="w-full lg:w-auto bg-linear-to-r {isGreen ? 'from-secondary to-green-400' : 'from-primary-dim to-primary'} text-black px-8 py-3.5 rounded-xl font-bold font-headline transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(156,66,244,0.3)] disabled:opacity-40 disabled:cursor-not-allowed mb-8"
					>
						{t('web.createRoom')}
						<span class="iconify material-symbols--add text-sm"></span>
					</button>

					<!-- Join with code -->
					<div class="mb-8">
						<div class="flex items-center gap-3 mb-4">
							<div class="h-px flex-1 bg-outline-variant/20"></div>
							<span class="text-on-surface-variant text-xs uppercase tracking-wider">{t('web.or')}</span>
							<div class="h-px flex-1 bg-outline-variant/20"></div>
						</div>

						<form onsubmit={(e) => { e.preventDefault(); joinRoom(); }} class="flex gap-2">
							<input
								type="text"
								placeholder={t('web.roomCode')}
								bind:value={roomCode}
								maxlength={4}
								class="flex-1 bg-surface-container rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/50 text-center font-mono font-bold text-lg uppercase tracking-widest"
								oninput={(e) => { roomCode = (e.target as HTMLInputElement).value.toUpperCase(); }}
							/>
							<button
								type="submit"
								disabled={!userName.trim() || roomCode.length < 4}
								class="px-6 py-3 rounded-xl font-bold font-headline transition-all
									{userName.trim() && roomCode.length >= 4
										? 'bg-primary text-on-primary hover:brightness-110 active:scale-[0.98]'
										: 'bg-surface-container-highest text-on-surface-variant/50 cursor-not-allowed'}"
							>
								{t('web.join')}
							</button>
						</form>
					</div>
				</div>

				<!-- Right: Public Rooms Browser -->
				<div class="lg:sticky lg:top-24">
					<div class="flex items-center gap-2 mb-3">
						<span class="{isGreen ? 'text-secondary' : 'text-primary-dim'} font-headline text-sm tracking-[0.2em] uppercase font-bold">{t('web.publicRooms')}</span>
						<div class="h-px grow bg-outline-variant/20"></div>
						<button onclick={fetchPublicRooms} class="text-on-surface-variant hover:text-primary transition-colors" aria-label="Refresh">
							<span class="iconify material-symbols--refresh text-lg"></span>
						</button>
					</div>

					{#if loadingRooms}
						<div class="bg-surface-container rounded-xl p-8 text-center">
							<span class="iconify material-symbols--hourglass-top text-2xl text-on-surface-variant/50 animate-pulse"></span>
						</div>
					{:else if publicRooms.length === 0}
						<div class="bg-surface-container rounded-xl p-8 text-center">
							<span class="iconify material-symbols--groups text-3xl text-on-surface-variant/30 mb-2"></span>
							<p class="text-on-surface-variant text-sm">{t('web.noRooms')}</p>
							<p class="text-on-surface-variant/50 text-xs mt-1">{t('web.createFirst')}</p>
						</div>
					{:else}
						<div class="flex flex-col gap-2">
							{#each publicRooms as room}
								<button
									onclick={() => joinRoom(room.code)}
									disabled={!userName.trim()}
									class="w-full bg-surface-container hover:bg-surface-container-high rounded-xl p-4 text-left transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
								>
									<div class="flex items-center justify-between mb-2">
										<span class="font-mono font-bold {isGreen ? 'text-secondary' : 'text-primary'} tracking-widest text-lg">{room.code}</span>
										<span class="text-xs text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-full">
											{room.playerCount} <span class="iconify material-symbols--person text-[10px] align-middle"></span>
										</span>
									</div>
									<div class="flex flex-wrap gap-1">
										{#each room.players as name}
											<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high/50 text-xs text-on-surface-variant">
												<span class="iconify material-symbols--person {isGreen ? 'text-secondary/60' : 'text-primary/60'} text-[10px]"></span>
												{name}
											</span>
										{/each}
									</div>
									<div class="mt-2 text-xs {isGreen ? 'text-secondary' : 'text-primary'} font-medium opacity-0 group-hover:opacity-100 transition-opacity">
										{t('web.tapToJoin')} →
									</div>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</main>

	<!-- Connecting -->
	{:else if phase === 'connecting'}
		<div class="flex-1 flex flex-col items-center justify-center gap-3 p-3">
			<span class="iconify material-symbols--sports-esports text-5xl text-primary animate-pulse"></span>
			<p class="text-on-surface-variant">{t('web.connecting')}</p>
		</div>

	<!-- Error -->
	{:else if phase === 'error'}
		<div class="flex-1 flex flex-col items-center justify-center gap-3 p-3">
			<span class="iconify material-symbols--error text-5xl text-error"></span>
			<p class="text-error text-center">{errorMsg}</p>
			<button onclick={() => { phase = 'join'; errorMsg = ''; }}
				class="mt-2 px-6 py-2 rounded-xl bg-surface-container text-on-surface font-medium hover:bg-surface-container-high transition-colors">
				{t('web.tryAgain')}
			</button>
		</div>

	<!-- Lobby -->
	{:else if phase === 'lobby' && gameState}
		<div class="flex flex-col gap-3 max-w-md mx-auto w-full flex-1 overflow-hidden p-3">
			<!-- Header -->
			<div class="flex items-center justify-between py-1">
				<button onclick={goHome} class="text-on-surface-variant hover:text-on-surface transition-colors" aria-label="Back">
					<span class="iconify material-symbols--arrow-back text-xl"></span>
				</button>
				<div class="text-center">
					<h1 class="text-xl font-bold font-headline tracking-tight inline-flex items-center gap-2">
						<span class="iconify {game.headerIcon} text-2xl {isGreen ? 'text-secondary' : 'text-primary'}"></span>
						<span class="text-on-surface">{@html game.cardTitleHtml}</span>
					</h1>
					<p class="text-on-surface-variant text-xs">{t('discord.playersCount', { count: gameState.players.length })}</p>
				</div>
				<div class="w-6"></div>
			</div>

			<!-- Room code + share -->
			<div class="bg-surface-container rounded-xl p-3 text-center">
				<p class="text-xs text-on-surface-variant uppercase tracking-wider mb-1">{t('web.shareCode')}</p>
				<div class="flex items-center justify-center gap-3">
					<span class="text-3xl font-bold font-mono tracking-[0.3em] {isGreen ? 'text-secondary' : 'text-primary'}">{roomCode}</span>
					<button onclick={copyRoomLink}
						class="w-8 h-8 rounded-full bg-surface-container-high/60 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
						title={t('web.copyLink')}>
						<span class="iconify material-symbols--content-copy text-lg"></span>
					</button>
				</div>
			</div>

			<!-- Player list -->
			<div class="bg-surface-container rounded-xl p-3 min-h-0 overflow-y-auto shrink">
				<div class="flex flex-wrap gap-1.5">
					{#each gameState.players as player}
						<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high/50 text-sm">
							<span class="iconify material-symbols--person {isGreen ? 'text-secondary' : 'text-primary'} text-sm"></span>
							<span class="text-on-surface font-medium">{player.name}</span>
						</span>
					{/each}
				</div>
			</div>

			<!-- Config (host only) -->
			{#if isHost}
				<GameConfig {game} {isGreen} bind:configImpostors bind:configTimer bind:configHint bind:configRounds bind:configTurnTimer {maxImpostors} playerCount={gameState.players.length} />
				<CategoryPicker {categories} bind:selectedCategory {isGreen} />

				<button
					onclick={startGame}
					disabled={gameState.players.length < 3}
					class="w-full py-2.5 rounded-xl font-bold font-headline transition-all shrink-0
						{gameState.players.length >= 3
							? 'bg-primary text-on-primary hover:brightness-110 active:scale-[0.98]'
							: 'bg-surface-container-highest text-on-surface-variant/50 cursor-not-allowed'}"
				>
					{gameState.players.length < 3
					? t('discord.missing', { count: 3 - gameState.players.length })
					: t('discord.letsGo')}
				</button>
			{:else}
				<div class="flex-1 flex flex-col items-center justify-center">
					<span class="iconify material-symbols--hourglass-top text-2xl text-on-surface-variant/50 mb-1"></span>
					<p class="text-on-surface-variant text-sm">{t('discord.waitingHost')}</p>
				</div>
			{/if}
		</div>

	<!-- Playing -->
	{:else if phase === 'playing' && gameState && myRole}
		<div class="flex-1 flex flex-col items-center justify-center gap-4 max-w-md mx-auto w-full p-3">
			<!-- Timer -->
			{#if game.type === 'draw'}
				{@const tRemaining = gameState.turnTimerRemaining ?? 0}
				{@const drawer = gameState.players[gameState.currentDrawerIndex ?? 0]}
				<div class="text-center">
					<p class="text-on-surface-variant text-xs">{t('discord.roundTurnOf', { round: gameState.currentRound ?? 1 })}</p>
					<p class="text-primary font-bold text-lg font-headline">{drawer?.name ?? '...'}</p>
					<p class="text-3xl font-bold font-headline tracking-tighter {tRemaining <= 5 ? 'text-error animate-pulse' : 'text-primary'}">
						{tRemaining}s
					</p>
				</div>
			{:else}
				<p class="text-5xl font-bold font-headline tracking-tighter {gameState.timerRemaining <= 30 ? 'text-error animate-pulse' : 'text-primary'}">
					{formatTime(gameState.timerRemaining)}
				</p>
			{/if}

			<!-- Role card -->
			<div class="w-full bg-surface-container rounded-xl p-4 text-center">
				{#if myRole.role === 'impostor'}
					<span class="iconify material-symbols--person-alert text-3xl text-error"></span>
					<p class="text-error font-bold text-lg font-headline">{t('discord.youAreImpostor')}</p>
					{#if myRoleWord && myRoleWord !== '???' && myRoleWord !== ''}
						<p class="text-on-surface-variant text-sm">{t('discord.hintLabel')} <span class="text-error font-bold">{myRoleWord}</span></p>
					{:else}
						<p class="text-on-surface-variant text-xs">{t('discord.noHint')}</p>
					{/if}
				{:else}
					<span class="iconify material-symbols--shield-person text-3xl text-secondary"></span>
					<p class="text-secondary font-bold text-lg font-headline">{t(`game.${game.id}.citizenLabel`)}</p>
					{#if game.type === 'fact'}
						<p class="text-on-surface-variant text-sm">{t('discord.yourFact')} <span class="text-secondary font-bold">{myRoleWord}</span></p>
					{:else}
						<p class="text-on-surface-variant text-sm">{t('discord.yourWord')} <span class="text-secondary font-bold">{myRoleWord}</span></p>
					{/if}
				{/if}
			</div>

			<!-- Instructions -->
			<p class="text-on-surface-variant text-xs text-center px-4">
				{#if game.type === 'fact'}
					{myRole.role === 'impostor' ? t('discord.factImpostorTip') : t('discord.factCitizenTip')}
				{:else if game.type === 'draw'}
					{myRole.role === 'impostor' ? t('discord.drawImpostorTip') : t('discord.drawCitizenTip')}
				{:else}
					{myRole.role === 'impostor' ? t('discord.wordImpostorTip') : t('discord.wordCitizenTip')}
				{/if}
			</p>

			{#if isHost}
				<button onclick={skipToVoting}
					class="px-5 py-1.5 rounded-lg bg-surface-container-highest text-on-surface-variant text-sm font-medium hover:bg-surface-container-high transition-all active:scale-95">
					{t('discord.skipToVoting')}
				</button>
			{/if}
		</div>

	<!-- Voting -->
	{:else if phase === 'voting' && gameState}
		<div class="flex-1 flex flex-col gap-3 max-w-md mx-auto w-full p-3">
			<div class="text-center py-1">
				<span class="iconify material-symbols--how-to-vote text-3xl text-primary"></span>
				<h2 class="text-xl font-bold font-headline">{t(`game.${game.id}.votingTitle`)}</h2>
				<p class="text-on-surface-variant text-xs">
					{myVoteSubmitted ? t('voting.voteRegistered') : t(`game.${game.id}.votingSubtitle`)}
				</p>
			</div>

			<div class="flex flex-col gap-1.5 overflow-y-auto min-h-0 flex-1">
				{#each alivePlayers as player}
					{@const isMe = myRole?.playerId === player.id}
					{@const isSelected = votingTarget === player.id}
					{#if !isMe}
						<button
							onclick={() => { if (!myVoteSubmitted) castVote(player.id); }}
							disabled={myVoteSubmitted}
							class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all
								{isSelected
									? 'bg-primary text-on-primary ring-2 ring-primary/50'
									: myVoteSubmitted
										? 'bg-surface-container text-on-surface-variant/50 cursor-not-allowed'
										: 'bg-surface-container text-on-surface hover:bg-surface-container-high active:scale-[0.98]'}"
						>
							<span class="iconify {isSelected ? 'material-symbols--check-circle' : 'material-symbols--person'} text-lg"></span>
							<span class="font-medium text-sm">{player.name}</span>
						</button>
					{/if}
				{/each}
			</div>

			{#if myVoteSubmitted}
				<div class="bg-surface-container rounded-lg p-2.5 text-center shrink-0">
					<span class="iconify material-symbols--pending text-xl text-primary"></span>
					<p class="text-on-surface-variant text-xs">{t('voting.waitingOthers')}</p>
				</div>
			{/if}
		</div>

	<!-- Results -->
	{:else if phase === 'results' && gameState && myRole}
		{@const isImpostor = myRole.role === 'impostor'}
		{@const impostorCaught = !impostorWon}
		<div class="flex-1 flex flex-col items-center justify-center gap-3 max-w-md mx-auto w-full p-3">
			<div class="text-center">
				{#if isImpostor}
					<span class="iconify {impostorCaught ? 'material-symbols--sentiment-very-dissatisfied' : 'material-symbols--celebration'} text-5xl {impostorCaught ? 'text-error' : 'text-secondary'}"></span>
					<h2 class="text-xl font-bold font-headline">
						{impostorCaught ? t('discord.caught') : t('discord.escaped')}
					</h2>
				{:else}
					<span class="iconify {impostorCaught ? 'material-symbols--celebration' : 'material-symbols--sentiment-very-dissatisfied'} text-5xl {impostorCaught ? 'text-secondary' : 'text-error'}"></span>
					<h2 class="text-xl font-bold font-headline">
						{impostorCaught ? t('discord.impostorCaught') : t('discord.impostorEscaped')}
					</h2>
				{/if}
			</div>

			<div class="w-full grid grid-cols-2 gap-2">
				{#if impostorNames.length > 0}
					<div class="bg-surface-container rounded-xl p-3 text-center">
						<p class="text-on-surface-variant text-[10px] uppercase tracking-wider">{impostorNames.length === 1 ? t('results.impostor') : t('results.impostors')}</p>
						<p class="text-error font-bold text-sm">{impostorNames.join(', ')}</p>
					</div>
				{/if}

				{#each gameState.players.filter((p: any) => p.eliminated) as eliminated}
					<div class="bg-surface-container rounded-xl p-3 text-center">
						<p class="text-on-surface-variant text-[10px] uppercase tracking-wider">{t('discord.eliminated')}</p>
						<p class="text-on-surface font-bold text-sm">{eliminated.name}</p>
					</div>
				{/each}

				{#if game.type === 'fact'}
					{#if gameState.realFact}
						<div class="bg-surface-container rounded-xl p-3 text-center">
							<p class="text-on-surface-variant text-[10px] uppercase tracking-wider">{t('results.realFact')}</p>
							<p class="text-secondary font-bold text-xs">{gameState.realFact}</p>
						</div>
					{/if}
					{#if gameState.fakeFact}
						<div class="bg-surface-container rounded-xl p-3 text-center">
							<p class="text-on-surface-variant text-[10px] uppercase tracking-wider">{t('results.fakeFact')}</p>
							<p class="text-error font-bold text-xs">{gameState.fakeFact}</p>
						</div>
					{/if}
				{:else}
					<div class="bg-surface-container rounded-xl p-3 text-center">
						<p class="text-on-surface-variant text-[10px] uppercase tracking-wider">{t('results.word')}</p>
						<p class="text-secondary font-bold text-sm">{gameState.secretWord}</p>
					</div>
					{#if gameState.impostorWord}
						<div class="bg-surface-container rounded-xl p-3 text-center">
							<p class="text-on-surface-variant text-[10px] uppercase tracking-wider">{t('results.impostorHint')}</p>
							<p class="text-error font-bold text-sm">{gameState.impostorWord}</p>
						</div>
					{/if}
				{/if}
			</div>

			{#if isHost}
				<button onclick={playAgain}
					class="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold font-headline hover:brightness-110 active:scale-[0.98] transition-all">
					{t('discord.playAgain')}
				</button>
			{:else}
				<p class="text-on-surface-variant text-xs">{t('discord.waitingHost')}</p>
			{/if}

			<button onclick={goHome}
				class="text-on-surface-variant text-sm hover:text-on-surface transition-colors">
				{t('web.backHome')}
			</button>
		</div>
	{/if}
</div>
