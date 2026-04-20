<script lang="ts">
	import type { GameDef } from '$lib/games/registry';
	import { ROSCO_LETTERS, type LetterStatus, type PlayerRosco } from '$lib/games/rosco/types';
	import { haptic, hapticTap } from '$lib/haptics';
	import { t, getLocale } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import GameHero from '$lib/components/GameHero.svelte';

	let { data } = $props();
	let game: GameDef = $derived(data.game);

	// ── State ─────────────────────────────────────────────────────
	let phase = $state<'join' | 'connecting' | 'lobby' | 'playing' | 'results' | 'error'>('join');
	let errorMsg = $state('');
	let gameState = $state<any>(null);
	let myPlayerId = $state<string | null>(null);
	let hostUserId = $state<string | null>(null);
	let myUserId = $state<string | null>(null);
	let winners = $state<string[]>([]);

	// Config
	let configTimer = $state(120);

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

	// Playing state
	let answerInput = $state('');
	let answerInputEl: HTMLInputElement | undefined = $state(undefined);
	let lastResult: 'correct' | 'incorrect' | null = $state(null);

	// My rosco data
	let myRosco = $derived<PlayerRosco | null>(
		myPlayerId && gameState?.playerRoscos ? gameState.playerRoscos[myPlayerId] ?? null : null
	);
	let currentLetter = $derived(myRosco ? ROSCO_LETTERS[myRosco.currentLetterIdx] : null);
	let currentClue = $derived(
		currentLetter && gameState?.clues
			? gameState.clues.find((c: { letter: string }) => c.letter === currentLetter) ?? null
			: null
	);

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
			publicRooms = data.rooms?.filter((r: any) => r.gameId === 'rosco') ?? [];
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
				roomId: `web-rosco-${roomCode.toUpperCase()}`,
				discordUserId: myUserId,
				userName: userName.trim(),
				avatar: null,
				gameId: 'rosco',
				isPublic,
			}));
		};

		ws.onmessage = (event) => {
			const msg = JSON.parse(event.data);
			if (msg.type === 'state') {
				const prevPhase = gameState?.phase;
				gameState = msg.state;
				myPlayerId = msg.myRole?.playerId ?? null;
				hostUserId = msg.hostDiscordUserId;
				winners = msg.winners ?? [];

				const url = new URL(location.href);
				if (!url.searchParams.has('room')) {
					url.searchParams.set('room', roomCode);
					history.replaceState({}, '', url.toString());
				}

				if (gameState) {
					if (gameState.phase === 'lobby') {
						phase = 'lobby';
					} else if (gameState.phase === 'playing') {
						phase = 'playing';
						if (prevPhase !== 'playing') {
							haptic('success');
							queueMicrotask(() => answerInputEl?.focus());
						}
					} else if (gameState.phase === 'results') {
						phase = 'results';
						if (prevPhase !== 'results') haptic('success');
					}
				}
			} else if (msg.type === 'roscoResult') {
				lastResult = msg.correct ? 'correct' : 'incorrect';
				if (msg.correct) haptic('success'); else haptic('nudge');
				setTimeout(() => { lastResult = null; }, 800);
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
		send({ type: 'roscoStart', config: { timerSeconds: configTimer } });
		haptic('success');
	}

	function submitAnswer() {
		if (!answerInput.trim()) return;
		send({ type: 'roscoAnswer', answer: answerInput.trim() });
		answerInput = '';
		queueMicrotask(() => answerInputEl?.focus());
	}

	function passTurn() {
		send({ type: 'roscoPass' });
		hapticTap();
		queueMicrotask(() => answerInputEl?.focus());
	}

	function playAgain() {
		send({ type: 'playAgain' });
		winners = [];
		haptic('success');
	}

	function goHome() {
		ws?.close();
		goto('/');
	}

	function copyRoomLink() {
		const url = new URL(location.href);
		url.searchParams.set('room', roomCode);
		navigator.clipboard.writeText(url.toString());
		hapticTap();
	}

	// ── Helpers ───────────────────────────────────────────────────
	function formatTime(s: number): string {
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return `${m}:${sec.toString().padStart(2, '0')}`;
	}

	function statusColor(status: LetterStatus): string {
		switch (status) {
			case 'correct': return 'bg-green-500 text-white';
			case 'incorrect': return 'bg-red-500 text-white';
			case 'passed': return 'bg-amber-500 text-white';
			default: return 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30';
		}
	}

	function statusColorRing(status: LetterStatus): string {
		switch (status) {
			case 'correct': return 'stroke-green-500';
			case 'incorrect': return 'stroke-red-500';
			case 'passed': return 'stroke-amber-500';
			default: return 'stroke-surface-container-highest';
		}
	}

	const PLAYER_COLORS = ['#a855f7', '#ec4899', '#60a5fa', '#34d399', '#fbbf24', '#f97316', '#f43f5e', '#06b6d4'];

	// All players sorted by correct count for results
	let sortedResults = $derived(
		(gameState?.players ?? [])
			.map((p: { id: string; name: string }) => {
				const r = gameState?.playerRoscos?.[p.id];
				return { ...p, correct: r?.correctCount ?? 0, incorrect: r?.incorrectCount ?? 0, rosco: r };
			})
			.sort((a: { correct: number }, b: { correct: number }) => b.correct - a.correct)
	);
</script>

<svelte:head>
	<title>Rosco Veloz Online — Jugar Gratis | Viral Games</title>
	<meta name="description" content="Juega al Rosco Veloz online con amigos: cada jugador responde desde su dispositivo." />
</svelte:head>

<div class="min-h-dvh text-on-background flex flex-col">

<!-- ═══════════════ JOIN PHASE ═══════════════ -->
{#if phase === 'join'}
	<header class="fixed top-0 inset-x-0 z-50 backdrop-blur-lg bg-background/80 border-b border-outline-variant/10 flex items-center px-6 h-16">
		<a href="/" class="flex items-center gap-2" aria-label="Back">
			<span class="iconify material-symbols--arrow-back text-outline-variant"></span>
		</a>
		<span class="iconify material-symbols--circle text-pink-500 text-xl ml-3"></span>
		<span class="text-lg font-bold tracking-tighter text-pink-400 font-headline">ROSCO VELOZ</span>
		<span class="ml-2 px-2 py-0.5 text-[10px] bg-pink-500/20 text-pink-400 rounded-full font-bold uppercase">Online</span>
	</header>

	<main class="pt-20 pb-32 px-6 w-full min-h-dvh max-w-6xl mx-auto">
		<div class="lg:grid lg:grid-cols-[1fr_380px] lg:gap-12 lg:items-start">
			<!-- Left: Hero + Name input -->
			<div>
				<GameHero {game} isGreen={false} subtitle={t('web.onlineMultiplayer')} />

				<!-- Name input -->
				<div class="mb-6">
					<div class="flex items-center gap-2 mb-2">
						<span class="text-pink-400 font-headline text-sm tracking-[0.2em] uppercase font-bold">{t(`game.${game.id}.playerLabel`)}</span>
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
					<input type="checkbox" bind:checked={isPublic} class="accent-pink-500 w-5 h-5" />
				</label>

				<button
					onclick={createRoom}
					disabled={!userName.trim()}
					class="w-full lg:w-auto bg-linear-to-r from-purple-600 to-pink-500 text-white px-8 py-3.5 rounded-xl font-bold font-headline transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-40 disabled:cursor-not-allowed mb-8"
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
							class="flex-1 bg-surface-container rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-pink-500/50 text-center font-mono font-bold text-lg uppercase tracking-widest"
							oninput={(e) => { roomCode = (e.target as HTMLInputElement).value.toUpperCase(); }}
						/>
						<button
							type="submit"
							disabled={!userName.trim() || roomCode.length < 4}
							class="px-6 py-3 rounded-xl font-bold font-headline transition-all
								{userName.trim() && roomCode.length >= 4
									? 'bg-pink-500 text-white hover:brightness-110 active:scale-[0.98]'
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
					<span class="text-pink-400 font-headline text-sm tracking-[0.2em] uppercase font-bold">{t('web.publicRooms')}</span>
					<div class="h-px grow bg-outline-variant/20"></div>
					<button onclick={fetchPublicRooms} class="text-on-surface-variant hover:text-pink-400 transition-colors" aria-label="Refresh">
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
									<span class="font-mono font-bold text-pink-400 tracking-widest text-lg">{room.code}</span>
									<span class="text-xs text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-full">
										{room.playerCount} <span class="iconify material-symbols--person text-[10px] align-middle"></span>
									</span>
								</div>
								<div class="flex flex-wrap gap-1">
									{#each room.players as name}
										<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high/50 text-xs text-on-surface-variant">
											<span class="iconify material-symbols--person text-pink-500/60 text-[10px]"></span>
											{name}
										</span>
									{/each}
								</div>
								<div class="mt-2 text-xs text-pink-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
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
		<span class="iconify material-symbols--circle text-5xl text-pink-500 animate-pulse"></span>
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

<!-- ═══════════════ LOBBY ═══════════════ -->
{:else if phase === 'lobby' && gameState}
	<div class="flex flex-col gap-3 max-w-md mx-auto w-full flex-1 overflow-hidden p-3">
		<!-- Header -->
		<div class="flex items-center justify-between py-1">
			<button onclick={goHome} class="text-on-surface-variant hover:text-on-surface transition-colors" aria-label="Back">
				<span class="iconify material-symbols--arrow-back text-xl"></span>
			</button>
			<div class="text-center">
				<h1 class="text-xl font-bold font-headline tracking-tight inline-flex items-center gap-2">
					<span class="iconify material-symbols--circle text-2xl text-pink-500"></span>
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
				<span class="text-3xl font-bold font-mono tracking-[0.3em] text-pink-400">{roomCode}</span>
				<button onclick={copyRoomLink}
					class="w-8 h-8 rounded-full bg-surface-container-high/60 flex items-center justify-center text-on-surface-variant hover:text-pink-400 transition-colors"
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
						<span class="iconify material-symbols--person text-pink-500 text-sm"></span>
						<span class="text-on-surface font-medium">{player.name}</span>
					</span>
				{/each}
			</div>
		</div>

		<!-- Config (host only) -->
		{#if isHost}
			<div class="bg-surface-container rounded-xl p-4">
				<div class="flex items-center gap-2 mb-3">
					<span class="iconify material-symbols--timer text-pink-400"></span>
					<span class="text-sm font-headline font-bold text-on-surface uppercase tracking-wider">Tiempo</span>
				</div>
				<div class="flex items-center gap-3">
					<input type="range" min="60" max="300" step="30" bind:value={configTimer} class="grow accent-pink-500" />
					<span class="text-on-surface font-mono font-bold text-sm w-12 text-right">{formatTime(configTimer)}</span>
				</div>
			</div>

			<button
				onclick={startGame}
				disabled={gameState.players.length < 1}
				class="w-full py-2.5 rounded-xl font-bold font-headline transition-all shrink-0
					{gameState.players.length >= 1
						? 'bg-linear-to-r from-purple-600 to-pink-500 text-white hover:brightness-110 active:scale-[0.98]'
						: 'bg-surface-container-highest text-on-surface-variant/50 cursor-not-allowed'}"
			>
				{gameState.players.length < 1
				? 'Esperando jugadores…'
				: t('discord.letsGo')}
			</button>
		{:else}
			<div class="flex-1 flex flex-col items-center justify-center">
				<span class="iconify material-symbols--hourglass-top text-2xl text-on-surface-variant/50 mb-1"></span>
				<p class="text-on-surface-variant text-sm">{t('discord.waitingHost')}</p>
			</div>
		{/if}
	</div>

<!-- ═══════════════ PLAYING ═══════════════ -->
{:else if phase === 'playing' && gameState && myPlayerId}
	<!-- Fixed header -->
	<header class="fixed top-0 w-full z-50 flex items-center justify-between px-4 h-14 bg-background/90 border-b border-outline-variant/20" style="backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)">
		<div class="w-8"></div>
		<span class="font-headline font-bold text-on-surface tracking-tight text-sm">
			<span class="iconify material-symbols--circle text-pink-500 mr-1 align-middle"></span>
			ROSCO VELOZ
			<span class="ml-1 px-1.5 py-0.5 text-[9px] bg-pink-500/20 text-pink-400 rounded-full font-bold uppercase">Online</span>
		</span>
		<div class="w-8"></div>
	</header>

	<main class="pt-16 pb-32 px-4 w-full min-h-dvh max-w-lg mx-auto">
		<!-- Timer bar -->
		<div class="mb-4 flex items-center justify-center gap-2">
			<span class="iconify material-symbols--timer text-pink-400 text-lg"></span>
			<span class="font-headline font-bold text-lg {gameState.timerRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-on-surface'}">
				{formatTime(gameState.timerRemaining)}
			</span>
		</div>

		<!-- Rosco wheel (my letters) -->
		{#if myRosco}
			<div class="relative mx-auto mb-6" style="width: min(340px, 90vw); height: min(340px, 90vw)">
				<svg viewBox="0 0 340 340" class="w-full h-full">
					{#each ROSCO_LETTERS as letter, i}
						{@const angle = (i / 27) * 2 * Math.PI - Math.PI / 2}
						{@const cx = 170 + 145 * Math.cos(angle)}
						{@const cy = 170 + 145 * Math.sin(angle)}
						{@const status = myRosco.statuses[letter] ?? 'pending'}
						{@const isCurrent = myRosco.currentLetterIdx === i && !myRosco.finished}

						<circle
							cx={cx} cy={cy} r={isCurrent ? 17 : 14}
							class="{statusColorRing(status)} transition-all duration-200"
							fill="none"
							stroke-width={isCurrent ? 3 : 1.5}
						/>
						<circle
							cx={cx} cy={cy} r={isCurrent ? 15 : 12.5}
							class="transition-all duration-200"
							fill={status === 'correct' ? '#22c55e' : status === 'incorrect' ? '#ef4444' : status === 'passed' ? '#eab308' : isCurrent ? '#a855f7' : '#25252c'}
						/>
						<text
							x={cx} y={cy}
							text-anchor="middle"
							dominant-baseline="central"
							class="font-bold select-none pointer-events-none"
							fill={status !== 'pending' || isCurrent ? 'white' : '#9ca3af'}
							font-size={isCurrent ? '14' : '11'}
						>{letter}</text>

						{#if isCurrent}
							<circle
								cx={cx} cy={cy} r="20"
								fill="none"
								stroke="#a855f7"
								stroke-width="2"
								opacity="0.5"
								class="animate-ping"
								style="transform-origin: {cx}px {cy}px"
							/>
						{/if}
					{/each}

					<!-- Center stats -->
					<text x="170" y="148" text-anchor="middle" fill="#22c55e" font-size="28" class="font-bold">{myRosco.correctCount}</text>
					<text x="170" y="168" text-anchor="middle" fill="#9ca3af" font-size="10" class="uppercase">{t('rosco.correct')}</text>
					<text x="140" y="200" text-anchor="middle" fill="#ef4444" font-size="18" class="font-bold">{myRosco.incorrectCount}</text>
					<text x="200" y="200" text-anchor="middle" fill="#eab308" font-size="18" class="font-bold">
						{Object.values(myRosco.statuses).filter(s => s === 'pending' || s === 'passed').length}
					</text>
					<text x="140" y="215" text-anchor="middle" fill="#9ca3af" font-size="8" class="uppercase">{t('rosco.incorrect')}</text>
					<text x="200" y="215" text-anchor="middle" fill="#9ca3af" font-size="8" class="uppercase">{t('rosco.pending')}</text>
				</svg>
			</div>

			<!-- Clue card -->
			{#if currentClue && currentLetter && !myRosco.finished}
				<div class="glass-panel rounded-2xl p-5 border border-outline-variant/10 mb-4">
					<div class="flex items-center gap-2 mb-3">
						<span class="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-lg flex items-center justify-center font-headline">{currentLetter}</span>
						<span class="text-sm text-on-surface-variant font-medium">
							{currentClue.contains ? t('rosco.contains', { letter: currentLetter }) : t('rosco.startsWith', { letter: currentLetter })}
						</span>
					</div>
					<p class="text-on-surface text-lg font-medium leading-relaxed">{currentClue.clue}</p>
				</div>

				<!-- Answer input -->
				<form onsubmit={(e) => { e.preventDefault(); submitAnswer(); }} class="flex gap-2 mb-3">
					<input
						bind:this={answerInputEl}
						bind:value={answerInput}
						placeholder="Tu respuesta..."
						class="grow px-4 py-3 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface font-medium placeholder:text-on-surface-variant/40 focus:outline-none focus:border-purple-500/50 transition-colors {lastResult === 'correct' ? 'border-green-500/60 bg-green-500/10' : lastResult === 'incorrect' ? 'border-red-500/60 bg-red-500/10' : ''}"
						autocomplete="off"
						autocapitalize="characters"
					/>
					<button
						type="submit"
						disabled={!answerInput.trim()}
						class="px-5 py-3 rounded-xl bg-purple-600 text-white font-bold font-headline uppercase tracking-wider active:scale-95 transition-all disabled:opacity-40"
					>
						{t('rosco.submit')}
					</button>
				</form>

				<!-- Pass button -->
				<button
					onclick={passTurn}
					class="w-full py-3 rounded-xl bg-surface-container-high border border-outline-variant/20 text-amber-400 font-headline font-bold uppercase tracking-wider active:scale-95 transition-all hover:bg-surface-container-highest"
				>
					{t('rosco.pass')}
				</button>
			{:else if myRosco.finished}
				<div class="glass-panel rounded-2xl p-6 border border-outline-variant/10 text-center">
					<span class="iconify material-symbols--check-circle text-green-500 text-4xl mb-2"></span>
					<p class="text-on-surface font-bold text-lg">¡Has terminado!</p>
					<p class="text-on-surface-variant text-sm mt-1">{myRosco.correctCount} {t('rosco.correct')}</p>
					<p class="text-on-surface-variant text-xs mt-2">Esperando a los demás jugadores…</p>
				</div>
			{/if}
		{/if}

		<!-- All players scoreboard strip -->
		{#if gameState.players.length > 1}
			<div class="flex gap-2 mt-6 overflow-x-auto pb-2">
				{#each gameState.players as player, i}
					{@const r = gameState.playerRoscos[player.id]}
					{@const isMe = player.id === myPlayerId}
					<div
						class="shrink-0 px-3 py-2 rounded-xl border transition-all text-center min-w-20
							{isMe ? 'border-purple-500/50 bg-purple-500/10' : 'border-outline-variant/10 bg-surface-container-high'}"
					>
						<div class="w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-white text-xs font-bold" style="background: {PLAYER_COLORS[i % PLAYER_COLORS.length]}">{player.name[0].toUpperCase()}</div>
						<p class="text-xs font-bold text-on-surface truncate">{player.name}</p>
						<p class="text-xs text-green-400 font-bold">{r?.correctCount ?? 0}</p>
						{#if r?.finished}
							<span class="text-[10px] text-on-surface-variant">✓</span>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</main>

<!-- ═══════════════ RESULTS ═══════════════ -->
{:else if phase === 'results' && gameState}
	<!-- Fixed header -->
	<header class="fixed top-0 w-full z-50 flex items-center justify-between px-4 h-14 bg-background/90 border-b border-outline-variant/20" style="backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)">
		<button onclick={goHome} class="flex items-center gap-1 text-on-surface-variant text-sm" aria-label="Volver">
			<span class="iconify material-symbols--arrow-back text-lg"></span>
		</button>
		<span class="font-headline font-bold text-on-surface tracking-tight text-sm">
			<span class="iconify material-symbols--circle text-pink-500 mr-1 align-middle"></span>
			ROSCO VELOZ
		</span>
		<div class="w-8"></div>
	</header>

	<main class="pt-16 pb-32 px-4 w-full min-h-dvh max-w-lg mx-auto">
		<div class="max-w-lg mx-auto text-center">
			<!-- Winner banner -->
			<div class="mb-8 pt-6">
				{#if winners.length > 0}
					<div class="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 mb-4">
						<span class="iconify material-symbols--emoji-events text-amber-400 text-lg"></span>
						<span class="text-amber-400 font-headline font-bold text-sm uppercase tracking-wider">{t('rosco.winner')}</span>
					</div>
					<h2 class="font-headline text-3xl font-bold text-on-surface">
						{winners.join(', ')}
					</h2>
				{/if}
			</div>

			<!-- Score cards -->
			<div class="flex flex-col gap-3 mb-8">
				{#each sortedResults as player, i}
					{@const isWinner = winners.includes(player.name)}
					<div class="flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all {isWinner ? 'border-amber-500/30 bg-amber-500/5' : 'border-outline-variant/10 bg-surface-container-high'}">
						<span class="text-2xl font-headline font-bold {isWinner ? 'text-amber-400' : 'text-on-surface-variant'}">{i + 1}</span>
						<div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style="background: {PLAYER_COLORS[gameState.players.findIndex((p: { id: string }) => p.id === player.id) % PLAYER_COLORS.length]}">
							{player.name[0].toUpperCase()}
						</div>
						<div class="grow text-left">
							<p class="font-bold text-on-surface text-lg">{player.name}</p>
							<div class="flex gap-3 text-xs mt-0.5">
								<span class="text-green-400 font-bold">{player.correct} {t('rosco.correct')}</span>
								<span class="text-red-400">{player.incorrect} {t('rosco.incorrect')}</span>
							</div>
						</div>
						{#if isWinner}
							<span class="iconify material-symbols--emoji-events text-amber-400 text-2xl"></span>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Detailed letter results -->
			{#each sortedResults as player}
				<div class="mb-6">
					<h3 class="font-headline font-bold text-on-surface mb-3 text-left">{player.name}</h3>
					<div class="flex flex-wrap gap-1.5 justify-center">
						{#each ROSCO_LETTERS as letter}
							{@const status = player.rosco?.statuses[letter] ?? 'pending'}
							<div class="w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center {statusColor(status)}">
								{letter}
							</div>
						{/each}
					</div>
				</div>
			{/each}

			<!-- Actions -->
			<div class="flex flex-col gap-3 mt-8">
				{#if isHost}
					<button
						onclick={playAgain}
						class="w-full py-4 rounded-xl bg-linear-to-r from-purple-600 to-pink-500 text-white font-headline font-bold text-lg uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-3"
					>
						<span class="iconify material-symbols--replay text-xl"></span>
						Jugar de nuevo
					</button>
				{:else}
					<p class="text-on-surface-variant text-sm">{t('discord.waitingHost')}</p>
				{/if}
				<button
					onclick={goHome}
					class="w-full py-3 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface font-headline font-bold uppercase tracking-wider active:scale-95 transition-all"
				>
					Volver al inicio
				</button>
			</div>
		</div>
	</main>
{/if}

</div>

<style>
	@keyframes ping {
		0% { transform: scale(1); opacity: 0.5; }
		75%, 100% { transform: scale(1.4); opacity: 0; }
	}
	.animate-ping {
		animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
	}
</style>
