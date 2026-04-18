<script lang="ts">
	import type { GameDef } from '$lib/games/registry';
	import { createImpostorGame, getWordCategories } from '$lib/games/impostor';
	import type { ImpostorEngine } from '$lib/games/impostor';
	import { createImpostorDrawGame, getDrawCategories } from '$lib/games/impostor-draw';
	import type { ImpostorDrawEngine, Stroke } from '$lib/games/impostor-draw';
	import { createImpostorDatosGame, getFactCategories } from '$lib/games/impostor-datos';
	import type { ImpostorDatosEngine } from '$lib/games/impostor-datos';
	import { createPalabraOcultaGame } from '$lib/games/palabra-oculta';
	import type { PalabraOcultaEngine } from '$lib/games/palabra-oculta/engine';
	import type { PalabraOcultaState } from '$lib/games/palabra-oculta/types';
	import { getCategories as getGuessCategories } from '$lib/games/palabra-oculta/words';
	import DrawingCanvas from '$lib/components/DrawingCanvas.svelte';
	import GameHero from '$lib/components/GameHero.svelte';
	import GameConfig from '$lib/components/GameConfig.svelte';
	import CategoryPicker from '$lib/components/CategoryPicker.svelte';
	import { loadPlayers, savePlayers } from '$lib/players-store';
	import { beforeNavigate } from '$app/navigation';
	import { setActiveGame } from '$lib/active-game';
	import { haptic, hapticTap } from '$lib/haptics';
	import { t, getLocale } from '$lib/i18n';

	let { data } = $props();
	let game: GameDef = $derived(data.game);

	// ── Engine setup ──────────────────────────────────────────────
	type AnyEngine = ImpostorEngine | ImpostorDrawEngine | ImpostorDatosEngine;

	// Guess engine (separate — single-player)
	let isGuessGame = $derived(game.type === 'guess');
	// eslint-disable-next-line -- intentionally capturing initial game type for engine creation
	const guessEngine: PalabraOcultaEngine | null = (() => data.game.type === 'guess' ? createPalabraOcultaGame() : null)();
	let guessState = $state<PalabraOcultaState | null>(guessEngine ? guessEngine.getState() : null);
	let guessInput = $state('');

	function buildEngine(): AnyEngine | null {
		switch (game.type) {
			case 'word': return createImpostorGame();
			case 'draw': return createImpostorDrawGame();
			case 'fact': return createImpostorDatosGame();
			default: return null;
		}
	}

	const engine = buildEngine();

	// Load saved players (only for multiplayer games)
	if (engine) {
		const saved = loadPlayers();
		for (const p of saved) engine.addPlayer(p.name);
	}

	// ── Categories ────────────────────────────────────────────────
	let categories: { name: string; icon: string }[] = $derived(
		game.type === 'guess' ? getGuessCategories(getLocale()).map(c => ({ name: c, icon: '' })) :
		game.type === 'word' ? getWordCategories(getLocale()) :
		game.type === 'draw' ? getDrawCategories(getLocale()) :
		getFactCategories(getLocale())
	);

	// ── Reactive state ────────────────────────────────────────────
	let gameState = $state(engine ? engine.getState() : { phase: 'lobby', players: [], currentRevealIndex: 0, roles: [] } as any);
	let playerName = $state('');
	let revealedRole: any = $state(null);
	let isRevealed = $state(false);
	let selectedCategory = $state<string | undefined>(undefined);
	let timerInterval: ReturnType<typeof setInterval> | null = $state(null);
	let votingTarget = $state<string | null>(null);

	// Config (shared)
	let configImpostors = $state(1);

	// Config (word + fact: timer)
	let configTimer = $state(300);

	// Config (word + draw: hint toggle)
	let configHint = $state(true);

	// Config (draw-specific)
	let configRounds = $state(2);
	let configTurnTimer = $state(15);
	let hasDrawnStroke = $state(false);

	const STROKE_COLORS = ['#CA98FF', '#2FF801', '#FF7073', '#60A5FA', '#FBBF24', '#F472B6', '#34D399', '#FB923C'];

	function sync() {
		if (engine) gameState = engine.getState();
		if (guessEngine) guessState = guessEngine.getState();
	}

	// ── Config apply ──────────────────────────────────────────────
	function applyConfig() {
		if (!engine) return;
		if (game.type === 'word') {
			(engine as ImpostorEngine).setConfig({
				impostorCount: configImpostors,
				timerSeconds: configTimer,
				giveImpostorHint: configHint,
			});
		} else if (game.type === 'draw') {
			(engine as ImpostorDrawEngine).setConfig({
				impostorCount: configImpostors,
				rounds: configRounds,
				timerPerTurn: configTurnTimer,
				giveImpostorHint: configHint,
			});
		} else {
			(engine as ImpostorDatosEngine).setConfig({
				impostorCount: configImpostors,
				timerSeconds: configTimer,
			});
		}
		sync();
	}

	// ── Guess game functions ──────────────────────────────────────
	function startGuessGame() {
		guessEngine!.startGame(getLocale(), selectedCategory);
		guessState = guessEngine!.getState();
		haptic('success');
	}

	function submitGuess() {
		const word = guessInput.trim();
		if (!word || !guessEngine) return;
		guessEngine.guess(word);
		guessInput = '';
		guessState = guessEngine.getState();
		if (guessState!.won) haptic('success');
		else hapticTap();
	}

	function resetGuessGame() {
		guessEngine!.reset();
		guessState = guessEngine!.getState();
		selectedCategory = undefined;
	}

	function getDistanceLabel(distance: number): string {
		if (distance === 0) return t('guess.youWon');
		if (distance <= 100) return t('guess.close');
		if (distance <= 700) return t('guess.medium');
		return t('guess.far');
	}

	function getDistanceColor(distance: number): string {
		if (distance === 0) return 'text-green-400';
		if (distance <= 100) return 'text-cyan-400';
		if (distance <= 700) return 'text-amber-400';
		return 'text-red-400';
	}

	// ── Shared functions ──────────────────────────────────────────
	function addPlayer() {
		const name = playerName.trim();
		if (!name || !engine) return;
		engine.addPlayer(name);
		playerName = '';
		sync();
		savePlayers(gameState.players);
		hapticTap();
	}

	function removePlayer(id: string) {
		if (!engine) return;
		engine.removePlayer(id);
		sync();
		savePlayers(gameState.players);
		hapticTap();
	}

	function startGame() {
		if (!engine) return;
		applyConfig();
		engine.startGame(selectedCategory);
		revealedRole = null;
		isRevealed = false;
		sync();
		haptic('success');
	}

	function revealCurrentRole() {
		const player = gameState.players[gameState.currentRevealIndex];
		if (player) {
			revealedRole = engine!.revealRole(player.id);
			isRevealed = true;
			haptic('nudge');
		}
	}

	function hideRole() {
		isRevealed = false;
		revealedRole = null;
	}

	function nextPlayer() {
		hideRole();
		engine!.nextReveal();
		sync();
		// Draw: if we just entered drawing phase, start the turn timer
		if (game.type === 'draw' && engine!.getState().phase === 'drawing') {
			startTurnTimer();
		}
	}

	// ── Timer games (word + fact) ─────────────────────────────────
	function startPlaying() {
		(engine as any).setPhase('playing');
		sync();
		startTimerInterval();
		haptic('success');
	}

	function startTimerInterval() {
		if (timerInterval) clearInterval(timerInterval);
		timerInterval = setInterval(() => {
			const remaining = (engine as ImpostorEngine | ImpostorDatosEngine).tick();
			sync();
			if (remaining <= 0 && timerInterval) {
				clearInterval(timerInterval);
				timerInterval = null;
				haptic('error');
			}
		}, 1000);
	}

	function goToVoting() {
		if (timerInterval) clearInterval(timerInterval);
		timerInterval = null;
		engine!.setPhase('voting');
		sync();
		haptic('nudge');
	}

	// ── Draw-specific functions ───────────────────────────────────
	function startTurnTimer() {
		if (timerInterval) clearInterval(timerInterval);
		hasDrawnStroke = false;
		(engine as ImpostorDrawEngine).resetTurnTimer();
		sync();
		timerInterval = setInterval(() => {
			const remaining = (engine as ImpostorDrawEngine).tickTurn();
			sync();
			if (remaining <= 0) {
				finishCurrentTurn();
			}
		}, 1000);
	}

	function onStrokeComplete(points: { x: number; y: number }[]) {
		const drawerIdx = (gameState as any).currentDrawerIndex;
		const colorIdx = drawerIdx % STROKE_COLORS.length;
		(engine as ImpostorDrawEngine).addStroke({
			points,
			color: STROKE_COLORS[colorIdx],
			width: 4,
		});
		hasDrawnStroke = true;
		sync();
	}

	function finishCurrentTurn() {
		if (timerInterval) clearInterval(timerInterval);
		timerInterval = null;
		const { done } = (engine as ImpostorDrawEngine).finishTurn();
		sync();
		if (!done) {
			hasDrawnStroke = false;
		}
		haptic('nudge');
	}

	function startNextTurn() {
		hasDrawnStroke = false;
		startTurnTimer();
	}

	// ── Voting ────────────────────────────────────────────────────
	function castVote(targetId: string) {
		votingTarget = targetId;
		hapticTap();
	}

	function confirmVotes() {
		for (const p of gameState.players.filter(p => !p.eliminated)) {
			if (votingTarget) engine!.vote(p.id, votingTarget);
		}
		engine!.finishVoting();
		sync();
		haptic('success');
	}

	function playAgain() {
		votingTarget = null;
		revealedRole = null;
		isRevealed = false;
		hasDrawnStroke = false;
		engine!.reset();
		sync();
	}

	function backToLobby() {
		if (timerInterval) clearInterval(timerInterval);
		timerInterval = null;
		votingTarget = null;
		revealedRole = null;
		isRevealed = false;
		hasDrawnStroke = false;
		engine!.reset();
		sync();
	}

	function formatTime(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	}

	$effect(() => {
		return () => {
			if (timerInterval) clearInterval(timerInterval);
		};
	});

	// ── Derived state ─────────────────────────────────────────────
	const maxImpostors = $derived(Math.max(1, Math.floor((gameState.players.length || 3) / 3)));

	const currentRevealPlayer = $derived(
		gameState.phase === 'reveal' ? gameState.players[gameState.currentRevealIndex] : null
	);

	const alivePlayers = $derived(gameState.players.filter(p => !p.eliminated));

	const results = $derived(
		gameState.phase === 'results' ? engine!.getResults() : null
	);

	const currentDrawer = $derived(
		game.type === 'draw' && gameState.phase === 'drawing'
			? (engine as ImpostorDrawEngine).getCurrentDrawer()
			: null
	);

	// ── View transition ───────────────────────────────────────────
	let heroTitleEl = $state<HTMLElement | undefined>(undefined);
	let heroIconEl = $state<HTMLElement | undefined>(undefined);

	function triggerViewTransition() {
		setActiveGame(game.id);
		if (heroTitleEl) heroTitleEl.style.viewTransitionName = 'game-title';
		if (heroIconEl) heroIconEl.style.viewTransitionName = 'game-icon';
	}

	beforeNavigate(() => {
		triggerViewTransition();
	});

	// ── Accent helpers (impostor=green, draw/datos=purple) ────────
	let isGreen = $derived(game.id === 'impostor');
