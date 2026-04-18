/**
 * Palabra Oculta Engine — single-player word guessing game.
 * Player guesses a word, sees alphabetical distance to the target.
 */

import type { Guess, PalabraOcultaState } from './types.js';
import { getRandomWord } from './words.js';

/**
 * Normalize a string for comparison: lowercase, remove diacritics.
 */
function normalize(str: string): string {
	return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

/**
 * Compute alphabetical distance between two words.
 * Weighted by position: first letter matters most.
 * Returns 0 if they match.
 */
function alphabeticalDistance(guess: string, target: string): number {
	const a = normalize(guess);
	const b = normalize(target);
	if (a === b) return 0;

	// Weighted distance: position i has weight 26^(maxDepth - i)
	const maxDepth = 3; // only consider first 3 chars
	let dist = 0;
	for (let i = 0; i < maxDepth; i++) {
		const ca = i < a.length ? a.charCodeAt(i) : 97; // 'a' as default
		const cb = i < b.length ? b.charCodeAt(i) : 97;
		const weight = Math.pow(26, maxDepth - 1 - i);
		dist += (ca - cb) * weight;
	}
	return Math.abs(dist);
}

export interface PalabraOcultaEngine {
	getState(): PalabraOcultaState;
	startGame(locale: string, category?: string): void;
	guess(word: string): Guess;
	reset(): void;
}

export function createPalabraOcultaGame(): PalabraOcultaEngine {
	let targetWord = '';
	let category = '';
	let guesses: Guess[] = [];
	let won = false;

	function getState(): PalabraOcultaState {
		// Compute active alphabet range from guesses
		let minLetter = 'a';
		let maxLetter = 'z';
		const normalizedTarget = normalize(targetWord);
		for (const g of guesses) {
			const nw = normalize(g.word);
			if (g.direction === 'down') {
				// guess is before target → raise min
				const first = nw[0];
				if (first && first > minLetter) minLetter = first;
			} else if (g.direction === 'up') {
				// guess is after target → lower max
				const first = nw[0];
				if (first && first < maxLetter) maxLetter = first;
			}
		}

		return {
			phase: !targetWord ? 'lobby' : won ? 'results' : 'playing',
			targetWord: won ? targetWord : '',
			category,
			guesses: [...guesses].sort((a, b) => a.word.localeCompare(b.word)),
			won,
			attempts: guesses.length,
			activeRange: [minLetter, maxLetter],
		};
	}

	function startGame(locale: string, cat?: string) {
		const entry = getRandomWord(locale, cat);
		targetWord = entry.word;
		category = entry.category;
		guesses = [];
		won = false;
	}

	function guess(word: string): Guess {
		const normalizedGuess = normalize(word);
		const normalizedTarget = normalize(targetWord);

		// Prevent duplicate guesses
		const existing = guesses.find(g => normalize(g.word) === normalizedGuess);
		if (existing) return existing;

		const dist = alphabeticalDistance(normalizedGuess, normalizedTarget);
		const direction = dist === 0 ? 'match' as const : normalizedGuess < normalizedTarget ? 'down' as const : 'up' as const;
		const g: Guess = { word: word.toLowerCase().trim(), distance: dist, direction };
		guesses.push(g);

		if (dist === 0) {
			won = true;
		}

		return g;
	}

	function reset() {
		targetWord = '';
		category = '';
		guesses = [];
		won = false;
	}

	return { getState, startGame, guess, reset };
}
