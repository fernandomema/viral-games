import type { PlacedWord } from './generator';

export interface CrosswordCell {
	letter: string;      // correct letter
	revealed: string;    // what's currently shown ('' if not solved)
	solvedBy: string;    // playerId who solved the word containing this cell, or ''
}

export interface CrosswordPlayerScore {
	playerId: string;
	name: string;
	wordsSolved: number;
	color: string;
}

export interface CrosswordState {
	phase: 'lobby' | 'playing' | 'voting' | 'results';
	grid: CrosswordCell[][];
	words: PlacedWord[];
	size: number;
	solvedWords: Map<number, string>; // word index -> playerId
	scores: CrosswordPlayerScore[];
	selectedWord: number | null; // index into words array
	players: { id: string; name: string }[];
}

export interface CrosswordConfig {
	gridSize: number; // 9, 11, 13, 15
	maxWords: number;
}

export const DEFAULT_CONFIG: CrosswordConfig = {
	gridSize: 13,
	maxWords: 15
};

export const PLAYER_COLORS = [
	'#3b82f6', // blue
	'#ef4444', // red
	'#22c55e', // green
	'#f59e0b', // amber
	'#8b5cf6', // violet
	'#ec4899', // pink
	'#06b6d4', // cyan
	'#f97316', // orange
];
