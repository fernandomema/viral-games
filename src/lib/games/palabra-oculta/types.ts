export interface Guess {
	word: string;
	distance: number;
	direction: 'up' | 'down' | 'match';
}

export interface PalabraOcultaState {
	phase: 'lobby' | 'playing' | 'results';
	targetWord: string;
	category: string;
	guesses: Guess[];
	won: boolean;
	attempts: number;
	/** Active alphabet range: [minLetter, maxLetter] based on guesses */
	activeRange: [string, string];
}

export interface PalabraOcultaConfig {
	// future: difficulty, timer, etc.
}

export const DEFAULT_CONFIG: PalabraOcultaConfig = {};
