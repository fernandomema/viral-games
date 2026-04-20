<script lang="ts">
	import type { GameDef } from '$lib/games/registry';
	import { createRoscoGame, type RoscoEngine } from '$lib/games/rosco';
	import { ROSCO_LETTERS, type LetterStatus, type RoscoState, type PlayerRosco } from '$lib/games/rosco/types';
	import { haptic, hapticTap } from '$lib/haptics';
	import { t, getLocale } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { loadPlayers } from '$lib/players-store';
	import { browser } from '$app/environment';

	let { data } = $props();
	let game: GameDef = $derived(data.game);

	// ── Engine ────────────────────────────────────────────────────
	let engine: RoscoEngine = createRoscoGame(getLocale());
	let roscoState: RoscoState = $state(engine.getState());

	// Load players from store and auto-start
	const saved = loadPlayers();
	if (saved.length > 0) {
		for (const p of saved) engine.addPlayer(p.name);
		const timer = browser ? parseInt(sessionStorage.getItem('rosco-timer') ?? '120', 10) : 120;
		engine.setConfig({ timerSeconds: timer });
		engine.startGame();
		roscoState = engine.getState();
	}

	// ── Local state ───────────────────────────────────────────────
	let currentPlayerIdx = $state(0);
	let answerInput = $state('');
	let answerInputEl: HTMLInputElement | undefined = $state(undefined);
	let lastResult: 'correct' | 'incorrect' | null = $state(null);
	let timerInterval: ReturnType<typeof setInterval> | null = null;

	function sync() {
		roscoState = engine.getState();
	}

	// Auto-start timer when playing
	$effect(() => {
		if (roscoState.phase === 'playing' && !timerInterval) {
			startTimer();
			queueMicrotask(() => answerInputEl?.focus());
		}
	});

	// ── Timer ─────────────────────────────────────────────────────
	function startTimer() {
		stopTimer();
		timerInterval = setInterval(() => {
			engine.tick();
			sync();
			if (roscoState.phase === 'results') {
				stopTimer();
				haptic('success');
			}
		}, 1000);
	}

	function stopTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	// ── Playing ───────────────────────────────────────────────────
	let currentPlayer = $derived(roscoState.players[currentPlayerIdx] ?? null);
	let currentRosco = $derived<PlayerRosco | null>(currentPlayer ? roscoState.playerRoscos[currentPlayer.id] ?? null : null);
	let currentLetter = $derived(currentRosco ? ROSCO_LETTERS[currentRosco.currentLetterIdx] : null);
	let currentClue = $derived(currentLetter ? roscoState.clues.find((c: { letter: string }) => c.letter === currentLetter) : null);

	function submitAnswer() {
		if (!currentPlayer || !answerInput.trim()) return;
		const correct = engine.answer(currentPlayer.id, answerInput.trim());
		lastResult = correct ? 'correct' : 'incorrect';
		answerInput = '';
		sync();
		if (correct) haptic('success'); else haptic('nudge');
		setTimeout(() => { lastResult = null; }, 800);

		checkAdvanceTurn();
		queueMicrotask(() => answerInputEl?.focus());
	}

	function passTurn() {
		if (!currentPlayer) return;
		engine.pass(currentPlayer.id);
		sync();
		hapticTap();

		checkAdvanceTurn();
		queueMicrotask(() => answerInputEl?.focus());
	}

	function checkAdvanceTurn() {
		if (roscoState.phase === 'results') {
			stopTimer();
			haptic('success');
			return;
		}
		const rosco = roscoState.playerRoscos[currentPlayer!.id];
		if (rosco?.finished && roscoState.players.length > 1) {
			nextPlayerTurn();
		}
	}

	function nextPlayerTurn() {
		for (let i = 1; i <= roscoState.players.length; i++) {
			const idx = (currentPlayerIdx + i) % roscoState.players.length;
			const r = roscoState.playerRoscos[roscoState.players[idx].id];
			if (r && !r.finished) {
				currentPlayerIdx = idx;
				answerInput = '';
				queueMicrotask(() => answerInputEl?.focus());
				return;
			}
		}
		engine.setPhase('results');
		sync();
		stopTimer();
		haptic('success');
	}

	// ── Results ───────────────────────────────────────────────────
	let winners = $derived(engine.getWinners());

	let sortedResults = $derived(
		roscoState.players
			.map((p: { id: string; name: string }) => {
				const r = roscoState.playerRoscos[p.id];
				return { ...p, correct: r?.correctCount ?? 0, incorrect: r?.incorrectCount ?? 0, rosco: r };
			})
			.sort((a: { correct: number }, b: { correct: number }) => b.correct - a.correct)
	);

	function playAgain() {
		engine.reset();
		// Re-add players and restart
		const players = loadPlayers();
		for (const p of players) engine.addPlayer(p.name);
		engine.startGame();
		currentPlayerIdx = 0;
		answerInput = '';
		lastResult = null;
		sync();
		startTimer();
		haptic('success');
		queueMicrotask(() => answerInputEl?.focus());
	}

	function goBack() { goto('/rosco'); }
	function goHome() { goto('/'); }

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
</script>

