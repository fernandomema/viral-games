/**
 * Procedural crossword generator.
 * Places words on a grid maximizing intersections.
 */

import type { CrosswordWord } from './words';

export type Direction = 'across' | 'down';

export interface PlacedWord {
	word: string;
	clue: string;
	category: string;
	row: number;
	col: number;
	direction: Direction;
	number: number;
}

export interface GeneratedCrossword {
	grid: string[][]; // letter or '' for empty
	words: PlacedWord[];
	size: number;
}

interface Placement {
	row: number;
	col: number;
	direction: Direction;
	intersections: number;
}

export function generateCrossword(
	wordBank: CrosswordWord[],
	size: number = 13,
	maxWords: number = 15
): GeneratedCrossword {
	const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
	const placed: PlacedWord[] = [];

	// Shuffle and sort by length descending (longer words first for more intersections)
	const shuffled = [...wordBank].sort(() => Math.random() - 0.5);
	const candidates = shuffled.sort((a, b) => b.word.length - a.word.length);

	// Filter words that fit in the grid
	const fitting = candidates.filter(w => w.word.length <= size);

	if (fitting.length === 0) return { grid, words: [], size };

	// Place first word in the center horizontally
	const first = fitting[0];
	const startRow = Math.floor(size / 2);
	const startCol = Math.floor((size - first.word.length) / 2);
	placeWord(grid, first.word, startRow, startCol, 'across');
	placed.push({
		...first,
		row: startRow,
		col: startCol,
		direction: 'across',
		number: 0 // numbered later
	});

	// Try to place remaining words
	for (let i = 1; i < fitting.length && placed.length < maxWords; i++) {
		const cw = fitting[i];
		// Skip if same word already placed
		if (placed.some(p => p.word === cw.word)) continue;

		const best = findBestPlacement(grid, cw.word, size);
		if (best) {
			placeWord(grid, cw.word, best.row, best.col, best.direction);
			placed.push({
				...cw,
				row: best.row,
				col: best.col,
				direction: best.direction,
				number: 0
			});
		}
	}

	// Assign clue numbers (top-to-bottom, left-to-right)
	assignNumbers(placed);

	return { grid, words: placed, size };
}

function placeWord(grid: string[][], word: string, row: number, col: number, dir: Direction) {
	for (let i = 0; i < word.length; i++) {
		if (dir === 'across') {
			grid[row][col + i] = word[i];
		} else {
			grid[row + i][col] = word[i];
		}
	}
}

function findBestPlacement(grid: string[][], word: string, size: number): Placement | null {
	let best: Placement | null = null;
	let bestScore = 0;

	for (const dir of ['across', 'down'] as Direction[]) {
		const maxRow = dir === 'across' ? size : size - word.length;
		const maxCol = dir === 'across' ? size - word.length : size;

		for (let row = 0; row < maxRow; row++) {
			for (let col = 0; col < maxCol; col++) {
				const result = checkPlacement(grid, word, row, col, dir, size);
				if (result && result.intersections > bestScore) {
					bestScore = result.intersections;
					best = { row, col, direction: dir, intersections: result.intersections };
				}
			}
		}
	}

	return best;
}

function checkPlacement(
	grid: string[][],
	word: string,
	row: number,
	col: number,
	dir: Direction,
	size: number
): { intersections: number } | null {
	let intersections = 0;
	const dr = dir === 'down' ? 1 : 0;
	const dc = dir === 'across' ? 1 : 0;

	// Check cell before the word is empty
	const beforeR = row - dr;
	const beforeC = col - dc;
	if (beforeR >= 0 && beforeC >= 0 && grid[beforeR][beforeC] !== '') return null;

	// Check cell after the word is empty
	const afterR = row + dr * word.length;
	const afterC = col + dc * word.length;
	if (afterR < size && afterC < size && grid[afterR][afterC] !== '') return null;

	for (let i = 0; i < word.length; i++) {
		const r = row + dr * i;
		const c = col + dc * i;
		const cell = grid[r][c];

		if (cell !== '') {
			// Must match the letter
			if (cell !== word[i]) return null;
			intersections++;
		} else {
			// Check parallel neighbors — shouldn't create unintended adjacency
			// For across: check above and below
			// For down: check left and right
			const perpDr = dir === 'across' ? 1 : 0;
			const perpDc = dir === 'across' ? 0 : 1;

			const n1r = r + perpDr;
			const n1c = c + perpDc;
			const n2r = r - perpDr;
			const n2c = c - perpDc;

			if (n1r < size && n1c < size && grid[n1r][n1c] !== '') return null;
			if (n2r >= 0 && n2c >= 0 && grid[n2r][n2c] !== '') return null;
		}
	}

	// Must have at least one intersection (otherwise it's floating)
	if (intersections === 0) return null;

	return { intersections };
}

function assignNumbers(placed: PlacedWord[]) {
	// Sort by position: top-to-bottom, left-to-right
	const sorted = [...placed].sort((a, b) => a.row - b.row || a.col - b.col);
	let num = 1;
	const assigned = new Map<string, number>(); // "row,col" -> number

	for (const w of sorted) {
		const key = `${w.row},${w.col}`;
		if (assigned.has(key)) {
			w.number = assigned.get(key)!;
		} else {
			w.number = num;
			assigned.set(key, num);
			num++;
		}
	}

	// Update original array
	for (const w of placed) {
		const match = sorted.find(s => s.word === w.word && s.direction === w.direction);
		if (match) w.number = match.number;
	}
}
