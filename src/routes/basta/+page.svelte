<script lang="ts">
	import type { GameDef } from '$lib/games/registry';
	import { haptic, hapticTap } from '$lib/haptics';
	import { t, getLocale } from '$lib/i18n';
	import { getGameSeo } from '$lib/games/seo';
	import { goto } from '$app/navigation';
	import { beforeNavigate } from '$app/navigation';
	import { setActiveGame } from '$lib/active-game';
	import { page } from '$app/state';
	import { browser } from '$app/environment';

	let { data } = $props();
	let game: GameDef = $derived(data.game);

	// ── State ─────────────────────────────────────────────────────
	let phase = $state<'join' | 'connecting' | 'lobby' | 'playing' | 'voting' | 'scores' | 'results' | 'error'>('join');
	let errorMsg = $state('');
	let gameState = $state<any>(null);
	let myPlayerId = $state<string | null>(null);
	let hostUserId = $state<string | null>(null);
	let myUserId = $state<string | null>(null);
	let winners = $state<string[]>([]);

	// Join form
	let userName = $state('');
	let roomCode = $state('');

	// Public rooms
	let publicRooms = $state<{ code: string; playerCount: number; hostName: string; players: string[] }[]>([]);
	let loadingRooms = $state(true);
	let roomsLoaded = $state(false);

	// Room visibility
	let isPublic = $state(false);

	// Config
	let configTimer = $state(60);
	let configRounds = $state(3);

	// Playing phase: local answers
	let myAnswers = $state<Record<string, string>>({});
	let answersSubmitted = $state(false);

	// Voting phase: track my votes
	let myVotes = $state<Record<string, Record<string, boolean>>>({});

	let ws: WebSocket | null = null;

	const isHost = $derived(myUserId === hostUserId);

	// ── View transition ───────────────────────────────────────────
	let heroTitleEl = $state<HTMLElement | undefined>(undefined);
	let heroIconEl = $state<HTMLElement | undefined>(undefined);

	beforeNavigate(() => {
		setActiveGame(game.id);
		if (heroTitleEl) heroTitleEl.style.viewTransitionName = 'game-title';
		if (heroIconEl) heroIconEl.style.viewTransitionName = 'game-icon';
	});

	// Read room code from URL if present
	$effect(() => {
		const urlRoom = page.url.searchParams.get('room');
		if (urlRoom && !roomCode) {
			roomCode = urlRoom.toUpperCase();
		}
	});

	// Fetch public rooms on mount and periodically
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
			publicRooms = data.rooms?.filter((r: any) => r.gameId === 'basta') ?? [];
		} catch {
			// Silently fail — rooms list is optional
		} finally {
			loadingRooms = false;
			roomsLoaded = true;
		}
	}

	// ── User ID persistence ───────────────────────────────────────
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
		for (let i = 0; i < 4; i++) {
			code += chars[Math.floor(Math.random() * chars.length)];
		}
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
				roomId: `web-basta-${roomCode.toUpperCase()}`,
				discordUserId: myUserId,
				userName: userName.trim(),
				avatar: null,
				gameId: 'basta',
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

				// Update URL with room code for sharing
				const url = new URL(location.href);
				if (!url.searchParams.has('room')) {
					url.searchParams.set('room', roomCode);
					history.replaceState({}, '', url.toString());
				}

				if (gameState) {
					if (gameState.phase === 'lobby') {
						phase = 'lobby';
						answersSubmitted = false;
						myAnswers = {};
						myVotes = {};
					} else if (gameState.phase === 'playing') {
						if (prevPhase !== 'playing') {
							answersSubmitted = false;
							myAnswers = {};
							myVotes = {};
						}
						phase = 'playing';
					} else if (gameState.phase === 'voting') {
						phase = 'voting';
						if (prevPhase !== 'voting') haptic('nudge');
					} else if (gameState.phase === 'scores') {
						phase = 'scores';
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
		if (ws?.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(msg));
		}
	}

	function startGame() {
		send({ type: 'config', config: { timerSeconds: configTimer, totalRounds: configRounds } });
		send({ type: 'start' });
		haptic('success');
	}

	function submitMyAnswers() {
		send({ type: 'bastaSubmitAnswers', answers: myAnswers });
		answersSubmitted = true;
		hapticTap();
	}

	function pressStop() {
		send({ type: 'bastaStop' });
		haptic('nudge');
	}

	function submitVote(targetPlayerId: string, category: string, valid: boolean) {
		if (!myVotes[targetPlayerId]) myVotes[targetPlayerId] = {};
		myVotes[targetPlayerId][category] = valid;
		myVotes = { ...myVotes };
		send({ type: 'bastaVote', targetPlayerId, category, valid });
		hapticTap();
	}

	function nextRound() {
		send({ type: 'bastaNextRound' });
		haptic('success');
	}

	function playAgain() {
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

	function getPlayerAnswer(playerId: string, category: string): string {
		const pa = gameState?.answers?.find((a: any) => a.playerId === playerId);
		return pa?.answers?.[category]?.trim() ?? '';
	}

	function copyRoomLink() {
		const url = new URL(location.href);
		url.searchParams.set('room', roomCode);
		navigator.clipboard.writeText(url.toString());
		hapticTap();
	}

	let seo = $derived(getGameSeo('basta', getLocale()));
</script>

<svelte:head>
	<title>¡Basta! — Jugar Gratis Online | Viral Games</title>
	{#if seo}
		<meta name="description" content={seo.description} />
	{/if}
	{#if seo && seo.faqs.length > 0}
		{@html `<script type="application/ld+json">${JSON.stringify({
			"@context": "https://schema.org",
			"@type": "FAQPage",
			mainEntity: seo.faqs.map(f => ({
				"@type": "Question",
				name: f.question,
				acceptedAnswer: { "@type": "Answer", text: f.answer }
			}))
		})}</script>`}
	{/if}
</svelte:head>

<div class="min-h-dvh text-on-background flex flex-col">

	<!-- ═══════════════ JOIN PHASE — Hero + Room Browser ═══════════════ -->
	{#if phase === 'join'}
		<!-- Header bar -->
		<header class="fixed top-0 inset-x-0 z-50 backdrop-blur-lg bg-background/80 border-b border-outline-variant/10 flex items-center px-6 h-16">
			<a href="/" class="flex items-center gap-2" aria-label="Back">
				<span class="iconify material-symbols--arrow-back text-outline-variant"></span>
			</a>
			<span class="iconify material-symbols--edit-note text-amber-500 text-xl ml-3"></span>
			<span class="text-lg font-bold tracking-tighter text-amber-500 font-headline">¡BASTA!</span>
		</header>

		<main class="pt-20 pb-32 px-6 w-full min-h-dvh max-w-6xl mx-auto">
			<div class="lg:grid lg:grid-cols-[1fr_380px] lg:gap-12 lg:items-start">
				<!-- Left: Hero + Name input -->
				<div>
					<!-- Hero -->
					<div class="flex flex-col items-center lg:items-start text-center lg:text-left mb-10 relative">
						<div class="relative mb-8">
							<div class="absolute -inset-8 bg-amber-500/20 blur-3xl rounded-full"></div>
							<div bind:this={heroIconEl} class="relative w-32 h-32 rounded-full border-2 border-outline-variant/20 flex items-center justify-center bg-surface-container-low shadow-2xl" style="view-transition-name: game-icon">
								<span class="iconify material-symbols--edit-note text-6xl text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"></span>
							</div>
						</div>
						<p class="text-amber-500 font-headline uppercase tracking-[0.4em] text-xs font-bold">{t('web.bastaSubtitle')}</p>
						<h1 bind:this={heroTitleEl} class="text-4xl lg:text-5xl font-headline font-extrabold tracking-tighter mt-2" style="view-transition-name: game-title">
							{@html game.heroTitleHtml}
						</h1>
						<p class="text-on-surface-variant max-w-xs text-sm font-light leading-relaxed mt-3">{t('game.basta.heroDescription')}</p>
					</div>

					<!-- Name input -->
					<div class="mb-6">
						<div class="flex items-center gap-2 mb-2">
							<span class="text-amber-500 font-headline text-sm tracking-[0.2em] uppercase font-bold">{t('game.basta.playerLabel')}</span>
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
									placeholder={t('web.enterName')}
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
						<input type="checkbox" bind:checked={isPublic} class="accent-amber-500 w-5 h-5" />
					</label>

					<!-- Create Room button -->
					<button
						onclick={createRoom}
						disabled={!userName.trim()}
						class="w-full lg:w-auto bg-linear-to-r from-amber-600 to-amber-500 text-black px-8 py-3.5 rounded-xl font-bold font-headline transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-40 disabled:cursor-not-allowed mb-8"
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
								class="flex-1 bg-surface-container rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-amber-500/50 text-center font-mono font-bold text-lg uppercase tracking-widest"
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
						<span class="text-amber-500 font-headline text-sm tracking-[0.2em] uppercase font-bold">{t('web.publicRooms')}</span>
						<div class="h-px grow bg-outline-variant/20"></div>
						<button onclick={fetchPublicRooms} class="text-on-surface-variant hover:text-amber-500 transition-colors" aria-label="Refresh">
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
										<span class="font-mono font-bold text-amber-500 tracking-widest text-lg">{room.code}</span>
										<span class="text-xs text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-full">
											{room.playerCount} <span class="iconify material-symbols--person text-[10px] align-middle"></span>
										</span>
									</div>
									<div class="flex flex-wrap gap-1">
										{#each room.players as name}
											<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high/50 text-xs text-on-surface-variant">
												<span class="iconify material-symbols--person text-amber-500/60 text-[10px]"></span>
												{name}
											</span>
										{/each}
									</div>
									<div class="mt-2 text-xs text-amber-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
										{t('web.tapToJoin')} →
									</div>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- SEO Content & FAQs -->
			{#if seo}
				<section class="max-w-2xl mx-auto px-4 pb-12 pt-8 space-y-8">
					<div class="text-on-surface-variant text-sm leading-relaxed">
						<p>{seo.description}</p>
					</div>
					{#if seo.faqs.length > 0}
						<div class="space-y-3">
							<h2 class="font-headline text-lg font-bold text-on-surface">{getLocale() === 'en' ? 'Frequently Asked Questions' : 'Preguntas Frecuentes'}</h2>
							{#each seo.faqs as faq}
								<details class="group bg-surface-container-high rounded-xl border border-outline-variant/10">
									<summary class="cursor-pointer p-4 font-bold text-on-surface text-sm flex items-center justify-between">
										{faq.question}
										<span class="iconify material-symbols--expand-more text-on-surface-variant transition-transform group-open:rotate-180"></span>
									</summary>
									<div class="px-4 pb-4 text-on-surface-variant text-sm leading-relaxed">{faq.answer}</div>
								</details>
							{/each}
						</div>
					{/if}
				</section>
			{/if}
		</main>

	<!-- Connecting -->
	{:else if phase === 'connecting'}
		<div class="flex-1 flex flex-col items-center justify-center gap-3 p-3">
			<span class="iconify material-symbols--edit-note text-5xl text-amber-500 animate-pulse"></span>
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
						<span class="iconify material-symbols--edit-note text-2xl text-amber-500"></span>
						<span class="text-transparent bg-clip-text bg-linear-to-r from-amber-500 to-amber-300">¡BASTA!</span>
					</h1>
					<p class="text-on-surface-variant text-xs">{t('discord.playersCount', { count: gameState.players.length })}</p>
				</div>
				<div class="w-6"></div>
			</div>

			<!-- Room code + share -->
			<div class="bg-surface-container rounded-xl p-3 text-center">
				<p class="text-xs text-on-surface-variant uppercase tracking-wider mb-1">{t('web.shareCode')}</p>
				<div class="flex items-center justify-center gap-3">
					<span class="text-3xl font-bold font-mono tracking-[0.3em] text-amber-500">{roomCode}</span>
					<button onclick={copyRoomLink}
						class="w-8 h-8 rounded-full bg-surface-container-high/60 flex items-center justify-center text-on-surface-variant hover:text-amber-500 transition-colors"
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
							<span class="iconify material-symbols--person text-amber-500 text-sm"></span>
							<span class="text-on-surface font-medium">{player.name}</span>
						</span>
					{/each}
				</div>
			</div>

			<!-- Config (host only) -->
			{#if isHost}
				<div class="bg-surface-container rounded-xl p-3 flex flex-col gap-3 min-h-0 overflow-y-auto">
					<div class="flex items-center gap-4">
						<div class="flex items-center gap-2 flex-1">
							<span class="text-xs text-on-surface-variant font-medium">{t('basta.timer')}</span>
							<span class="text-amber-500 font-bold text-sm ml-auto">{formatTime(configTimer)}</span>
						</div>
						<div class="w-px h-6 bg-outline-variant/20"></div>
						<div class="flex items-center gap-2 flex-1">
							<span class="text-xs text-on-surface-variant font-medium">{t('basta.rounds')}</span>
							<div class="flex items-center gap-1.5 ml-auto">
								<button onclick={() => { configRounds = Math.max(1, configRounds - 1); hapticTap(); }} class="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant text-xs hover:bg-surface-container-high">−</button>
								<span class="text-amber-500 font-bold w-4 text-center text-sm">{configRounds}</span>
								<button onclick={() => { configRounds = Math.min(10, configRounds + 1); hapticTap(); }} class="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant text-xs hover:bg-surface-container-high">+</button>
							</div>
						</div>
					</div>
					<input type="range" min={30} max={120} step={10} bind:value={configTimer}
						class="w-full accent-amber-500 h-1" />
				</div>

				<button
					onclick={startGame}
					disabled={gameState.players.length < 2}
					class="w-full py-2.5 rounded-xl font-bold font-headline transition-all shrink-0
						{gameState.players.length >= 2
							? 'bg-amber-500 text-black hover:brightness-110 active:scale-[0.98]'
							: 'bg-surface-container-highest text-on-surface-variant/50 cursor-not-allowed'}"
				>
					{gameState.players.length < 2
					? t('basta.minPlayers')
					: t('discord.letsGo')}
				</button>
			{:else}
				<div class="flex-1 flex flex-col items-center justify-center">
					<span class="iconify material-symbols--hourglass-top text-2xl text-on-surface-variant/50 mb-1"></span>
					<p class="text-on-surface-variant text-sm">{t('discord.waitingHost')}</p>
				</div>
			{/if}
		</div>

	<!-- Playing: fill in answers -->
	{:else if phase === 'playing' && gameState}
		<div class="flex flex-col gap-3 max-w-md mx-auto w-full flex-1 overflow-hidden p-3">
			<div class="flex items-center justify-between py-1">
				<p class="text-xs text-on-surface-variant">{t('basta.round', { current: gameState.currentRound, total: gameState.config.totalRounds })}</p>
				<div class="flex items-center gap-2">
					<span class="text-2xl font-bold font-headline {gameState.timerRemaining <= 10 ? 'text-error animate-pulse' : 'text-amber-500'}">
						{formatTime(gameState.timerRemaining)}
					</span>
				</div>
			</div>

			<div class="bg-surface-container rounded-xl p-4 text-center">
				<p class="text-xs text-on-surface-variant uppercase tracking-wider mb-1">{t('basta.letter')}</p>
				<p class="text-6xl font-bold font-headline text-amber-500">{gameState.currentLetter}</p>
			</div>

			<div class="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0">
				{#each gameState.categories as category}
					<div class="bg-surface-container rounded-lg p-2.5 flex items-center gap-2">
						<span class="text-xs text-on-surface-variant font-medium w-20 shrink-0 truncate">{category}</span>
						<input
							type="text"
							placeholder="{gameState.currentLetter}..."
							bind:value={myAnswers[category]}
							disabled={answersSubmitted}
							class="flex-1 bg-surface-container-highest rounded-lg px-2.5 py-1.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 focus:ring-amber-500/50 disabled:opacity-50"
						/>
						{#if answersSubmitted}
							<span class="iconify material-symbols--check-circle text-green-500 text-lg"></span>
						{/if}
					</div>
				{/each}
			</div>

			<div class="flex gap-2 shrink-0">
				{#if !answersSubmitted}
					<button
						onclick={submitMyAnswers}
						class="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-bold font-headline hover:brightness-110 active:scale-[0.98] transition-all"
					>
						{t('basta.answered')}
					</button>
				{:else}
					<div class="flex-1 py-2.5 rounded-xl bg-surface-container text-on-surface-variant text-center text-sm font-medium flex items-center justify-center gap-1.5">
						<span class="iconify material-symbols--check-circle text-green-500"></span>
						{t('basta.waiting')}
					</div>
				{/if}
				<button
					onclick={pressStop}
					class="px-6 py-2.5 rounded-xl bg-error text-on-error font-bold font-headline hover:brightness-110 active:scale-[0.98] transition-all"
				>
					{t('basta.stop')}
				</button>
			</div>
		</div>

	<!-- Voting: validate other players' answers -->
	{:else if phase === 'voting' && gameState}
		<div class="flex flex-col gap-3 max-w-md mx-auto w-full flex-1 overflow-hidden p-3">
			<div class="text-center py-1">
				<span class="iconify material-symbols--how-to-vote text-3xl text-amber-500"></span>
				<h2 class="text-lg font-bold font-headline">{t('basta.validateAnswers')}</h2>
				<p class="text-xs text-on-surface-variant">{t('basta.round', { current: gameState.currentRound, total: gameState.config.totalRounds })}</p>
			</div>

			<div class="bg-surface-container rounded-lg p-2 text-center">
				<span class="text-xs text-on-surface-variant">{t('basta.letter')}:</span>
				<span class="text-amber-500 font-bold text-lg ml-1">{gameState.currentLetter}</span>
			</div>

			<div class="flex-1 overflow-y-auto flex flex-col gap-3 min-h-0">
				{#each gameState.players.filter((p: any) => p.id !== myPlayerId) as player}
					<div class="bg-surface-container rounded-xl p-3">
						<div class="flex items-center gap-2 mb-2">
							<span class="iconify material-symbols--person text-amber-500"></span>
							<span class="font-medium text-sm text-on-surface">{player.name}</span>
						</div>

						{#each gameState.categories as category}
							{@const answer = getPlayerAnswer(player.id, category)}
							{@const voted = myVotes[player.id]?.[category] !== undefined}
							{@const isValid = myVotes[player.id]?.[category]}
							<div class="flex items-center gap-2 py-1.5 border-b border-outline-variant/10 last:border-0">
								<span class="text-xs text-on-surface-variant w-16 shrink-0 truncate">{category}</span>
								<span class="flex-1 text-sm font-medium {answer ? 'text-on-surface' : 'text-on-surface-variant/40 italic'}">
									{answer || t('basta.empty')}
								</span>
								{#if answer}
									<div class="flex gap-1">
										<button
											onclick={() => submitVote(player.id, category, true)}
											class="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all
												{voted && isValid ? 'bg-green-500 text-white' : 'bg-surface-container-highest text-on-surface-variant hover:bg-green-500/20'}"
										>
											✓
										</button>
										<button
											onclick={() => submitVote(player.id, category, false)}
											class="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all
												{voted && !isValid ? 'bg-error text-on-error' : 'bg-surface-container-highest text-on-surface-variant hover:bg-error/20'}"
										>
											✗
										</button>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/each}
			</div>
		</div>

	<!-- Scores: round results -->
	{:else if phase === 'scores' && gameState}
		<div class="flex flex-col gap-3 max-w-md mx-auto w-full flex-1 overflow-hidden p-3">
			<div class="text-center py-1">
				<span class="iconify material-symbols--scoreboard text-3xl text-amber-500"></span>
				<h2 class="text-lg font-bold font-headline">{t('basta.roundScores')}</h2>
				<p class="text-xs text-on-surface-variant">{t('basta.round', { current: gameState.currentRound, total: gameState.config.totalRounds })}</p>
			</div>

			<div class="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0">
				{#each [...(gameState.roundScores ?? [])].sort((a, b) => b.points - a.points) as score}
					{@const player = gameState.players.find((p: any) => p.id === score.playerId)}
					<div class="bg-surface-container rounded-xl p-3">
						<div class="flex items-center justify-between mb-2">
							<div class="flex items-center gap-2">
								<span class="iconify material-symbols--person text-amber-500"></span>
								<span class="font-medium text-sm">{player?.name ?? '?'}</span>
							</div>
							<span class="text-amber-500 font-bold text-lg font-headline">{score.points} {t('basta.points')}</span>
						</div>
						<div class="flex flex-wrap gap-1">
							{#each gameState.categories as category}
								{@const pts = score.breakdown?.[category] ?? 0}
								<span class="px-2 py-0.5 rounded-full text-[10px] font-medium
									{pts === 100 ? 'bg-green-500/20 text-green-500' : pts === 50 ? 'bg-amber-500/20 text-amber-500' : 'bg-surface-container-highest text-on-surface-variant/50'}">
									{category}: {pts}
								</span>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			<!-- Total scores -->
			<div class="bg-surface-container rounded-xl p-3 shrink-0">
				<p class="text-xs text-on-surface-variant font-medium mb-1.5 uppercase tracking-wider">{t('basta.totalScores')}</p>
				<div class="flex flex-wrap gap-2">
					{#each [...gameState.players].sort((a, b) => (gameState.totalScores[b.id] ?? 0) - (gameState.totalScores[a.id] ?? 0)) as player}
						<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high/50 text-sm">
							<span class="text-on-surface font-medium">{player.name}</span>
							<span class="text-amber-500 font-bold">{gameState.totalScores[player.id] ?? 0}</span>
						</span>
					{/each}
				</div>
			</div>

			{#if isHost}
				<button onclick={nextRound}
					class="w-full py-2.5 rounded-xl bg-amber-500 text-black font-bold font-headline hover:brightness-110 active:scale-[0.98] transition-all shrink-0">
					{gameState.currentRound >= gameState.config.totalRounds ? t('basta.finalResults') : t('basta.nextRound')}
				</button>
			{:else}
				<p class="text-on-surface-variant text-xs text-center">{t('discord.waitingHost')}</p>
			{/if}
		</div>

	<!-- Final Results -->
	{:else if phase === 'results' && gameState}
		<div class="flex-1 flex flex-col items-center justify-center gap-4 max-w-md mx-auto w-full">
			<div class="text-center">
				<span class="iconify material-symbols--trophy text-5xl text-amber-500"></span>
				<h2 class="text-2xl font-bold font-headline mt-2">
					{winners.length > 1 ? t('basta.winners') : t('basta.winner')}
				</h2>
				<p class="text-amber-500 font-bold text-xl font-headline mt-1">
					{winners.join(', ')}
				</p>
				{#if winners.length > 1}
					<p class="text-on-surface-variant text-xs mt-0.5">{t('basta.tie')}</p>
				{/if}
			</div>

			<div class="w-full bg-surface-container rounded-xl p-3">
				<p class="text-xs text-on-surface-variant font-medium mb-2 uppercase tracking-wider">{t('basta.totalScores')}</p>
				<div class="flex flex-col gap-1.5">
					{#each [...gameState.players].sort((a, b) => (gameState.totalScores[b.id] ?? 0) - (gameState.totalScores[a.id] ?? 0)) as player, i}
						{@const score = gameState.totalScores[player.id] ?? 0}
						<div class="flex items-center gap-2 px-2 py-1.5 rounded-lg {i === 0 ? 'bg-amber-500/10' : ''}">
							<span class="text-on-surface-variant font-bold text-sm w-5 text-center">{i + 1}</span>
							<span class="iconify material-symbols--person text-amber-500"></span>
							<span class="flex-1 text-sm font-medium text-on-surface">{player.name}</span>
							<span class="text-amber-500 font-bold font-headline">{score} {t('basta.points')}</span>
						</div>
					{/each}
				</div>
			</div>

			{#if isHost}
				<button onclick={playAgain}
					class="w-full py-2.5 rounded-xl bg-amber-500 text-black font-bold font-headline hover:brightness-110 active:scale-[0.98] transition-all">
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
