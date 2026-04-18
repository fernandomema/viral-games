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
	import GameHero from '$lib/components/GameHero.svelte';
	import { createCrosswordGame, type CrosswordEngine, type PlacedWord, PLAYER_COLORS } from '$lib/games/crossword';

	let { data } = $props();
	let game: GameDef = $derived(data.game);
	let seo = $derived(getGameSeo('crossword', getLocale()));

	// ── Mode ──────────────────────────────────────────────────────
	let mode = $state<'menu' | 'local' | 'online'>('menu');

	// ── Online state ──────────────────────────────────────────────
	let onlinePhase = $state<'join' | 'connecting' | 'lobby' | 'playing' | 'results' | 'error'>('join');
	let errorMsg = $state('');
	let gameState = $state<any>(null);
	let myPlayerId = $state<string | null>(null);
	let hostUserId = $state<string | null>(null);
	let myUserId = $state<string | null>(null);
	let winners = $state<string[]>([]);

	// Join form
	let userName = $state('');
	let roomCode = $state('');
	let isPublic = $state(false);

	// Public rooms
	let publicRooms = $state<{ code: string; playerCount: number; hostName: string; players: string[] }[]>([]);
	let loadingRooms = $state(true);
	let roomsLoaded = $state(false);

	// Config
	let gridSize = $state(13);

	// ── Local state ───────────────────────────────────────────────
	let localEngine: CrosswordEngine | null = null;
	let localState = $state<any>(null);
	let localGridSize = $state(13);

	// ── Shared crossword interaction ──────────────────────────────
	let selectedWordIdx = $state<number | null>(null);
	let inputAnswer = $state('');
	let lastSubmitResult = $state<boolean | null>(null);
	let answerInputEl = $state<HTMLInputElement | undefined>(undefined);

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

	// Read mode/room from URL
	$effect(() => {
		const urlMode = page.url.searchParams.get('mode');
		const urlRoom = page.url.searchParams.get('room');
		if (urlRoom && !roomCode) {
			roomCode = urlRoom.toUpperCase();
			mode = 'online';
		} else if (urlMode === 'local' && mode === 'menu') {
			mode = 'local';
		} else if (urlMode === 'online' && mode === 'menu') {
			mode = 'online';
		}
	});

	// Fetch public rooms
	let roomPollInterval: ReturnType<typeof setInterval> | null = null;
	$effect(() => {
		if (browser && mode === 'online' && onlinePhase === 'join') {
			fetchPublicRooms();
			roomPollInterval = setInterval(fetchPublicRooms, 3000);
			return () => { if (roomPollInterval) clearInterval(roomPollInterval); };
		}
	});

	async function fetchPublicRooms() {
		try {
			if (!roomsLoaded) loadingRooms = true;
			const res = await fetch('/api/web/rooms');
			const data = await res.json();
			publicRooms = data.rooms?.filter((r: any) => r.gameId === 'crossword') ?? [];
		} catch { /* ok */ } finally {
			loadingRooms = false;
			roomsLoaded = true;
		}
	}

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

	// ── Online ────────────────────────────────────────────────────
	function createRoom() {
		if (!userName.trim()) return;
		roomCode = generateRoomCode();
		connectOnline();
	}

	function joinRoom(code?: string) {
		if (!userName.trim()) return;
		if (code) roomCode = code;
		if (!roomCode.trim()) return;
		connectOnline();
	}

	function connectOnline() {
		onlinePhase = 'connecting';
		myUserId = getOrCreateUserId();
		const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
		ws = new WebSocket(`${protocol}//${location.host}/ws`);

		ws.onopen = () => {
			ws!.send(JSON.stringify({
				type: 'join',
				roomId: `web-crossword-${roomCode.toUpperCase()}`,
				discordUserId: myUserId,
				userName: userName.trim(),
				avatar: null,
				gameId: 'crossword',
				isPublic,
			}));
		};

		ws.onmessage = (event) => {
			const msg = JSON.parse(event.data);
			if (msg.type === 'state') {
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
					if (gameState.phase === 'lobby') onlinePhase = 'lobby';
					else if (gameState.phase === 'playing') onlinePhase = 'playing';
					else if (gameState.phase === 'results') { onlinePhase = 'results'; haptic('success'); }
				}
			} else if (msg.type === 'crosswordResult') {
				lastSubmitResult = msg.success;
				if (msg.success) { haptic('success'); inputAnswer = ''; selectedWordIdx = null; }
				else haptic('nudge');
				setTimeout(() => lastSubmitResult = null, 1500);
			} else if (msg.type === 'error') {
				errorMsg = msg.message;
				if (onlinePhase === 'connecting') onlinePhase = 'error';
			}
		};

		ws.onclose = () => {
			if (onlinePhase !== 'join' && onlinePhase !== 'error') {
				errorMsg = 'Desconectado';
				onlinePhase = 'error';
			}
		};
	}

	function sendConfig() {
		ws?.send(JSON.stringify({ type: 'config', config: { gridSize, maxWords: gridSize === 9 ? 8 : gridSize === 15 ? 20 : 15 } }));
	}

	function startOnlineGame() {
		ws?.send(JSON.stringify({ type: 'crosswordStart' }));
	}

	function submitOnlineWord() {
		if (selectedWordIdx === null || !inputAnswer.trim()) return;
		ws?.send(JSON.stringify({ type: 'crosswordSubmit', wordIndex: selectedWordIdx, answer: inputAnswer.trim() }));
	}

	function playAgainOnline() {
		ws?.send(JSON.stringify({ type: 'playAgain' }));
	}

	// ── Local ─────────────────────────────────────────────────────
	function startLocal() {
		localEngine = createCrosswordGame(getLocale());
		localEngine.addPlayer(getLocale() === 'en' ? 'You' : 'Tú');
		localEngine.setConfig({ gridSize: localGridSize, maxWords: localGridSize === 9 ? 8 : localGridSize === 15 ? 20 : 15 });
		localEngine.startGame();
		localState = localEngine.getState();
		selectedWordIdx = null;
		inputAnswer = '';
	}

	function submitLocalWord() {
		if (!localEngine || selectedWordIdx === null || !inputAnswer.trim()) return;
		const ok = localEngine.submitWord(selectedWordIdx, inputAnswer.trim(), 'p1');
		lastSubmitResult = ok;
		if (ok) { haptic('success'); inputAnswer = ''; selectedWordIdx = null; }
		else haptic('nudge');
		localState = localEngine.getState();
		setTimeout(() => lastSubmitResult = null, 1500);
	}

	function resetLocal() {
		localEngine = null;
		localState = null;
		selectedWordIdx = null;
		inputAnswer = '';
	}

	// ── Helpers ───────────────────────────────────────────────────
	function getCurrentState() {
		return mode === 'local' ? localState : gameState;
	}

	function getCurrentWords(): PlacedWord[] {
		return getCurrentState()?.words ?? [];
	}

	function isWordSolved(idx: number): boolean {
		const st = getCurrentState();
		if (!st?.solvedWords) return false;
		return idx in st.solvedWords || idx.toString() in st.solvedWords;
	}

	function getWordSolver(idx: number): string {
		const st = getCurrentState();
		return st?.solvedWords?.[idx] ?? st?.solvedWords?.[idx.toString()] ?? '';
	}

	function getSolverColor(playerId: string): string {
		const score = getCurrentState()?.scores?.find((s: any) => s.playerId === playerId);
		return score?.color ?? '#888';
	}

	function selectWord(idx: number) {
		if (isWordSolved(idx)) return;
		selectedWordIdx = idx;
		inputAnswer = '';
		lastSubmitResult = null;
		hapticTap();
		// Focus the answer input after DOM updates
		queueMicrotask(() => answerInputEl?.focus());
	}

	function handleSubmit() {
		if (mode === 'local') submitLocalWord();
		else submitOnlineWord();
	}

	function getCellAt(row: number, col: number) {
		const st = getCurrentState();
		return st?.grid?.[row]?.[col] ?? null;
	}

	function getWordNumberAt(row: number, col: number): number | null {
		const w = getCurrentWords().find((w: any) => w.row === row && w.col === col);
		return w ? w.number : null;
	}

	function isCellInSelectedWord(row: number, col: number): boolean {
		if (selectedWordIdx === null) return false;
		const w = getCurrentWords()[selectedWordIdx];
		if (!w) return false;
		const dr = w.direction === 'down' ? 1 : 0;
		const dc = w.direction === 'across' ? 1 : 0;
		for (let i = 0; i < w.word.length; i++) {
			if (w.row + dr * i === row && w.col + dc * i === col) return true;
		}
		return false;
	}

	const acrossWords = $derived(getCurrentWords().map((w: any, i: number) => ({ ...w, idx: i })).filter((w: any) => w.direction === 'across').sort((a: any, b: any) => a.number - b.number));
	const downWords = $derived(getCurrentWords().map((w: any, i: number) => ({ ...w, idx: i })).filter((w: any) => w.direction === 'down').sort((a: any, b: any) => a.number - b.number));

	const sortedScores = $derived((() => {
		const st = getCurrentState();
		return st?.scores ? [...st.scores].sort((a: any, b: any) => b.wordsSolved - a.wordsSolved) : [];
	})());

	const totalWords = $derived(getCurrentWords().length);
	const solvedCount = $derived((() => {
		const st = getCurrentState();
		return st?.solvedWords ? Object.keys(st.solvedWords).length : 0;
	})());

	// Grid container sizing
	let gridContainerEl = $state<HTMLElement | undefined>(undefined);
	let containerWidth = $state(360);
	$effect(() => {
		if (!gridContainerEl || !browser) return;
		const observer = new ResizeObserver(entries => { containerWidth = entries[0].contentRect.width; });
		observer.observe(gridContainerEl);
		return () => observer.disconnect();
	});
	function getCellSize(size: number): number {
		return Math.min(Math.floor((containerWidth - 4) / size), 34);
	}

	function goHome() { goto('/'); }