</script>

<!-- ═══ TopAppBar ═══ -->
<header class="fixed top-0 w-full z-50 flex items-center justify-between px-4 h-16 bg-background/90 border-b border-outline-variant/20 shadow-[0_0_20px_rgba(202,152,255,0.08)]" style="backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)">
	<div class="flex items-center gap-1">
		<a href="/" onclick={triggerViewTransition} class="p-2 rounded-xl hover:bg-surface-variant/40 active:scale-95 transition-all" aria-label={t('game.back')}>
			<span class="iconify material-symbols--arrow-back text-on-surface-variant text-xl"></span>
		</a>
		<span class="iconify {game.headerIcon} text-primary-dim text-xl"></span>
		<span class="text-lg font-bold tracking-tighter {isGreen ? 'text-primary' : 'text-primary-dim'} font-headline">{game.headerTitle}</span>
	</div>
	{#if gameState.phase !== 'lobby' && !(isGuessGame && guessState?.phase === 'lobby')}
		<button onclick={() => isGuessGame ? resetGuessGame() : backToLobby()} aria-label={t('game.exit')} class="p-2 rounded-full hover:bg-surface-variant/60 transition-all active:scale-95">
			<span class="iconify material-symbols--close text-outline-variant"></span>
		</button>
	{/if}
</header>

<main class="pt-20 pb-32 px-6 w-full min-h-dvh max-w-6xl mx-auto">

	<!-- ═══════════════ LOBBY PHASE ═══════════════ -->
	{#if !isGuessGame && gameState.phase === 'lobby'}
		<div class="lg:grid lg:grid-cols-[1fr_380px] lg:gap-12 lg:items-start">
			<!-- Left column: Hero + Players -->
			<div>
				<!-- Hero -->
				<GameHero {game} {isGreen} bind:iconEl={heroIconEl} bind:titleEl={heroTitleEl}>
					<!-- Online play button -->
					<a
						href="/online/{game.id}"
						class="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-full {isGreen ? 'bg-secondary/15 text-secondary border border-secondary/30 hover:bg-secondary/25' : 'bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25'} text-sm font-bold font-headline transition-colors"
					>
						<span class="iconify material-symbols--wifi text-base"></span>
						{t('web.playOnline')}
					</a>
				</GameHero>

				<!-- Player Config -->
				<div class="mb-6">
					<div class="flex items-center gap-2 mb-2">
						<span class="{isGreen ? 'text-secondary' : 'text-primary-dim'} font-headline text-sm tracking-[0.2em] uppercase font-bold">{t('game.players')}</span>
						<div class="h-px grow bg-outline-variant/20"></div>
					</div>
					<h2 class="font-headline text-2xl font-bold tracking-tight leading-none">
						{t('game.addPlayers', { playerLabel: t(`game.${game.id}.playerLabel`) })}
					</h2>
					<p class="text-on-surface-variant mt-2 text-sm">{t('game.minPlayers')}</p>
				</div>

				<!-- Input -->
				<form onsubmit={(e) => { e.preventDefault(); addPlayer(); }} class="glass-panel p-1 rounded-xl mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
					<div class="flex items-center gap-2 bg-surface-container-lowest rounded-lg p-2">
						<div class="grow flex items-center px-3">
							<span class="iconify material-symbols--person-add text-outline mr-3"></span>
							<input
								bind:value={playerName}
								class="bg-transparent border-none focus:outline-none text-on-surface w-full font-medium placeholder:text-outline/50"
								placeholder={t(`game.${game.id}.inputPlaceholder`)}
								type="text"
								maxlength="20"
							/>
						</div>
						<button
							type="submit"
							disabled={!playerName.trim()}
							class="bg-linear-to-r from-primary-dim to-primary text-on-primary-fixed px-6 py-3 rounded-lg font-bold transition-transform active:scale-95 flex items-center gap-2 shadow-[0_0_15px_rgba(156,66,244,0.3)] disabled:opacity-40"
						>
							{t('game.add')}
							<span class="iconify material-symbols--add text-sm"></span>
						</button>
					</div>
				</form>

				<!-- Player List -->
				{#if gameState.players.length > 0}
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
						{#each gameState.players as player, i}
							<div class="bg-surface-container-high p-4 rounded-xl flex items-center gap-4 group hover:bg-surface-container-highest transition-colors border border-outline-variant/10">
								<div class="relative">
									<div class="w-12 h-12 rounded-full bg-surface-container-lowest {isGreen ? 'ring-2 ring-secondary ring-offset-2 ring-offset-background' : 'ring-2 ring-primary-dim ring-offset-2 ring-offset-background'} flex items-center justify-center text-lg font-bold font-headline {isGreen ? 'text-primary' : 'text-primary-dim'}">
										{player.name.charAt(0).toUpperCase()}
									</div>
									{#if game.id === 'impostor'}
										<div class="absolute -bottom-1 -right-1 w-5 h-5 bg-secondary rounded-full border-2 border-background flex items-center justify-center">
											<span class="iconify material-symbols--check text-[10px] text-black font-bold"></span>
										</div>
									{:else if game.type === 'fact'}
										<div class="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center">
											<span class="iconify material-symbols--check text-[10px] text-black font-bold"></span>
										</div>
									{/if}
								</div>
								<div class="grow min-w-0">
									<span class="text-xs {isGreen ? 'text-secondary' : 'text-primary-dim'} font-headline font-bold uppercase tracking-tighter">{t(`game.${game.id}.playerLabel`)} {String(i + 1).padStart(2, '0')}</span>
									<p class="font-bold text-lg text-on-surface truncate">{player.name}</p>
								</div>
								<button
									onclick={() => removePlayer(player.id)}
									class="text-outline-variant hover:text-tertiary transition-colors p-2 active:scale-90"
								>
									<span class="iconify material-symbols--close"></span>
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Right column / sidebar: Config + Start -->
			<div class="lg:sticky lg:top-24">
				<GameConfig {game} {isGreen} bind:configImpostors bind:configTimer bind:configHint bind:configRounds bind:configTurnTimer {maxImpostors} playerCount={gameState.players.length} />

				<CategoryPicker {categories} bind:selectedCategory {isGreen} />

				<!-- Start Button -->
				<button
					onclick={startGame}
					disabled={gameState.players.length < 3}
					class="w-full py-5 rounded-xl bg-linear-to-r from-primary-dim to-primary text-on-primary-fixed font-headline font-bold text-xl uppercase tracking-widest shadow-[0_0_30px_rgba(156,66,244,0.3)] hover:shadow-[0_0_45px_rgba(156,66,244,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
				>
					{t('game.start')}
					<span class="iconify material-symbols--play-arrow"></span>
				</button>

				<!-- Stats summary -->
				<div class="flex items-center justify-center gap-8 py-4 px-6 mt-4 rounded-2xl bg-surface-container-highest/40 border border-outline-variant/10">
					<div class="flex flex-col items-center gap-1">
						<span class="{isGreen ? 'text-secondary' : 'text-primary-dim'} font-headline font-bold text-lg">{gameState.players.length}</span>
						<span class="text-[10px] uppercase tracking-widest text-on-surface-variant">{t('game.players')}</span>
					</div>
					<div class="w-px h-8 bg-outline-variant/20"></div>
					{#if game.type === 'draw'}
						<div class="flex flex-col items-center gap-1">
							<span class="text-primary font-headline font-bold text-lg">{configRounds}×{configTurnTimer}s</span>
							<span class="text-[10px] uppercase tracking-widest text-on-surface-variant">{t('game.rounds')}</span>
						</div>
					{:else}
						<div class="flex flex-col items-center gap-1">
							<span class="text-primary font-headline font-bold text-lg">{configImpostors}</span>
							<span class="text-[10px] uppercase tracking-widest text-on-surface-variant">{configImpostors === 1 ? t('results.impostor') : t('results.impostors')}</span>
						</div>
						{#if game.type === 'word'}
							<div class="w-px h-8 bg-outline-variant/20"></div>
							<div class="flex flex-col items-center gap-1">
								<span class="iconify {configHint ? 'material-symbols--lightbulb' : 'material-symbols--lightbulb-outline'} text-lg {configHint ? 'text-secondary' : 'text-outline-variant'}"></span>
								<span class="text-[10px] uppercase tracking-widest text-on-surface-variant">{configHint ? t('game.impostorHint') : t('discord.noHint')}</span>
							</div>
						{/if}
					{/if}
				</div>
			</div>
		</div>

	<!-- ═══════════════ REVEAL PHASE ═══════════════ -->
	{:else if gameState.phase === 'reveal'}
		<div class="lg:grid lg:grid-cols-[280px_1fr] lg:gap-12 lg:items-start max-w-5xl mx-auto">
			<!-- Desktop sidebar: player progress -->
			<div class="hidden lg:block lg:sticky lg:top-24">
				<div class="glass-panel rounded-2xl p-5 border border-outline-variant/10">
					<h4 class="font-headline text-sm font-bold tracking-tight mb-4 uppercase text-on-surface-variant">{t('reveal.progress')}</h4>
					{#each gameState.players as player, i}
						<div class="flex items-center gap-3 py-2 {i === gameState.currentRevealIndex ? (isGreen ? 'text-primary' : 'text-primary-dim') : i < gameState.currentRevealIndex ? (isGreen ? 'text-secondary' : 'text-primary-dim') : 'text-on-surface-variant opacity-40'}">
							<div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-headline
								{i === gameState.currentRevealIndex ? (isGreen ? 'bg-primary/20 ring-2 ring-primary text-primary' : 'bg-primary-dim/20 ring-2 ring-primary-dim text-primary-dim') : i < gameState.currentRevealIndex ? (isGreen ? 'bg-secondary/20 text-secondary' : 'bg-primary-dim/20 text-primary-dim') : 'bg-surface-container-high'}">
								{player.name.charAt(0).toUpperCase()}
							</div>
							<span class="font-bold text-sm">{player.name}</span>
							{#if i < gameState.currentRevealIndex}
								<span class="iconify material-symbols--check-circle text-sm {isGreen ? 'text-secondary' : 'text-primary-dim'} ml-auto"></span>
							{:else if i === gameState.currentRevealIndex}
								<span class="iconify material-symbols--arrow-forward text-sm {isGreen ? 'text-primary' : 'text-primary-dim'} ml-auto animate-pulse"></span>
							{/if}
						</div>
					{/each}
					<div class="mt-4 pt-4 border-t border-outline-variant/10">
						<p class="text-[10px] text-on-surface-variant uppercase tracking-widest">{t('reveal.of', { current: gameState.currentRevealIndex + 1, total: gameState.players.length })}</p>
						<div class="mt-2 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
							<div class="h-full bg-linear-to-r from-primary-dim to-primary rounded-full transition-all" style="width: {((gameState.currentRevealIndex + 1) / gameState.players.length) * 100}%"></div>
						</div>
					</div>
				</div>
			</div>

			<!-- Main: reveal card -->
			<div class="flex flex-col items-center justify-center min-h-[70dvh] relative">
				<!-- Ambient Glow -->
				<div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-dim/10 blur-[100px] rounded-full pointer-events-none"></div>

				<!-- Player Identification -->
				<div class="text-center mb-8">
					<div class="inline-flex items-center gap-2 bg-surface-container-highest/40 px-4 py-1.5 rounded-full border border-outline-variant/20 mb-4">
						<span class="w-2 h-2 rounded-full {isGreen ? 'bg-secondary shadow-[0_0_8px_#2ff801]' : 'bg-primary shadow-[0_0_8px_#ca98ff]'}"></span>
						<span class="font-headline {isGreen ? 'text-secondary' : 'text-primary-dim'} text-xs font-bold tracking-widest uppercase">{t('reveal.currentTurn')}</span>
					</div>
					{#if currentRevealPlayer}
						<h2 class="font-headline text-5xl font-bold tracking-tight text-on-background">{currentRevealPlayer.name.toUpperCase()}</h2>
					{/if}
					<p class="text-on-surface-variant mt-3 font-medium">{t('reveal.passDevice')}</p>
				</div>

				<!-- The Secret Card -->
				<div class="w-full max-w-sm aspect-3/4">
					<div class="relative w-full h-full glass-panel rounded-3xl border border-outline-variant/20 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-8 transition-all duration-500">
						<div class="absolute top-0 left-0 w-full h-1 {game.type === 'word' ? 'reveal-gradient' : 'bg-linear-to-r from-primary-dim to-primary'} opacity-50"></div>

						{#if !isRevealed}
							<!-- Hidden state -->
							<div class="mb-8 w-20 h-20 rounded-2xl bg-surface-container-low flex items-center justify-center border border-outline-variant/10">
								<span class="iconify material-symbols--visibility-off text-primary text-4xl"></span>
							</div>
							<div class="text-center space-y-4">
								<p class="font-headline text-on-surface-variant uppercase tracking-widest text-sm font-bold opacity-60">{t('reveal.hidden')}</p>
								<h3 class="font-headline text-2xl font-bold text-on-background leading-tight">{t(`game.${game.id}.revealHiddenText`)}</h3>
							</div>
							<div class="mt-8 flex flex-col items-center gap-2 filter blur-md opacity-20 select-none">
								<div class="h-8 w-32 bg-primary-container rounded-lg"></div>
								<div class="h-4 w-24 bg-outline-variant rounded-lg"></div>
							</div>
							<button
								onclick={revealCurrentRole}
								class="absolute inset-0 w-full h-full flex flex-col items-center justify-end pb-12 cursor-pointer"
							>
								<div class="reveal-gradient text-on-primary-fixed px-10 py-5 rounded-2xl font-headline font-bold text-xl tracking-tighter shadow-xl active:scale-95 transition-all flex items-center gap-3">
									<span class="iconify material-symbols--key"></span>
									{t('reveal.reveal')}
								</div>
							</button>
						{:else}
							<!-- Revealed state -->
							{#if revealedRole}
								{#if game.type === 'fact'}
									<!-- Fact reveal -->
									{#if revealedRole.role === 'impostor'}
										<span class="iconify material-symbols--person-off text-tertiary text-5xl mb-4"></span>
										<span class="font-headline text-xs font-bold text-tertiary tracking-[0.3em] uppercase mb-4">{t('reveal.intercepted')}</span>
										<div class="text-center px-2">
											<h3 class="font-headline text-3xl font-bold text-tertiary mb-3">{t('reveal.youAreImpostor')}</h3>
											<p class="font-body text-sm text-on-surface-variant leading-relaxed">
												{t('reveal.noFact')}
											</p>
										</div>
									{:else}
										<span class="font-headline text-xs font-bold text-on-surface-variant tracking-[0.3em] uppercase mb-6">{t('reveal.curiousFact')}</span>
										<div class="text-center px-2">
											<div class="mb-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-dim/10 border border-primary/20">
												<span class="iconify material-symbols--check-circle text-primary-dim text-sm"></span>
												<span class="font-body text-xs text-primary-dim uppercase tracking-widest font-bold">{t('reveal.realFact')}</span>
											</div>
											<p class="font-body text-lg font-medium leading-relaxed text-on-surface">
												{revealedRole.fact}
											</p>
											<p class="text-on-surface-variant text-xs mt-4 opacity-60">{t('reveal.rememberFact')}</p>
										</div>
									{/if}
								{:else}
									<!-- Word / Draw reveal -->
									<span class="font-headline text-xs font-bold text-on-surface-variant tracking-[0.3em] uppercase mb-8">
										{game.type === 'draw' ? t('reveal.yourMission') : t('reveal.incoming')}
									</span>
									<div class="text-center">
										{#if revealedRole.role === 'impostor'}
											<p class="font-body text-sm text-tertiary uppercase tracking-widest font-bold mb-2">{t('reveal.youAreImpostor')}</p>
											<h3 class="font-headline text-5xl font-bold text-tertiary neon-glow-primary tracking-tighter">{revealedRole.word}</h3>
											{#if game.type === 'draw'}
												<p class="text-on-surface-variant text-xs mt-3">{t('reveal.drawDisguise')}</p>
											{/if}
										{:else}
											<p class="font-body text-sm {isGreen ? 'text-secondary neon-glow-secondary' : 'text-primary-dim neon-glow-primary'} uppercase tracking-widest font-bold mb-2">
												{game.type === 'draw' ? t('reveal.draw') : t('reveal.theWordIs')}
											</p>
											<h3 class="font-headline text-5xl font-bold text-primary neon-glow-primary tracking-tighter">{revealedRole.word}</h3>
										{/if}
									</div>
								{/if}
								<button
									onclick={hideRole}
									class="mt-12 flex items-center gap-3 bg-surface-container-low hover:bg-surface-container-high text-on-surface px-8 py-4 rounded-xl border border-outline-variant/30 transition-all active:scale-95"
								>
									<span class="iconify material-symbols--visibility-off text-primary"></span>
									<span class="font-headline font-bold text-sm tracking-widest uppercase">{t('reveal.hide')}</span>
								</button>
							{/if}
						{/if}
					</div>
				</div>

				<!-- Warning -->
				<div class="mt-8 flex items-start gap-4 max-w-xs bg-tertiary/5 border border-tertiary/10 p-4 rounded-2xl">
					<span class="iconify material-symbols--warning text-tertiary shrink-0"></span>
					<p class="text-xs text-on-surface-variant font-medium leading-relaxed">
						{#if game.type === 'fact'}
							{t('reveal.warningFact')}
						{:else if game.type === 'draw'}
							{t('reveal.warningDraw')}
						{:else}
							{t('reveal.warningWord')}
						{/if}
					</p>
				</div>
			</div>
		</div>

		<!-- Bottom Nav -->
		<nav class="fixed bottom-0 left-0 w-full z-50 flex flex-col items-center px-4 pb-6 pt-2 bg-background/80 backdrop-blur-xl border-t border-outline-variant/20 rounded-t-2xl">
			{#if gameState.currentRevealIndex < gameState.players.length - 1}
				<button
					onclick={nextPlayer}
					class="w-full max-w-xs flex items-center justify-center gap-3 bg-linear-to-r from-primary-dim to-primary text-on-primary-fixed rounded-2xl py-4 active:scale-95 transition-all shadow-[0_0_20px_rgba(156,66,244,0.4)]"
				>
					<span class="iconify material-symbols--arrow-forward text-2xl"></span>
					<span class="font-headline font-black text-lg uppercase tracking-tight">{t('reveal.nextPlayer')}</span>
				</button>
			{:else}
				<button
					onclick={game.type === 'draw' ? nextPlayer : startPlaying}
					class="w-full max-w-xs flex items-center justify-center gap-3 bg-linear-to-r {game.type === 'word' ? 'from-secondary-container to-secondary text-on-secondary' : 'from-primary-dim to-primary text-on-primary-fixed'} rounded-2xl py-4 active:scale-95 transition-all shadow-[0_0_20px_rgba(156,66,244,0.3)]"
				>
					<span class="iconify {game.type === 'draw' ? 'material-symbols--draw' : 'material-symbols--play-arrow'} text-2xl"></span>
					<span class="font-headline font-black text-lg uppercase tracking-tight">
						{game.type === 'draw' ? t('reveal.startDrawing') : game.type === 'fact' ? t('reveal.startDiscussion') : t('reveal.startGame')}
					</span>
				</button>
			{/if}
		</nav>

	<!-- ═══════════════ PLAYING PHASE (word + fact) ═══════════════ -->
	{:else if gameState.phase === 'playing' && (game.type === 'word' || game.type === 'fact')}
		<div class="max-w-4xl mx-auto lg:grid lg:grid-cols-[1fr_340px] lg:gap-12 lg:items-start">
			<div>
				<!-- Timer Section -->
				<section class="mb-10 text-center relative">
					<div class="inline-block px-4 py-1 rounded-full {isGreen ? 'bg-secondary-container/20 border border-secondary/30' : 'bg-primary-container/20 border border-primary/30'} mb-4">
						<span class="font-headline {isGreen ? 'text-secondary' : 'text-primary-dim'} text-xs font-bold tracking-widest uppercase">
							{game.type === 'fact' ? t('playing.discussion') : t('playing.inProgress')}
						</span>
					</div>
					{#if game.type === 'fact'}
						<p class="text-on-surface-variant text-sm mb-4 max-w-md mx-auto">
							{t('playing.factInstructions')}
						</p>
					{/if}
					<div class="relative py-8">
						<div class="absolute inset-0 flex items-center justify-center opacity-10">
							<div class="w-48 h-48 rounded-full border-4 border-primary blur-xl"></div>
						</div>
						<h2 class="font-headline text-6xl lg:text-8xl font-bold tracking-tighter {isGreen ? 'text-primary' : 'text-primary-dim'} drop-shadow-[0_0_15px_rgba(202,152,255,0.4)]">
							{formatTime((gameState as any).timerRemaining)}
						</h2>
						<p class="font-body text-on-surface-variant text-sm mt-2 font-medium">{t('playing.timeRemaining')}</p>
					</div>
					<div class="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden mt-6">
						<div
							class="h-full bg-linear-to-r from-primary-dim to-primary rounded-full shadow-[0_0_8px_rgba(202,152,255,0.6)] transition-all duration-1000"
							style="width: {((gameState as any).timerRemaining / (gameState as any).config.timerSeconds) * 100}%"
						></div>
					</div>
				</section>
			</div>

			<!-- Player List -->
			<section class="lg:sticky lg:top-24">
				<div class="flex items-center justify-between mb-6">
					<h4 class="font-headline text-lg font-bold tracking-tight">{t('playing.playersCount', { count: alivePlayers.length })}</h4>
					<div class="flex items-center gap-2">
						<div class="w-2 h-2 rounded-full {isGreen ? 'bg-secondary' : 'bg-primary'} animate-pulse"></div>
						<span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{t('playing.live')}</span>
					</div>
				</div>
				<div class="grid grid-cols-1 gap-3">
					{#each gameState.players as player}
						<div class="bg-surface-container-{player.eliminated ? 'low' : 'high'} p-4 rounded-xl border border-outline-variant/10 flex items-center gap-4 {player.eliminated ? 'opacity-50' : ''}">
							<div class="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center text-lg font-bold font-headline {isGreen ? 'text-primary' : 'text-primary-dim'} border-2 {player.eliminated ? 'border-outline-variant/30 grayscale' : (isGreen ? 'border-secondary' : 'border-primary')}">
								{player.name.charAt(0).toUpperCase()}
							</div>
							<div>
								<p class="font-body font-bold text-on-surface">{player.name}</p>
								<p class="text-[10px] {player.eliminated ? 'text-tertiary' : 'text-on-surface-variant'} font-bold uppercase tracking-tighter">
									{player.eliminated ? t('playing.eliminated') : t('playing.inGame')}
								</p>
							</div>
						</div>
					{/each}
				</div>
			</section>
		</div>

		<!-- Go to voting button -->
		<nav class="fixed bottom-0 left-0 w-full z-50 flex flex-col items-center px-4 pb-6 pt-2 bg-background/80 backdrop-blur-xl border-t border-outline-variant/20 rounded-t-2xl">
			<button
				onclick={goToVoting}
				class="w-full max-w-xs flex items-center justify-center gap-3 bg-linear-to-r from-tertiary-dim to-tertiary text-on-tertiary-fixed rounded-2xl py-4 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,112,115,0.3)]"
			>
				<span class="iconify material-symbols--how-to-vote text-2xl"></span>
				<span class="font-headline font-black text-lg uppercase tracking-tight">{t('playing.voteNow')}</span>
			</button>
		</nav>

	<!-- ═══════════════ DRAWING PHASE (draw only) ═══════════════ -->
	{:else if gameState.phase === 'drawing' && game.type === 'draw'}
		<div class="max-w-4xl mx-auto lg:grid lg:grid-cols-[1fr_280px] lg:gap-8 lg:items-start">
			<div>
				<div class="text-center mb-6">
					<div class="inline-block px-4 py-1 rounded-full bg-primary-dim/10 border border-primary/30 mb-3">
						<span class="font-headline text-primary-dim text-xs font-bold tracking-widest uppercase">{t('drawing.roundOf', { current: (gameState as any).currentRound, total: (gameState as any).config.rounds })}</span>
					</div>
					{#if currentDrawer}
						<h2 class="font-headline text-3xl lg:text-4xl font-bold tracking-tight">
							Turno de <span class="text-primary-dim">{currentDrawer.name}</span>
						</h2>
					{/if}
					<p class="text-on-surface-variant text-sm mt-1">{t('drawing.drawAndPass')}</p>
				</div>

				<!-- Timer -->
				<div class="flex items-center justify-center gap-4 mb-6">
					<div class="text-center">
						<span class="font-headline text-4xl font-bold text-primary-dim">{(gameState as any).turnTimerRemaining}</span>
						<span class="text-on-surface-variant text-sm">s</span>
					</div>
					<div class="w-32 h-2 bg-surface-container-highest rounded-full overflow-hidden">
						<div class="h-full bg-linear-to-r from-primary-dim to-primary rounded-full transition-all duration-1000"
							style="width: {((gameState as any).turnTimerRemaining / (gameState as any).config.timerPerTurn) * 100}%"></div>
					</div>
				</div>

				<!-- Canvas -->
				<DrawingCanvas
					strokes={(gameState as any).strokes}
					enabled={!hasDrawnStroke}
					color={STROKE_COLORS[(gameState as any).currentDrawerIndex % STROKE_COLORS.length]}
					{onStrokeComplete}
				/>

				{#if hasDrawnStroke}
					<p class="text-center text-primary-dim font-bold text-sm mt-4 animate-pulse">{t('drawing.strokeDone')}</p>
				{/if}
			</div>

			<!-- Sidebar: Player order -->
			<div class="hidden lg:block lg:sticky lg:top-24">
				<div class="glass-panel rounded-2xl p-5 border border-outline-variant/10">
					<h4 class="font-headline text-sm font-bold tracking-tight mb-4 uppercase text-on-surface-variant">{t('drawing.order')}</h4>
					{#each alivePlayers as player, i}
						<div class="flex items-center gap-3 py-2 {i === (gameState as any).currentDrawerIndex ? 'text-primary-dim' : 'text-on-surface-variant opacity-50'}">
							<div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-headline ring-2"
								style="background: {STROKE_COLORS[i % STROKE_COLORS.length]}20; ring-color: {STROKE_COLORS[i % STROKE_COLORS.length]}; color: {STROKE_COLORS[i % STROKE_COLORS.length]}">
								{player.name.charAt(0).toUpperCase()}
							</div>
							<div class="flex items-center gap-2">
								<div class="w-3 h-3 rounded-full shrink-0" style="background: {STROKE_COLORS[i % STROKE_COLORS.length]}"></div>
								<span class="font-bold text-sm">{player.name}</span>
							</div>
							{#if i < (gameState as any).currentDrawerIndex}
								<span class="iconify material-symbols--check-circle text-sm ml-auto"></span>
							{:else if i === (gameState as any).currentDrawerIndex}
								<span class="iconify material-symbols--draw text-sm ml-auto animate-pulse"></span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>

		<nav class="fixed bottom-0 left-0 w-full z-50 flex flex-col items-center px-4 pb-6 pt-2 bg-background/80 backdrop-blur-xl border-t border-outline-variant/20 rounded-t-2xl">
			<button
				onclick={hasDrawnStroke ? finishCurrentTurn : undefined}
				disabled={!hasDrawnStroke}
				class="w-full max-w-xs flex items-center justify-center gap-3 bg-linear-to-r from-primary-dim to-primary text-on-primary-fixed rounded-2xl py-4 active:scale-95 transition-all shadow-[0_0_20px_rgba(156,66,244,0.3)] disabled:opacity-40"
			>
				<span class="iconify material-symbols--arrow-forward text-2xl"></span>
				<span class="font-headline font-black text-lg uppercase tracking-tight">{hasDrawnStroke ? t('drawing.passTurn') : t('drawing.drawStroke')}</span>
			</button>
		</nav>

	<!-- ═══════════════ VOTING PHASE ═══════════════ -->
	{:else if gameState.phase === 'voting'}
		<section class="text-center mb-8">
			<div class="inline-block px-4 py-1 rounded-full bg-tertiary/10 border border-tertiary/30 mb-4">
				<span class="font-headline text-tertiary text-xs font-bold tracking-widest uppercase">{t('voting.title')}</span>
			</div>
			<h2 class="font-headline text-3xl font-bold tracking-tight">{t(`game.${game.id}.votingTitle`)}</h2>
			<p class="text-on-surface-variant mt-2 text-sm">{t(`game.${game.id}.votingSubtitle`)}</p>
		</section>

		<!-- Show drawing before voting (draw only) -->
		{#if game.type === 'draw'}
			<div class="mb-8">
				<DrawingCanvas strokes={(gameState as any).strokes} enabled={false} />
			</div>
		{/if}

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8 max-w-3xl mx-auto">
			{#each alivePlayers as player, i}
				<button
					onclick={() => castVote(player.id)}
					class="bg-surface-container-high p-4 rounded-xl flex items-center gap-4 border-2 transition-all active:scale-[0.98]
						{votingTarget === player.id ? 'border-tertiary shadow-[0_0_15px_rgba(255,112,115,0.3)]' : 'border-outline-variant/10'}"
				>
					{#if game.type === 'draw'}
						<div class="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold font-headline border-2"
							style="border-color: {STROKE_COLORS[i % STROKE_COLORS.length]}; color: {STROKE_COLORS[i % STROKE_COLORS.length]}">
							{player.name.charAt(0).toUpperCase()}
						</div>
					{:else}
						<div class="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center text-lg font-bold font-headline {isGreen ? 'text-primary' : 'text-primary-dim'}">
							{player.name.charAt(0).toUpperCase()}
						</div>
					{/if}
					<p class="font-body font-bold text-on-surface grow text-left">{player.name}</p>
					{#if votingTarget === player.id}
						<span class="iconify material-symbols--check-circle text-tertiary"></span>
					{/if}
				</button>
			{/each}
		</div>

		<nav class="fixed bottom-0 left-0 w-full z-50 flex flex-col items-center px-4 pb-6 pt-2 bg-background/80 backdrop-blur-xl border-t border-outline-variant/20 rounded-t-2xl">
			<button
				onclick={confirmVotes}
				disabled={!votingTarget}
				class="w-full max-w-xs flex items-center justify-center gap-3 bg-linear-to-r from-tertiary-dim to-tertiary text-on-tertiary-fixed rounded-2xl py-4 active:scale-95 transition-all disabled:opacity-40"
			>
				<span class="iconify material-symbols--gavel text-2xl"></span>
				<span class="font-headline font-black text-lg uppercase tracking-tight">{t('voting.confirm')}</span>
			</button>
		</nav>

	<!-- ═══════════════ RESULTS PHASE ═══════════════ -->
	{:else if gameState.phase === 'results' && results}
		<div class="flex flex-col items-center justify-center min-h-[70dvh] text-center">
			<div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-dim/10 blur-[100px] rounded-full pointer-events-none"></div>

			<div class="mb-8">
				<div class="inline-flex items-center gap-2 bg-tertiary/10 px-4 py-1.5 rounded-full border border-tertiary/20 mb-4">
					<span class="font-headline text-tertiary text-xs font-bold tracking-widest uppercase">{t('results.finalResult')}</span>
				</div>
			</div>

			<!-- Impostor reveal -->
			{#each (results as any).impostors as imp}
				<div class="mb-6">
					<div class="w-24 h-24 rounded-full bg-surface-container-highest mx-auto flex items-center justify-center text-3xl font-bold font-headline text-tertiary ring-4 ring-tertiary/30 mb-4">
						{imp.name.charAt(0).toUpperCase()}
					</div>
					<h2 class="font-headline text-4xl font-bold tracking-tight text-tertiary neon-glow-primary">{imp.name.toUpperCase()}</h2>
					<p class="text-tertiary font-headline uppercase tracking-widest text-sm font-bold mt-2">{t('results.wasImpostor')}</p>
					{#if game.type === 'fact'}
						<p class="text-on-surface-variant text-xs mt-1">{t('results.inventedFact')}</p>
					{/if}
				</div>
			{/each}

			<!-- Drawing (draw only) -->
			{#if game.type === 'draw' && (results as any).strokes}
				<div class="w-full max-w-md mb-8">
					<DrawingCanvas strokes={(results as any).strokes} enabled={false} />
				</div>
			{/if}

			<!-- Words reveal (word + draw) -->
			{#if game.type === 'word' || game.type === 'draw'}
				<div class="w-full max-w-sm glass-panel rounded-2xl p-6 border border-outline-variant/20 mb-8">
					<div class="mb-4">
						<p class="text-on-surface-variant text-xs uppercase tracking-widest font-bold mb-1">{t('results.secretWord')}</p>
						<h3 class="font-headline text-3xl font-bold text-primary neon-glow-primary">{(results as any).secretWord}</h3>
					</div>
					<div class="h-px bg-outline-variant/20 my-4"></div>
					<div>
						<p class="text-on-surface-variant text-xs uppercase tracking-widest font-bold mb-1">{t('results.impostorWord')}</p>
						<h3 class="font-headline text-3xl font-bold text-tertiary">{(results as any).impostorWord || '???'}</h3>
					</div>
				</div>
			{/if}

			<!-- Player facts (fact game) -->
			{#if game.type === 'fact'}
				<div class="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
					{#each gameState.players as player}
						{@const role = gameState.roles.find(r => r.playerId === player.id)}
						<div class="bg-surface-container-high p-4 rounded-xl border border-outline-variant/10 text-left">
							<div class="flex items-center gap-3 mb-2">
								<div class="w-10 h-10 rounded-full flex items-center justify-center font-bold font-headline shrink-0
									{role?.role === 'impostor' ? 'bg-tertiary/20 text-tertiary ring-2 ring-tertiary/30' : 'bg-surface-container-lowest text-primary-dim'}"
								>
									{player.name.charAt(0).toUpperCase()}
								</div>
								<div>
									<p class="font-bold text-sm text-on-surface">{player.name}</p>
									<p class="text-[10px] uppercase tracking-widest font-bold {role?.role === 'impostor' ? 'text-tertiary' : 'text-primary-dim'}">
										{role?.role === 'impostor' ? t('results.impostor') : t(`game.${game.id}.citizenLabel`)}
									</p>
								</div>
							</div>
							<p class="text-xs text-on-surface-variant leading-relaxed pl-13">
								{role?.role === 'impostor' ? t('results.inventedFactShort') : (role as any)?.fact}
							</p>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Player grid (word + draw) -->
			{#if game.type === 'word' || game.type === 'draw'}
				<div class="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
					{#each gameState.players as player}
						{@const role = gameState.roles.find(r => r.playerId === player.id)}
						<div class="bg-surface-container-high p-3 rounded-xl border border-outline-variant/10 text-center">
							<div class="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-bold font-headline
								{role?.role === 'impostor' ? 'bg-tertiary/20 text-tertiary ring-2 ring-tertiary/30' : (isGreen ? 'bg-surface-container-lowest text-primary' : 'bg-surface-container-lowest text-primary-dim')}"
							>
								{player.name.charAt(0).toUpperCase()}
							</div>
							<p class="font-bold text-sm text-on-surface">{player.name}</p>
							<p class="text-[10px] uppercase tracking-widest font-bold {role?.role === 'impostor' ? 'text-tertiary' : (isGreen ? 'text-secondary' : 'text-primary-dim')}">
								{role?.role === 'impostor' ? t('results.impostor') : t(`game.${game.id}.citizenLabel`)}
							</p>
						</div>
					{/each}
				</div>
			{/if}

			<div class="flex gap-3 w-full max-w-sm lg:max-w-md">
				<button
					onclick={playAgain}
					class="flex-1 py-4 rounded-xl bg-linear-to-r from-primary-dim to-primary text-on-primary-fixed font-headline font-bold uppercase tracking-widest active:scale-95 transition-all"
				>
					Jugar de nuevo
				</button>
				<a
					href="/"
					class="py-4 px-6 rounded-xl bg-surface-container-high text-on-surface font-headline font-bold uppercase tracking-widest active:scale-95 transition-all border border-outline-variant/20 text-center"
				>
					Salir
				</a>
			</div>
		</div>
	{/if}

	<!-- ═══════════════ GUESS GAME (Palabra Oculta) ═══════════════ -->
	{#if isGuessGame && guessState}
		{#if guessState.phase === 'lobby'}
			<div class="max-w-lg mx-auto">
				<GameHero {game} isGreen={false} bind:iconEl={heroIconEl} bind:titleEl={heroTitleEl} />

				<p class="text-on-surface-variant text-center mb-6">{t('guess.pickCategory')}</p>

				<!-- Category grid -->
				<div class="grid grid-cols-2 gap-3 mb-8">
					{#each categories as cat}
						<button
							onclick={() => { selectedCategory = selectedCategory === cat.name ? undefined : cat.name; }}
							class="p-4 rounded-xl border-2 text-center font-bold font-headline transition-all active:scale-95 {selectedCategory === cat.name ? 'border-cyan-500 bg-cyan-500/15 text-cyan-400' : 'border-outline-variant/20 bg-surface-container-high text-on-surface hover:border-outline-variant/40'}"
						>
							{cat.name}
						</button>
					{/each}
				</div>

				<button
					onclick={startGuessGame}
					class="w-full py-5 rounded-xl bg-linear-to-r from-cyan-600 to-cyan-400 text-white font-headline font-bold text-xl uppercase tracking-widest shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_45px_rgba(6,182,212,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
				>
					{t('game.start')}
					<span class="iconify material-symbols--play-arrow"></span>
				</button>
			</div>

		{:else if guessState.phase === 'playing'}
			<div class="max-w-lg mx-auto">
				<!-- Category badge -->
				<div class="text-center mb-6">
					<span class="inline-flex items-center gap-2 bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20">
						<span class="font-headline text-cyan-400 text-xs font-bold tracking-widest uppercase">{guessState.category}</span>
					</span>
					<p class="text-on-surface-variant text-sm mt-2">{t('guess.attempts', { count: guessState.attempts })}</p>
				</div>

				<!-- Alphabet range -->
				<div class="flex flex-wrap justify-center gap-1 mb-6">
					{#each 'abcdefghijklmnopqrstuvwxyz'.split('') as letter}
						{@const active = letter >= guessState.activeRange[0] && letter <= guessState.activeRange[1]}
						<span class="w-7 h-7 flex items-center justify-center rounded text-xs font-bold font-mono uppercase transition-all {active ? 'bg-cyan-500/20 text-cyan-400' : 'bg-surface-container-high/30 text-outline-variant/30'}">{letter}</span>
					{/each}
				</div>

				<!-- Guess input -->
				<form onsubmit={(e) => { e.preventDefault(); submitGuess(); }} class="glass-panel p-1 rounded-xl mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
					<div class="flex items-center gap-2 bg-surface-container-lowest rounded-lg p-2">
						<div class="grow flex items-center px-3">
							<span class="iconify material-symbols--search text-outline mr-3"></span>
							<input
								bind:value={guessInput}
								class="bg-transparent border-none focus:outline-none text-on-surface w-full font-medium placeholder:text-outline/50"
								placeholder={t('guess.typeGuess')}
								type="text"
								maxlength="30"
							/>
						</div>
						<button
							type="submit"
							disabled={!guessInput.trim()}
							class="bg-linear-to-r from-cyan-600 to-cyan-400 text-white px-6 py-3 rounded-lg font-bold transition-transform active:scale-95 flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-40"
						>
							{t('guess.guess')}
						</button>
					</div>
				</form>

				<!-- Guesses list -->
				{#if guessState.guesses.length > 0}
					<div class="space-y-2">
						{#each guessState.guesses as g, i}
							<div class="bg-surface-container-high p-4 rounded-xl flex items-center justify-between border border-outline-variant/10 {g.distance === 0 ? 'ring-2 ring-green-400/50 bg-green-500/10' : ''}">
								<div class="flex items-center gap-3">
									{#if g.direction === 'down'}
										<span class="text-cyan-400 text-lg">↓</span>
									{:else if g.direction === 'up'}
										<span class="text-amber-400 text-lg">↑</span>
									{:else}
										<span class="text-green-400 text-lg">✓</span>
									{/if}
									<span class="font-bold text-on-surface">{g.word}</span>
								</div>
								<div class="flex items-center gap-3">
									<span class="text-xs {getDistanceColor(g.distance)} font-bold">{getDistanceLabel(g.distance)}</span>
									<span class="font-mono text-sm {getDistanceColor(g.distance)} font-bold min-w-[3ch] text-right">{g.distance}</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

		{:else if guessState.phase === 'results'}
			<div class="flex flex-col items-center justify-center min-h-[70dvh] text-center max-w-lg mx-auto">
				<div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>

				<div class="mb-6">
					<span class="inline-flex items-center gap-2 bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/20 mb-4">
						<span class="iconify material-symbols--check-circle text-green-400"></span>
						<span class="font-headline text-green-400 text-xs font-bold tracking-widest uppercase">{t('guess.youWon')}</span>
					</span>
				</div>

				<h2 class="font-headline text-5xl font-bold tracking-tight text-cyan-400 mb-2">{guessState.targetWord.toUpperCase()}</h2>
				<p class="text-on-surface-variant text-sm mb-2">{t('guess.theWordWas')}</p>
				<p class="text-on-surface-variant text-sm mb-8">{t('guess.attempts', { count: guessState.attempts })}</p>

				<!-- Guesses recap -->
				<div class="w-full space-y-2 mb-8">
					{#each guessState.guesses as g}
						<div class="bg-surface-container-high p-3 rounded-xl flex items-center justify-between border border-outline-variant/10 {g.distance === 0 ? 'ring-2 ring-green-400/50 bg-green-500/10' : ''}">
							<span class="font-bold text-on-surface">{g.word}</span>
							<span class="font-mono text-sm {getDistanceColor(g.distance)} font-bold">{g.distance}</span>
						</div>
					{/each}
				</div>

				<div class="flex gap-3 w-full">
					<button
						onclick={resetGuessGame}
						class="flex-1 py-4 rounded-xl bg-linear-to-r from-cyan-600 to-cyan-400 text-white font-headline font-bold uppercase tracking-widest active:scale-95 transition-all"
					>
						{t('guess.playAgain')}
					</button>
					<a
						href="/"
						class="py-4 px-6 rounded-xl bg-surface-container-high text-on-surface font-headline font-bold uppercase tracking-widest active:scale-95 transition-all border border-outline-variant/20 text-center"
					>
						{t('game.exit')}
					</a>
				</div>
			</div>
		{/if}
	{/if}
</main>
