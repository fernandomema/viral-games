<script lang="ts">
	import { createProbableGame, type ProbableEngine } from '$lib/games/probable';
	import type { GameState } from '$lib/games/probable/types';
	import { haptic, hapticTap } from '$lib/haptics';
	import { t, getLocale } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { loadPlayers } from '$lib/players-store';

	// ── Engine ────────────────────────────────────────────────────
	let engine: ProbableEngine = createProbableGame();
	let gameState: GameState = $state(engine.getState());

	const saved = loadPlayers();
	if (saved.length >= 2) {
		for (const p of saved) engine.addPlayer(p.name);
		engine.startGame(getLocale());
		gameState = engine.getState();
	}

	function sync() { gameState = engine.getState(); }

	// ── Voting ────────────────────────────────────────────────────
	let currentVoterIdx = $state(0);
	let showingResult = $state(false);
	let passedPhone = $state(false);

	$effect(() => {
		if (gameState.phase === 'question') {
			currentVoterIdx = 0;
			showingResult = false;
			passedPhone = false;
		}
	});

	function selectTarget(targetId: string) {
		const voter = gameState.players[currentVoterIdx];
		engine.vote(voter.id, targetId);
		hapticTap();
		if (currentVoterIdx < gameState.players.length - 1) {
			currentVoterIdx++;
			passedPhone = false;
		} else {
			engine.finishVoting();
			sync();
			showingResult = true;
			haptic('success');
		}
	}

	function nextQuestion() {
		const hasMore = engine.nextQuestion(getLocale());
		sync();
		hapticTap();
		if (!hasMore) {
			// Already moved to 'final'
		}
	}

	function goHome() {
		goto('/probable');
	}

	function playAgain() {
		engine.reset();
		engine.startGame(getLocale());
		sync();
		hapicTap();
	}

	// Typo-safe alias
	function hapicTap() { hapticTap(); }

	let currentVoter = $derived(gameState.players[currentVoterIdx]);
</script>

<svelte:head>
	<title>¿Quién es más probable? — Viral Games</title>
</svelte:head>