</script>

<svelte:head>
	<title>Crucigrama Multijugador — Jugar Gratis Online | Viral Games</title>
	{#if seo}
		<meta name="description" content={seo.description} />
		{@html `<script type="application/ld+json">${JSON.stringify({
			"@context": "https://schema.org",
			"@type": "FAQPage",
			mainEntity: seo.faqs.map(f => ({
				"@type": "Question",
				name: f.question,
				acceptedAnswer: { "@type": "Answer", text: f.answer }
			}))
		})}<\/script>`}
	{/if}
</svelte:head>

<!-- Fixed header -->
<header class="fixed top-0 w-full z-50 flex items-center justify-between px-4 h-14 bg-background/90 border-b border-outline-variant/20" style="backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)">
	<button onclick={goHome} class="flex items-center gap-1 text-on-surface-variant text-sm" aria-label="Back">
		<span class="iconify material-symbols--arrow-back text-lg"></span>
	</button>
	<span class="font-headline font-bold text-on-surface tracking-tight text-sm">
		<span class="iconify {game.icon} text-sky-500 mr-1 align-middle"></span>
		CRUCIGRAMA
	</span>
	<div class="w-8"></div>
</header>

<main class="pt-16 pb-32 px-4 w-full min-h-dvh max-w-lg mx-auto">

<!-- ═══ Menu ═══ -->
{#if mode === 'menu'}
	<div class="max-w-lg mx-auto">
		<GameHero {game} isGreen={false} bind:iconEl={heroIconEl} bind:titleEl={heroTitleEl} />

		<div class="flex flex-col gap-3 mt-6">
			<button
				onclick={() => { mode = 'online'; }}
				class="w-full py-5 rounded-xl bg-linear-to-r from-sky-600 to-cyan-400 text-white font-headline font-bold text-xl uppercase tracking-widest shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_45px_rgba(14,165,233,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
			>
				<span class="iconify material-symbols--wifi text-2xl"></span>
				ONLINE
			</button>
			<button
				onclick={() => { mode = 'local'; }}
				class="w-full py-5 rounded-xl bg-surface-container-high text-on-surface font-headline font-bold text-xl uppercase tracking-widest border border-outline-variant/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
			>
				<span class="iconify material-symbols--person text-2xl"></span>
				{getLocale() === 'en' ? 'SINGLE PLAYER' : '1 JUGADOR'}
			</button>
		</div>
	</div>


<!-- ═══ Local — Config ═══ -->
{:else if mode === 'local' && !localState}
	<div class="max-w-lg mx-auto">
		<GameHero {game} isGreen={false} bind:iconEl={heroIconEl} bind:titleEl={heroTitleEl} />

		<p class="text-on-surface-variant text-center text-sm mb-6">{getLocale() === 'en' ? 'Choose grid size' : 'Elige el tamaño del tablero'}</p>

		<div class="grid grid-cols-3 gap-3 mb-8">
			{#each [{ size: 9, label: t('crossword.small') }, { size: 13, label: t('crossword.medium') }, { size: 15, label: t('crossword.large') }] as opt}
				<button
					onclick={() => { localGridSize = opt.size; hapticTap(); }}
					class="p-4 rounded-xl border-2 text-center font-bold font-headline transition-all active:scale-95 {localGridSize === opt.size
						? 'border-sky-500 bg-sky-500/15 text-sky-400'
						: 'border-outline-variant/20 bg-surface-container-high text-on-surface hover:border-outline-variant/40'}"
				>{opt.label}</button>
			{/each}
		</div>

		<button
			onclick={startLocal}
			class="w-full py-5 rounded-xl bg-linear-to-r from-sky-600 to-cyan-400 text-white font-headline font-bold text-xl uppercase tracking-widest shadow-[0_0_30px_rgba(14,165,233,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
		>
			{t('crossword.startGame')}
			<span class="iconify material-symbols--play-arrow"></span>
		</button>

		<button onclick={() => { mode = 'menu'; }} class="block mx-auto mt-4 text-on-surface-variant text-sm">
			← {getLocale() === 'en' ? 'Back' : 'Volver'}
		</button>
	</div>

<!-- ═══ Local — Playing ═══ -->
{:else if mode === 'local' && localState}
	{@render crosswordBoard()}

<!-- ═══ Online — Join ═══ -->
{:else if mode === 'online' && (onlinePhase === 'join' || onlinePhase === 'connecting')}
	<div class="max-w-lg mx-auto">
		<GameHero {game} isGreen={false} bind:iconEl={heroIconEl} bind:titleEl={heroTitleEl} />

		<!-- Name input -->
		<div class="glass-panel p-1 rounded-xl mb-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
			<div class="flex items-center bg-surface-container-lowest rounded-lg p-2">
				<div class="grow flex items-center px-3">
					<span class="iconify material-symbols--person text-outline mr-3"></span>
					<input
						bind:value={userName}
						class="bg-transparent border-none focus:outline-none text-on-surface w-full font-medium placeholder:text-outline/50"
						placeholder={game.inputPlaceholder}
						maxlength="20"
					/>
				</div>
			</div>
		</div>

		<!-- Create -->
		<div class="flex items-center gap-3 mb-3">
			<span class="flex items-center gap-2 text-on-surface-variant text-xs cursor-pointer">
				<input type="checkbox" bind:checked={isPublic} class="accent-sky-500" />
				{getLocale() === 'en' ? 'Public' : 'Pública'}
			</span>
		</div>
		<button
			onclick={createRoom}
			disabled={!userName.trim()}
			class="w-full py-4 rounded-xl bg-linear-to-r from-sky-600 to-cyan-400 text-white font-headline font-bold uppercase tracking-widest active:scale-[0.98] transition-all disabled:opacity-40 mb-4"
		>{getLocale() === 'en' ? 'CREATE ROOM' : 'CREAR SALA'}</button>

		<!-- Join -->
		<div class="glass-panel p-1 rounded-xl mb-4">
			<div class="flex items-center gap-2 bg-surface-container-lowest rounded-lg p-2">
				<div class="grow flex items-center px-3">
					<span class="iconify material-symbols--tag text-outline mr-3"></span>
					<input
						bind:value={roomCode}
						class="bg-transparent border-none focus:outline-none text-on-surface w-full font-mono uppercase tracking-widest font-bold placeholder:text-outline/50"
						placeholder={getLocale() === 'en' ? 'Room code' : 'Código de sala'}
						maxlength="4"
					/>
				</div>
				<button
					onclick={() => joinRoom()}
					disabled={!userName.trim() || !roomCode.trim()}
					class="bg-linear-to-r from-sky-600 to-cyan-400 text-white px-6 py-3 rounded-lg font-bold transition-transform active:scale-95 disabled:opacity-40"
				>{getLocale() === 'en' ? 'JOIN' : 'UNIRSE'}</button>
			</div>
		</div>

		<!-- Public rooms -->
		{#if publicRooms.length > 0}
			<p class="text-on-surface-variant text-xs uppercase tracking-wider mb-2">{getLocale() === 'en' ? 'Public rooms' : 'Salas públicas'}</p>
			{#each publicRooms as room}
				<button
					onclick={() => joinRoom(room.code)}
					disabled={!userName.trim()}
					class="w-full mb-2 px-4 py-3 rounded-xl bg-surface-container-high border border-outline-variant/10 text-left flex items-center justify-between active:scale-[0.98] transition-transform disabled:opacity-40"
				>
					<div>
						<span class="text-on-surface font-semibold">{room.hostName}</span>
						<span class="text-on-surface-variant text-sm ml-2 font-mono">{room.code}</span>
					</div>
					<span class="text-on-surface-variant text-sm">{room.playerCount} <span class="iconify material-symbols--person align-middle"></span></span>
				</button>
			{/each}
		{/if}

		{#if onlinePhase === 'connecting'}
			<p class="text-on-surface-variant text-sm text-center animate-pulse mt-4">{getLocale() === 'en' ? 'Connecting...' : 'Conectando...'}</p>
		{/if}

		<button onclick={() => { mode = 'menu'; }} class="block mx-auto mt-4 text-on-surface-variant text-sm">
			← {getLocale() === 'en' ? 'Back' : 'Volver'}
		</button>
	</div>

<!-- ═══ Online — Lobby ═══ -->
{:else if mode === 'online' && onlinePhase === 'lobby'}
	<div class="max-w-lg mx-auto">
		<GameHero {game} isGreen={false} bind:iconEl={heroIconEl} bind:titleEl={heroTitleEl} />

		<!-- Room code -->
		<div class="text-center mb-6">
			<span class="inline-flex items-center gap-2 bg-sky-500/10 px-4 py-1.5 rounded-full border border-sky-500/20">
				<span class="font-headline text-sky-400 text-xs font-bold tracking-widest uppercase">{getLocale() === 'en' ? 'Room' : 'Sala'}: {roomCode}</span>
			</span>
		</div>

		<!-- Players -->
		<div class="glass-panel rounded-xl p-4 mb-6">
			<p class="text-on-surface-variant text-xs uppercase tracking-wider mb-3">{getLocale() === 'en' ? 'Players' : 'Jugadores'} ({gameState?.players?.length ?? 0})</p>
			{#each gameState?.players ?? [] as p, i}
				<div class="flex items-center gap-3 py-2">
					<div class="w-3 h-3 rounded-full" style="background:{PLAYER_COLORS[i % PLAYER_COLORS.length]}"></div>
					<span class="text-on-surface font-medium">{p.name}</span>
					{#if p.discordUserId === hostUserId}
						<span class="text-on-surface-variant text-[10px] uppercase tracking-widest">HOST</span>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Config (host) -->
		{#if isHost}
			<p class="text-on-surface-variant text-xs uppercase tracking-wider mb-2">{t('crossword.gridSize')}</p>
			<div class="grid grid-cols-3 gap-3 mb-6">
				{#each [{ size: 9, label: t('crossword.small') }, { size: 13, label: t('crossword.medium') }, { size: 15, label: t('crossword.large') }] as opt}
					<button
						onclick={() => { gridSize = opt.size; sendConfig(); hapticTap(); }}
						class="p-3 rounded-xl border-2 text-center text-sm font-bold transition-all active:scale-95 {gridSize === opt.size
							? 'border-sky-500 bg-sky-500/15 text-sky-400'
							: 'border-outline-variant/20 bg-surface-container-high text-on-surface'}"
					>{opt.label}</button>
				{/each}
			</div>
			<button
				onclick={startOnlineGame}
				disabled={(gameState?.players?.length ?? 0) < 2}
				class="w-full py-5 rounded-xl bg-linear-to-r from-sky-600 to-cyan-400 text-white font-headline font-bold text-xl uppercase tracking-widest shadow-[0_0_30px_rgba(14,165,233,0.3)] active:scale-[0.98] transition-all disabled:opacity-40"
			>{t('crossword.startGame')}</button>
		{:else}
			<p class="text-on-surface-variant text-center animate-pulse">{t('crossword.waiting')}</p>
		{/if}
	</div>

<!-- ═══ Online — Playing / Results ═══ -->
{:else if mode === 'online' && (onlinePhase === 'playing' || onlinePhase === 'results')}
	{@render crosswordBoard()}

<!-- ═══ Error ═══ -->
{:else if mode === 'online' && onlinePhase === 'error'}
	<div class="flex flex-col items-center justify-center min-h-[60dvh]">
		<p class="text-red-400 text-lg mb-4">{errorMsg}</p>
		<button onclick={() => { onlinePhase = 'join'; errorMsg = ''; }} class="px-6 py-3 rounded-xl bg-surface-container-high text-on-surface font-bold border border-outline-variant/20 active:scale-95">
			{getLocale() === 'en' ? 'Try again' : 'Reintentar'}
		</button>
	</div>
{/if}

<!-- SEO -->
{#if seo && (mode === 'menu' || (mode === 'local' && !localState) || (mode === 'online' && onlinePhase === 'join'))}
	<section class="max-w-lg mx-auto mt-10 space-y-6">
		<p class="text-on-surface-variant text-sm leading-relaxed">{seo.description}</p>
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

<!-- ═══ Crossword Board Snippet ═══ -->
{#snippet crosswordBoard()}
	{@const st = getCurrentState()}
	{@const isResults = st?.phase === 'results'}

	<!-- Progress -->
	<div class="w-full mb-4">
		<div class="w-full h-1.5 rounded-full bg-surface-container-high mb-3 overflow-hidden">
			<div class="h-full rounded-full bg-linear-to-r from-sky-500 to-cyan-400 transition-all duration-500" style="width:{totalWords ? (solvedCount / totalWords * 100) : 0}%"></div>
		</div>
		<div class="flex items-center gap-2 overflow-x-auto">
			{#each sortedScores as s, i}
				<div class="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
					style="background:{s.color}15;color:{s.color};border:1px solid {s.color}30"
				>
					{#if i === 0 && isResults}<span class="iconify material-symbols--emoji-events text-yellow-400 mr-0.5"></span>{/if}
					{s.name} <span class="font-mono">{s.wordsSolved}</span>
				</div>
			{/each}
			<span class="ml-auto text-on-surface-variant text-[11px] font-mono whitespace-nowrap">{solvedCount}/{totalWords}</span>
		</div>
	</div>

	<!-- Grid -->
	{#if st?.grid && st.size > 0}
		{@const cellSize = getCellSize(st.size)}
		<div bind:this={gridContainerEl} class="w-full flex justify-center mb-4">
			<div class="inline-grid rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
				style="grid-template-columns:repeat({st.size},{cellSize}px);background:var(--surface-container-lowest,#08080f);border:1px solid var(--outline-variant,rgba(255,255,255,0.06))"
			>
				{#each { length: st.size } as _, row}
					{#each { length: st.size } as _, col}
						{@const cell = getCellAt(row, col)}
						{@const num = getWordNumberAt(row, col)}
						{@const inSelected = isCellInSelectedWord(row, col)}
						{@const solvedBy = cell?.solvedBy}
						{#if cell && cell.letter}
							<button
								onclick={() => {
									const words = getCurrentWords();
									for (let k = 0; k < words.length; k++) {
										const w = words[k];
										const dr = w.direction === 'down' ? 1 : 0;
										const dc = w.direction === 'across' ? 1 : 0;
										for (let j = 0; j < w.word.length; j++) {
											if (w.row + dr * j === row && w.col + dc * j === col) { selectWord(k); return; }
										}
									}
								}}
								class="relative flex items-center justify-center font-bold font-mono transition-all duration-150"
								style="width:{cellSize}px;height:{cellSize}px;font-size:{Math.max(cellSize * 0.38, 10)}px;{
									solvedBy ? `background:${getSolverColor(solvedBy)}15;color:${getSolverColor(solvedBy)};` :
									inSelected ? 'background:rgba(14,165,233,0.18);color:var(--sky-400,#38bdf8);' :
									'background:var(--surface-container-high,#1a1a2e);color:var(--outline-variant,rgba(255,255,255,0.1));'
								}border:1px solid {inSelected ? 'rgba(14,165,233,0.35)' : solvedBy ? getSolverColor(solvedBy) + '25' : 'rgba(255,255,255,0.04)'};"
							>
								{#if num}<span class="absolute top-0 left-0.5 leading-none font-sans text-on-surface-variant/40" style="font-size:{Math.max(cellSize * 0.2, 6)}px">{num}</span>{/if}
								{cell.revealed || ''}
							</button>
						{:else}
							<div style="width:{cellSize}px;height:{cellSize}px;background:var(--background,#0e0e13);"></div>
						{/if}
					{/each}
				{/each}
			</div>
		</div>
	{/if}

	<!-- Input (when word selected) -->
	{#if selectedWordIdx !== null && !isResults && !isWordSolved(selectedWordIdx)}
		{@const selWord = getCurrentWords()[selectedWordIdx]}
		<div class="w-full glass-panel rounded-xl p-4 border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.08)] mb-4">
			<div class="flex items-center gap-2 mb-3">
				<span class="inline-flex items-center gap-1 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20 text-sky-400 text-[10px] font-bold uppercase tracking-widest">
					{selWord.number} {selWord.direction === 'across' ? '→' : '↓'}
				</span>
				<span class="text-on-surface-variant text-xs">{selWord.word.length} {getLocale() === 'en' ? 'letters' : 'letras'}</span>
			</div>
			<p class="text-on-surface font-medium text-sm mb-3">{selWord.clue}</p>
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="flex gap-2">
				<div class="grow flex items-center bg-surface-container-lowest rounded-lg px-3 border border-outline-variant/20 {lastSubmitResult === false ? 'border-red-500/50 cw-shake' : ''}">
					<input
						bind:this={answerInputEl}
						bind:value={inputAnswer}
						class="bg-transparent border-none focus:outline-none text-on-surface w-full text-center uppercase tracking-[0.25em] font-mono font-bold py-3 placeholder:text-outline/30"
						maxlength={selWord.word.length}
						placeholder={'_'.repeat(selWord.word.length)}
					/>
				</div>
				<button
					type="submit"
					disabled={!inputAnswer.trim()}
					class="bg-linear-to-r from-sky-600 to-cyan-400 text-white px-5 py-3 rounded-lg font-bold transition-transform active:scale-95 shadow-[0_0_15px_rgba(14,165,233,0.3)] disabled:opacity-40"
				>{t('crossword.submit')}</button>
			</form>
			{#if lastSubmitResult === false}
				<p class="text-red-400 text-xs text-center mt-2 font-semibold">{getLocale() === 'en' ? 'Wrong answer!' : '¡Respuesta incorrecta!'}</p>
			{/if}
		</div>
	{/if}

	<!-- Clue lists -->
	{#if !isResults}
		<div class="w-full grid grid-cols-2 gap-3">
			<div class="bg-surface-container-high/40 rounded-xl border border-outline-variant/10 p-3 max-h-48 overflow-y-auto">
				<p class="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold mb-2 sticky top-0 bg-surface-container-high/90 z-10 pb-1">→ {t('crossword.across')}</p>
				{#each acrossWords as w}
					<button
						onclick={() => selectWord(w.idx)}
						class="w-full text-left py-1.5 px-2 rounded-lg text-xs transition-colors {
							selectedWordIdx === w.idx ? 'bg-sky-500/15 text-sky-300' :
							isWordSolved(w.idx) ? 'text-on-surface-variant/30 line-through' :
							'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
						}"
					>
						<span class="text-on-surface-variant/40 font-mono mr-1">{w.number}.</span>
						{w.clue}
						{#if isWordSolved(w.idx)}
							<span class="ml-1 font-mono font-bold" style="color:{getSolverColor(getWordSolver(w.idx))}">{w.word}</span>
						{/if}
					</button>
				{/each}
			</div>
			<div class="bg-surface-container-high/40 rounded-xl border border-outline-variant/10 p-3 max-h-48 overflow-y-auto">
				<p class="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold mb-2 sticky top-0 bg-surface-container-high/90 z-10 pb-1">↓ {t('crossword.down')}</p>
				{#each downWords as w}
					<button
						onclick={() => selectWord(w.idx)}
						class="w-full text-left py-1.5 px-2 rounded-lg text-xs transition-colors {
							selectedWordIdx === w.idx ? 'bg-sky-500/15 text-sky-300' :
							isWordSolved(w.idx) ? 'text-on-surface-variant/30 line-through' :
							'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
						}"
					>
						<span class="text-on-surface-variant/40 font-mono mr-1">{w.number}.</span>
						{w.clue}
						{#if isWordSolved(w.idx)}
							<span class="ml-1 font-mono font-bold" style="color:{getSolverColor(getWordSolver(w.idx))}">{w.word}</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Results -->
	{#if isResults}
		<div class="flex flex-col items-center justify-center text-center mt-4">
			<div class="mb-4">
				<span class="inline-flex items-center gap-2 bg-yellow-500/10 px-4 py-1.5 rounded-full border border-yellow-500/20 mb-3">
					<span class="iconify material-symbols--emoji-events text-yellow-400"></span>
					<span class="font-headline text-yellow-400 text-xs font-bold tracking-widest uppercase">{t('crossword.winner')}</span>
				</span>
			</div>
			<h2 class="font-headline text-4xl font-bold text-sky-400 mb-2">
				{#if mode === 'local'}{getLocale() === 'en' ? 'Completed!' : '¡Completado!'}{:else}{winners.join(', ')}{/if}
			</h2>
			<p class="text-on-surface-variant text-sm mb-6">{solvedCount} {getLocale() === 'en' ? 'words solved' : 'palabras resueltas'}</p>

			<div class="w-full space-y-2 mb-8">
				{#each sortedScores as s, i}
					<div class="bg-surface-container-high p-4 rounded-xl flex items-center justify-between border border-outline-variant/10 {i === 0 ? 'ring-2 ring-yellow-400/30' : ''}">
						<div class="flex items-center gap-3">
							<span class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style="background:{s.color}22;color:{s.color}">{i + 1}</span>
							<span class="font-bold text-on-surface">{s.name}</span>
						</div>
						<span class="font-mono font-bold text-lg" style="color:{s.color}">{s.wordsSolved}</span>
					</div>
				{/each}
			</div>

			<div class="flex gap-3 w-full">
				{#if mode === 'online' && isHost}
					<button onclick={playAgainOnline} class="flex-1 py-4 rounded-xl bg-linear-to-r from-sky-600 to-cyan-400 text-white font-headline font-bold uppercase tracking-widest active:scale-95 transition-all">
						{getLocale() === 'en' ? 'Play Again' : 'Jugar de nuevo'}
					</button>
				{:else if mode === 'local'}
					<button onclick={startLocal} class="flex-1 py-4 rounded-xl bg-linear-to-r from-sky-600 to-cyan-400 text-white font-headline font-bold uppercase tracking-widest active:scale-95 transition-all">
						{getLocale() === 'en' ? 'Play Again' : 'Jugar de nuevo'}
					</button>
					<a
						href="/"
						class="py-4 px-6 rounded-xl bg-surface-container-high text-on-surface font-headline font-bold uppercase tracking-widest active:scale-95 transition-all border border-outline-variant/20 text-center"
					>
						{getLocale() === 'en' ? 'Exit' : 'Salir'}
					</a>
				{/if}
			</div>
		</div>
	{/if}
{/snippet}

<style>
	@keyframes cw-shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-4px); }
		75% { transform: translateX(4px); }
	}
	:global(.cw-shake) {
		animation: cw-shake 0.3s ease-in-out;
	}
</style>
