import type { GameState, PlayerState, GuessResult, LetterResult, GameConfig, GamePhase } from './types.js';
import { DEFAULT_CONFIG } from './types.js';
import { getRandomWord, isValidWord } from './words.js';

function generateId(): string {
	return Math.random().toString(36).substring(2, 10);
}

export interface WordleEngine {
	getState(): GameState;
	addPlayer(name: string): PlayerState;
	removePlayer(playerId: string): void;
	setConfig(config: Partial<GameConfig>): void;
	startGame(locale?: string): void;
	guess(word: string): GuessResult | null;
	isFinished(): boolean;
	getWinner(): PlayerState | null;
	reset(): void;
	setPhase(phase: GamePhase): void;
	maxTotalGuesses(): number;
}

function evaluateGuess(guess: string, secret: string): LetterResult[] {
	const results: LetterResult[] = new Array(guess.length).fill('absent');
	const secretChars = secret.split('');
	const guessChars = guess.split('');
	const used = new Array(guess.length).fill(false);

	for (let i = 0; i < guessChars.length; i++) {
		if (guessChars[i] === secretChars[i]) {
			results[i] = 'correct';
			used[i] = true;
			guessChars[i] = '';
		}
	}

	for (let i = 0; i < guessChars.length; i++) {
		if (guessChars[i] === '') continue;
		const idx = secretChars.findIndex((c, j) => !used[j] && c === guessChars[i]);
		if (idx !== -1) {
			results[i] = 'present';
			used[idx] = true;
		}
	}

	return results;
}

export function createWordleGame(initialConfig?: Partial<GameConfig>): WordleEngine {
	let state: GameState = {
		phase: 'lobby',
		players: [],
		config: { ...DEFAULT_CONFIG, ...initialConfig },
		secretWord: '',
		guesses: [],
		currentPlayerIdx: 0,
		winnerId: null,
	};

	function maxTotal() {
		return state.config.maxRounds * state.players.length;
	}

	return {
		getState() {
			return { ...state, guesses: [...state.guesses] };
		},

		addPlayer(name: string): PlayerState {
			const player: PlayerState = { id: generateId(), name: name.trim() };
			state.players = [...state.players, player];
			return player;
		},

		removePlayer(playerId: string) {
			state.players = state.players.filter((p) => p.id !== playerId);
		},

		setConfig(config: Partial<GameConfig>) {
			state.config = { ...state.config, ...config };
		},

		startGame(locale = 'es') {
			state.secretWord = getRandomWord(locale).toUpperCase();
			state.phase = 'playing';
			state.guesses = [];
			state.currentPlayerIdx = 0;
			state.winnerId = null;
		},

		guess(word: string): GuessResult | null {
			const upper = word.toUpperCase();
			if (upper.length !== state.config.wordLength) return null;
			if (!isValidWord(upper)) return null;
			if (state.phase !== 'playing') return null;

			const player = state.players[state.currentPlayerIdx];
			const results = evaluateGuess(upper, state.secretWord);
			const guessResult: GuessResult = {
				word: upper,
				results,
				playerId: player.id,
				playerName: player.name,
			};

			state.guesses = [...state.guesses, guessResult];

			if (results.every((r) => r === 'correct')) {
				state.winnerId = player.id;
				state.phase = 'results';
			} else if (state.guesses.length >= maxTotal()) {
				state.phase = 'results';
			} else {
				state.currentPlayerIdx = (state.currentPlayerIdx + 1) % state.players.length;
			}

			return guessResult;
		},

		isFinished(): boolean {
			return state.phase === 'results';
		},

		maxTotalGuesses() {
			return maxTotal();
		},

		getWinner(): PlayerState | null {
			if (!state.winnerId) return null;
			return state.players.find((p) => p.id === state.winnerId) ?? null;
		},

		reset() {
			state.phase = 'lobby';
			state.secretWord = '';
			state.guesses = [];
			state.currentPlayerIdx = 0;
			state.winnerId = null;
		},

		setPhase(phase: GamePhase) {
			state.phase = phase;
		},
	};
}