<div class="min-h-dvh bg-background text-on-background">
	<!-- Header -->
	<header class="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10 px-4 py-3">
		<div class="max-w-lg mx-auto flex items-center justify-between">
			<button onclick={goHome} class="text-on-surface-variant hover:text-on-surface transition-colors">
				<span class="iconify material-symbols--arrow-back text-xl"></span>
			</button>
			<h1 class="font-headline text-lg font-bold text-rose-400">¿QUIÉN ES MÁS PROBABLE?</h1>
			<span class="text-sm text-on-surface-variant">{gameState.currentRound}/{gameState.config.totalRounds}</span>
		</div>
	</header>

	<main class="max-w-lg mx-auto px-4 py-8">

		{#if gameState.players.length < 2}
			<!-- No players loaded -->
			<div class="text-center py-20">
				<span class="iconify material-symbols--group text-6xl text-rose-500/30 mb-4"></span>
				<p class="text-on-surface-variant mb-4">No hay jugadores. Vuelve al lobby para agregar jugadores.</p>
				<button onclick={goHome} class="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold">
					Ir al lobby
				</button>
			</div>

		{:else if gameState.phase === 'question'}
			<!-- Question Phase: Pass phone to vote -->
			<div class="text-center">
				<!-- Question card -->
				<div class="bg-surface-container-high rounded-2xl p-8 border border-rose-500/20 mb-8 shadow-lg shadow-rose-500/5">
					<span class="iconify material-symbols--help text-5xl text-rose-400 mb-4"></span>
					<p class="text-2xl font-bold font-headline leading-tight text-on-surface">
						{gameState.currentQuestion}
					</p>
				</div>

				{#if !passedPhone}
					<!-- Pass phone prompt -->
					<div class="bg-surface-container rounded-2xl p-6 border border-outline-variant/10">
						<p class="text-on-surface-variant text-sm mb-2">Pasa el móvil a:</p>
						<p class="text-2xl font-bold font-headline text-rose-400 mb-4">{currentVoter?.name}</p>
						<button
							onclick={() => { passedPhone = true; hapticTap(); }}
							class="px-8 py-3 bg-rose-600 text-white rounded-xl font-bold text-lg active:scale-95 transition-transform"
						>
							¡Listo, soy {currentVoter?.name}!
						</button>
					</div>
				{:else}
					<!-- Vote -->
					<p class="text-on-surface-variant text-sm mb-4">
						<span class="font-bold text-rose-400">{currentVoter?.name}</span>, elige a quién es más probable:
					</p>
					<div class="grid grid-cols-2 gap-3">
						{#each gameState.players as player}
							<button
								onclick={() => selectTarget(player.id)}
								class="bg-surface-container-high p-4 rounded-xl border border-outline-variant/10 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all active:scale-95 text-center"
							>
								<div class="w-12 h-12 mx-auto rounded-full bg-surface-container-lowest ring-2 ring-rose-500/30 ring-offset-2 ring-offset-background flex items-center justify-center text-lg font-bold font-headline text-rose-400 mb-2">
									{player.name.charAt(0).toUpperCase()}
								</div>
								<span class="font-bold text-on-surface text-sm">{player.name}</span>
							</button>
						{/each}
					</div>
					<p class="text-on-surface-variant text-xs mt-4">Votante {currentVoterIdx + 1} de {gameState.players.length}</p>
				{/if}
			</div>

		{:else if gameState.phase === 'results'}
			<!-- Round result -->
			<div class="text-center">
				<div class="bg-surface-container-high rounded-2xl p-8 border border-rose-500/20 mb-6">
					<p class="text-on-surface-variant text-sm mb-2">La pregunta era:</p>
					<p class="text-lg font-bold font-headline text-on-surface mb-6">{gameState.currentQuestion}</p>

					{#if gameState.roundResult}
						<div class="mb-6">
							<div class="w-20 h-20 mx-auto rounded-full bg-rose-600 ring-4 ring-rose-400/30 flex items-center justify-center text-3xl font-bold font-headline text-white mb-3">
								{gameState.roundResult.targetName.charAt(0).toUpperCase()}
							</div>
							<p class="text-2xl font-bold font-headline text-rose-400">{gameState.roundResult.targetName}</p>
							<p class="text-on-surface-variant text-sm mt-1">{gameState.roundResult.count} {gameState.roundResult.count === 1 ? 'voto' : 'votos'}</p>
						</div>

						<!-- Vote breakdown -->
						<div class="grid grid-cols-2 gap-2 text-left mb-6">
							{#each gameState.players as player}
								{@const votedFor = gameState.players.find(p => p.id === gameState.votes[player.id])}
								<div class="bg-surface-container rounded-lg p-3 text-sm">
									<span class="text-on-surface-variant">{player.name}</span>
									<span class="text-rose-400 font-bold"> → {votedFor?.name ?? '??'}</span>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-on-surface-variant">¡Empate! Nadie recibió mayoría.</p>
					{/if}
				</div>

				<!-- Scoreboard -->
				<div class="bg-surface-container rounded-2xl p-6 border border-outline-variant/10 mb-6">
					<h3 class="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">Marcador</h3>
					<div class="space-y-2">
						{#each [...gameState.players].sort((a, b) => b.score - a.score) as player, i}
							<div class="flex items-center gap-3">
								<span class="text-xs text-on-surface-variant w-4">{i + 1}</span>
								<span class="grow font-bold text-on-surface">{player.name}</span>
								<span class="text-rose-400 font-bold font-headline">{player.score}</span>
							</div>
						{/each}
					</div>
				</div>

				<button
					onclick={nextQuestion}
					class="w-full px-8 py-4 bg-rose-600 text-white rounded-xl font-bold text-lg active:scale-95 transition-transform"
				>
					{gameState.currentRound >= gameState.config.totalRounds ? 'Ver resultados finales' : 'Siguiente pregunta'}
				</button>
			</div>

		{:else if gameState.phase === 'final'}
			<!-- Final results -->
			<div class="text-center">
				<span class="iconify material-symbols--emoji-events text-6xl text-rose-400 mb-4"></span>
				<h2 class="text-3xl font-bold font-headline text-on-surface mb-2">¡RESULTADOS!</h2>
				<p class="text-on-surface-variant mb-8">Después de {gameState.config.totalRounds} preguntas...</p>

				<div class="space-y-3 mb-8">
					{#each engine.getFinalResults() as player, i}
						<div class="flex items-center gap-4 bg-surface-container-high p-4 rounded-xl border {i === 0 ? 'border-rose-500/30 bg-rose-500/5' : 'border-outline-variant/10'}">
							<div class="w-10 h-10 rounded-full {i === 0 ? 'bg-rose-600 text-white' : 'bg-surface-container-lowest text-on-surface-variant'} flex items-center justify-center font-bold font-headline text-lg">
								{i + 1}
							</div>
							<span class="grow font-bold text-on-surface text-lg">{player.name}</span>
							<div class="text-right">
								<span class="text-2xl font-bold font-headline text-rose-400">{player.score}</span>
								<span class="text-on-surface-variant text-xs block">votos</span>
							</div>
						</div>
					{/each}
				</div>

				<div class="flex gap-3">
					<button onclick={goHome} class="grow px-6 py-4 bg-surface-container-high text-on-surface rounded-xl font-bold border border-outline-variant/10 active:scale-95 transition-transform">
						Salir
					</button>
					<button onclick={playAgain} class="grow px-6 py-4 bg-rose-600 text-white rounded-xl font-bold active:scale-95 transition-transform">
						Jugar otra vez
					</button>
				</div>
			</div>
		{/if}
	</main>
</div>