<svelte:head>
	<title>Rosco Veloz — Jugar Gratis | Viral Games</title>
	<meta name="description" content="Juega al Rosco Veloz: responde una definición por cada letra del abecedario. ¡Compite con tus amigos!" />
</svelte:head>

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

<!-- ══════════ NO PLAYERS (redirect) ══════════ -->
{#if roscoState.phase === 'lobby'}
	<div class="text-center pt-20">
		<p class="text-on-surface-variant mb-4">No hay jugadores configurados</p>
		<button
			onclick={goBack}
			class="px-6 py-3 rounded-xl bg-pink-600 text-white font-bold font-headline uppercase tracking-wider active:scale-95 transition-all"
		>
			Volver al lobby
		</button>
	</div>


<!-- ══════════ PLAYING ══════════ -->
{:else if roscoState.phase === 'playing' && currentPlayer && currentRosco}
	<!-- Timer bar -->
	<div class="mb-4 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<span class="iconify material-symbols--timer text-pink-400 text-lg"></span>
			<span class="font-headline font-bold text-lg {roscoState.timerRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-on-surface'}">
				{formatTime(roscoState.timerRemaining)}
			</span>
		</div>
		{#if roscoState.players.length > 1}
			<div class="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/10">
				<div class="w-3 h-3 rounded-full" style="background: {PLAYER_COLORS[currentPlayerIdx % PLAYER_COLORS.length]}"></div>
				<span class="text-sm font-bold text-on-surface">{currentPlayer.name}</span>
			</div>
		{/if}
	</div>

	<!-- Rosco wheel -->
	<div class="relative mx-auto mb-6" style="width: min(340px, 90vw); height: min(340px, 90vw)">
		<svg viewBox="0 0 340 340" class="w-full h-full">
			{#each ROSCO_LETTERS as letter, i}
				{@const angle = (i / 27) * 2 * Math.PI - Math.PI / 2}
				{@const cx = 170 + 145 * Math.cos(angle)}
				{@const cy = 170 + 145 * Math.sin(angle)}
				{@const status = currentRosco.statuses[letter] ?? 'pending'}
				{@const isCurrent = currentRosco.currentLetterIdx === i && !currentRosco.finished}

				<!-- Ring segment -->
				<circle
					cx={cx} cy={cy} r={isCurrent ? 17 : 14}
					class="{statusColorRing(status)} transition-all duration-200"
					fill="none"
					stroke-width={isCurrent ? 3 : 1.5}
				/>
				<!-- Fill -->
				<circle
					cx={cx} cy={cy} r={isCurrent ? 15 : 12.5}
					class="transition-all duration-200"
					fill={status === 'correct' ? '#22c55e' : status === 'incorrect' ? '#ef4444' : status === 'passed' ? '#eab308' : isCurrent ? '#a855f7' : '#25252c'}
				/>
				<!-- Letter -->
				<text
					x={cx} y={cy}
					text-anchor="middle"
					dominant-baseline="central"
					class="font-bold select-none pointer-events-none"
					fill={status !== 'pending' || isCurrent ? 'white' : '#9ca3af'}
					font-size={isCurrent ? '14' : '11'}
				>{letter}</text>

				{#if isCurrent}
					<!-- Pulse ring for current letter -->
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
			<text x="170" y="148" text-anchor="middle" fill="#22c55e" font-size="28" class="font-bold">{currentRosco.correctCount}</text>
			<text x="170" y="168" text-anchor="middle" fill="#9ca3af" font-size="10" class="uppercase">{t('rosco.correct')}</text>
			<text x="140" y="200" text-anchor="middle" fill="#ef4444" font-size="18" class="font-bold">{currentRosco.incorrectCount}</text>
			<text x="200" y="200" text-anchor="middle" fill="#eab308" font-size="18" class="font-bold">
				{Object.values(currentRosco.statuses).filter(s => s === 'pending' || s === 'passed').length}
			</text>
			<text x="140" y="215" text-anchor="middle" fill="#9ca3af" font-size="8" class="uppercase">{t('rosco.incorrect')}</text>
			<text x="200" y="215" text-anchor="middle" fill="#9ca3af" font-size="8" class="uppercase">{t('rosco.pending')}</text>
		</svg>
	</div>

	<!-- Clue card -->
	{#if currentClue && currentLetter && !currentRosco.finished}
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
	{:else if currentRosco.finished}
		<!-- Current player done -->
		<div class="glass-panel rounded-2xl p-6 border border-outline-variant/10 text-center">
			<span class="iconify material-symbols--check-circle text-green-500 text-4xl mb-2"></span>
			<p class="text-on-surface font-bold text-lg">{currentPlayer.name} ha terminado</p>
			<p class="text-on-surface-variant text-sm mt-1">{currentRosco.correctCount} {t('rosco.correct')}</p>
			{#if roscoState.players.length > 1}
				<button
					onclick={nextPlayerTurn}
					class="mt-4 px-6 py-3 rounded-xl bg-purple-600 text-white font-bold font-headline uppercase tracking-wider active:scale-95 transition-all"
				>
					Siguiente jugador
				</button>
			{/if}
		</div>
	{/if}

	<!-- Multi-player scoreboard (bottom strip) -->
	{#if roscoState.players.length > 1}
		<div class="flex gap-2 mt-6 overflow-x-auto pb-2">
			{#each roscoState.players as player, i}
				{@const r = roscoState.playerRoscos[player.id]}
				<div
					class="shrink-0 px-3 py-2 rounded-xl border transition-all text-center min-w-20
						{currentPlayerIdx === i ? 'border-purple-500/50 bg-purple-500/10' : 'border-outline-variant/10 bg-surface-container-high'}"
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


<!-- ══════════ RESULTS ══════════ -->
{:else if roscoState.phase === 'results'}
	<div class="max-w-lg mx-auto text-center">
		<!-- Winner banner -->
		<div class="mb-8 pt-6">
			{#if winners.length > 0}
				<div class="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 mb-4">
					<span class="iconify material-symbols--emoji-events text-amber-400 text-lg"></span>
					<span class="text-amber-400 font-headline font-bold text-sm uppercase tracking-wider">{t('rosco.winner')}</span>
				</div>
				<h2 class="font-headline text-3xl font-bold text-on-surface">
					{winners.map(w => w.name).join(', ')}
				</h2>
			{/if}
		</div>

		<!-- Score cards -->
		<div class="flex flex-col gap-3 mb-8">
			{#each sortedResults as player, i}
				{@const isWinner = winners.some(w => w.id === player.id)}
				<div class="flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all {isWinner ? 'border-amber-500/30 bg-amber-500/5' : 'border-outline-variant/10 bg-surface-container-high'}">
					<!-- Rank -->
					<span class="text-2xl font-headline font-bold {isWinner ? 'text-amber-400' : 'text-on-surface-variant'}">
						{i + 1}
					</span>
					<!-- Avatar -->
					<div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style="background: {PLAYER_COLORS[roscoState.players.findIndex((p: { id: string }) => p.id === player.id) % PLAYER_COLORS.length]}">
						{player.name[0].toUpperCase()}
					</div>
					<!-- Name + stats -->
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

		<!-- Detailed letter results for each player -->
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
			<button
				onclick={playAgain}
				class="w-full py-4 rounded-xl bg-linear-to-r from-purple-600 to-pink-500 text-white font-headline font-bold text-lg uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-3"
			>
				<span class="iconify material-symbols--replay text-xl"></span>
				Jugar de nuevo
			</button>
			<button
				onclick={goHome}
				class="w-full py-3 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface font-headline font-bold uppercase tracking-wider active:scale-95 transition-all"
			>
				Volver al inicio
			</button>
		</div>
	</div>
{/if}

</main>

<style>
	@keyframes ping {
		0% { transform: scale(1); opacity: 0.5; }
		75%, 100% { transform: scale(1.4); opacity: 0; }
	}
	.animate-ping {
		animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
	}
</style>
