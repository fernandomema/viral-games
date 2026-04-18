/**
 * Crossword game engine — manages state, word submission, scoring.
 */

import { generateCrossword, type PlacedWord } from './generator';
import { getWordBank } from './words';
import { type CrosswordCell, type CrosswordConfig, type CrosswordPlayerScore, type CrosswordState, DEFAULT_CONFIG, PLAYER_COLORS } from './types';

export interface CrosswordPlayer {
	id: string;
	name: string;
	colorIndex: number;
}

let nextPlayerId = 1;

export function createCrosswordGame(locale: string = 'es') {
	let config: CrosswordConfig = { ...DEFAULT_CONFIG };
	let state: CrosswordState = {
		phase: 'lobby',
		grid: [],
		words: [],
		size: 0,
		solvedWords: new Map(),
		scores: [],
		selectedWord: null,
		players: []
	};
	let players: CrosswordPlayer[] = [];

	function addPlayer(name: string): { id: string; name: string } {
		const id = `p${nextPlayerId++}`;
		players.push({ id, name, colorIndex: players.length % PLAYER_COLORS.length });
		state.players = players.map(p => ({ id: p.id, name: p.name }));
		return { id, name };
	}

	function removePlayer(id: string) {
		players = players.filter(p => p.id !== id);
		state.players = players.map(p => ({ id: p.id, name: p.name }));
	}

	function setConfig(c: Partial<CrosswordConfig>) {
		config = { ...config, ...c };
	}

	function start() {
		const bank = getWordBank(locale);
		const generated = generateCrossword(bank, config.gridSize, config.maxWords);

		const grid: CrosswordCell[][] = Array.from({ length: generated.size }, (_, r) =>
			Array.from({ length: generated.size }, (_, c) => ({
				letter: generated.grid[r][c],
				revealed: '',
				solvedBy: ''
			}))
		);

		state = {
			...state,
			phase: 'playing',
			grid,
			words: generated.words,
			size: generated.size,
			solvedWords: new Map(),
			scores: players.map(p => ({
				playerId: p.id,
				name: p.name,
				wordsSolved: 0,
				color: PLAYER_COLORS[p.colorIndex]
			})),
			selectedWord: null
		};
	}

	function startGame() {
		start();
	}

	function submitWord(wordIndex: number, answer: string, playerId: string): boolean {
		if (state.phase !== 'playing') return false;
		if (state.solvedWords.has(wordIndex)) return false;

		const placedWord = state.words[wordIndex];
		if (!placedWord) return false;

		if (answer.toUpperCase() !== placedWord.word) return false;

		// Mark as solved
		state.solvedWords.set(wordIndex, playerId);

		// Reveal cells
		const player = players.find(p => p.id === playerId);
		const dr = placedWord.direction === 'down' ? 1 : 0;
		const dc = placedWord.direction === 'across' ? 1 : 0;

		for (let i = 0; i < placedWord.word.length; i++) {
			const r = placedWord.row + dr * i;
			const c = placedWord.col + dc * i;
			state.grid[r][c].revealed = placedWord.word[i];
			if (!state.grid[r][c].solvedBy) {
				state.grid[r][c].solvedBy = playerId;
			}
		}

		// Update score
		const score = state.scores.find(s => s.playerId === playerId);
		if (score) score.wordsSolved++;

		// Check if all words solved
		if (state.solvedWords.size === state.words.length) {
			state.phase = 'results';
		}

		return true;
	}

	function getState() {
		return {
			...state,
			solvedWords: Object.fromEntries(state.solvedWords)
		};
	}

	function setPhase(phase: CrosswordState['phase']) {
		state.phase = phase;
	}

	function reset() {
		state = {
			phase: 'lobby',
			grid: [],
			words: [],
			size: 0,
			solvedWords: new Map(),
			scores: [],
			selectedWord: null,
			players: players.map(p => ({ id: p.id, name: p.name }))
		};
	}

	function getConfig() {
		return config;
	}

	function getPlayers() {
		return players;
	}

	function getWinners() {
		const sorted = [...state.scores].sort((a, b) => b.wordsSolved - a.wordsSolved);
		if (sorted.length === 0) return [];
		const max = sorted[0].wordsSolved;
		return sorted.filter(s => s.wordsSolved === max);
	}

	return {
		addPlayer,
		removePlayer,
		setConfig,
		getConfig,
		start,
		startGame,
		submitWord,
		getState,
		setPhase,
		reset,
		getPlayers,
		getWinners
	};
}

export type CrosswordEngine = ReturnType<typeof createCrosswordGame>;
