<script lang="ts">
	import { createWordleGame, type WordleEngine } from '$lib/games/wordle';
	import type { GameState, LetterResult } from '$lib/games/wordle/types';
	import { haptic, hapticTap } from '$lib/haptics';
	import { getLocale } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { loadPlayers } from '$lib/players-store';

	// ── Engine ────────────────────────────────────────────────────
	let engine: WordleEngine = createWordleGame();
	let gameState: GameState = $state(engine.getState());

	const saved = loadPlayers();
	if (saved.length >= 2) {
		for (const p of saved) engine.addPlayer(p.name);
		engine.startGame(getLocale());
		gameState = engine.getState();
	}

	function sync() { gameState = engine.getState(); }

	// ── Input ─────────────────────────────────────────────────────
	let currentInput = $state('');
	let shakeRow = $state(false);

	let currentPlayer = $derived(gameState.players[gameState.currentPlayerIdx]);
	let maxGuesses = $derived(engine.maxTotalGuesses());

	// Keyboard letter states (from shared board)
	let letterStates = $derived.by(() => {
		const map: Record<string, LetterResult> = {};
		for (const g of gameState.guesses) {
			for (let i = 0; i < g.word.length; i++) {
				const letter = g.word[i];
				const result = g.results[i];
				const current = map[letter];
				if (result === 'correct') map[letter] = 'correct';
				else if (result === 'present' && current !== 'correct') map[letter] = 'present';
				else if (!current) map[letter] = 'absent';
			}
		}
		return map;
	});

	function submitGuess() {
		if (currentInput.length !== 5) {
			shakeRow = true;
			setTimeout(() => shakeRow = false, 500);
			return;
		}
		const result = engine.guess(currentInput);
		if (!result) {
			shakeRow = true;
			setTimeout(() => shakeRow = false, 500);
			return;
		}
		currentInput = '';
		sync();
		if (result.results.every(r => r === 'correct')) {
			haptic('success');
		} else {
			hapticTap();
		}
	}

	function pressKey(key: string) {
		if (key === 'ENTER') {
			submitGuess();
		} else if (key === 'DEL') {
			currentInput = currentInput.slice(0, -1);
		} else if (currentInput.length < 5) {
			currentInput += key;
		}
		hapticTap();
	}

	const KEYBOARD_ROWS = [
		['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
		['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
		['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
	];

	function cellColor(result: LetterResult): string {
		switch (result) {
			case 'correct': return 'bg-green-600 border-green-500';
			case 'present': return 'bg-yellow-600 border-yellow-500';
			case 'absent': return 'bg-zinc-700 border-zinc-600';
		}
	}

	function keyColor(key: string): string {
		const state = letterStates[key];
		if (!state) return 'bg-zinc-600 hover:bg-zinc-500';
		switch (state) {
			case 'correct': return 'bg-green-600';
			case 'present': return 'bg-yellow-600';
			case 'absent': return 'bg-zinc-800 text-zinc-500';
		}
	}

	// Player color assignment for visual distinction
	const PLAYER_COLORS = ['text-green-400', 'text-blue-400', 'text-pink-400', 'text-amber-400', 'text-purple-400', 'text-cyan-400'];
	function playerColor(idx: number): string {
		return PLAYER_COLORS[idx % PLAYER_COLORS.length];
	}

	let winner = $derived(engine.getWinner());
	let en = $derived(getLocale() === 'en');
</script>

<svelte:head>
	<title>Wordle Battle | Viral Games</title>
</svelte:head>

<div class="min-h-[100dvh] bg-zinc-950 text-white flex flex-col">
	{#if gameState.phase === 'results'}
		<!-- ── RESULTS ───────────────────────────────────────── -->
		<div class="flex-1 flex flex-col items-center justify-center p-6 gap-6">
			<h1 class="text-3xl font-black tracking-tight">
				{#if winner}
					🏆 {winner.name} {en ? 'wins!' : '¡gana!'}
				{:else}
					😔 {en ? 'Nobody guessed it' : 'Nadie adivinó'}
				{/if}
			</h1>
			<p class="text-zinc-400 text-sm uppercase tracking-widest">
				{en ? 'The word was' : 'La palabra era'}:
				<span class="text-green-400 font-bold text-lg">{gameState.secretWord}</span>
			</p>

			<!-- Shared board recap -->
			<div class="flex flex-col gap-1 max-h-60 overflow-y-auto">
				{#each gameState.guesses as guess, i}
					<div class="flex gap-1 items-center">
						<span class="text-xs w-16 truncate {playerColor(gameState.players.findIndex(p => p.id === guess.playerId))}">{guess.playerName}</span>
						<div class="flex gap-1">
							{#each guess.results as result, colIdx}
								<div class="w-8 h-8 flex items-center justify-center rounded text-xs font-bold border {cellColor(result)}">
									{guess.word[colIdx]}
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			<div class="flex gap-3 mt-4">
				<button
					onclick={() => { engine.reset(); engine.startGame(getLocale()); sync(); currentInput = ''; }}
					class="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 font-bold transition-colors"
				>
					{en ? 'Play Again' : 'Jugar de Nuevo'}
				</button>
				<button
					onclick={() => goto('/wordle')}
					class="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold transition-colors"
				>
					{en ? 'Exit' : 'Salir'}
				</button>
			</div>
		</div>

	{:else}
		<!-- ── PLAYING: SHARED BOARD ─────────────────────────── -->
		<div class="flex-1 flex flex-col items-center p-4 gap-2">
			<!-- Header: whose turn -->
			<div class="w-full max-w-sm flex items-center justify-between">
				<p class="text-sm font-bold {playerColor(gameState.currentPlayerIdx)}">
					{en ? 'Turn:' : 'Turno:'} {currentPlayer?.name}
				</p>
				<p class="text-xs text-zinc-500">
					{gameState.guesses.length}/{maxGuesses}
				</p>
			</div>

			<!-- Grid (shared) -->
			<div class="flex flex-col gap-1 my-auto">
				{#each Array(Math.min(maxGuesses, 12)) as _, rowIdx}
					{@const guess = gameState.guesses[rowIdx]}
					{@const isCurrentRow = rowIdx === gameState.guesses.length}
					{@const isVisible = rowIdx < gameState.guesses.length + 1 || rowIdx < 8}
					{#if isVisible}
						<div class="flex gap-1 items-center {isCurrentRow && shakeRow ? 'animate-shake' : ''}">
							<!-- Player indicator -->
							{#if guess}
								<span class="w-5 text-[10px] font-bold truncate {playerColor(gameState.players.findIndex(p => p.id === guess.playerId))}">
									{guess.playerName.slice(0, 2)}
								</span>
							{:else if isCurrentRow}
								<span class="w-5 text-[10px] font-bold truncate {playerColor(gameState.currentPlayerIdx)}">
									{currentPlayer?.name.slice(0, 2)}
								</span>
							{:else}
								<span class="w-5"></span>
							{/if}
							{#each Array(5) as _, colIdx}
								{#if guess}
									<div class="w-12 h-12 flex items-center justify-center rounded-lg border-2 text-lg font-black {cellColor(guess.results[colIdx])}">
										{guess.word[colIdx]}
									</div>
								{:else if isCurrentRow}
									<div class="w-12 h-12 flex items-center justify-center rounded-lg border-2 text-lg font-black
										{currentInput[colIdx] ? 'border-zinc-400 bg-zinc-900' : 'border-zinc-700 bg-zinc-900/50'}">
										{currentInput[colIdx] ?? ''}
									</div>
								{:else}
									<div class="w-12 h-12 rounded-lg border-2 border-zinc-800 bg-zinc-900/30"></div>
								{/if}
							{/each}
						</div>
					{/if}
				{/each}
			</div>

			<!-- Keyboard -->
			<div class="w-full max-w-md flex flex-col gap-1.5 pb-4">
				{#each KEYBOARD_ROWS as row}
					<div class="flex justify-center gap-1">
						{#each row as key}
							<button
								onclick={() => pressKey(key)}
								class="rounded-lg font-bold text-sm py-3 transition-colors active:scale-95
									{key === 'ENTER' || key === 'DEL' ? 'px-3 text-xs' : 'px-2.5 min-w-[2rem]'}
									{key === 'ENTER' ? 'bg-green-600 hover:bg-green-500' : key === 'DEL' ? 'bg-red-900/60 hover:bg-red-800/60' : keyColor(key)}"
							>
								{key === 'DEL' ? '⌫' : key}
							</button>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-6px); }
		75% { transform: translateX(6px); }
	}
	:global(.animate-shake) {
		animation: shake 0.3s ease-in-out;
	}
</style>
