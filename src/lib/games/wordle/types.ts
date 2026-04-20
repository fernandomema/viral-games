export type LetterResult = 'correct' | 'present' | 'absent';

export interface GuessResult {
	word: string;
	results: LetterResult[];
	playerId: string;
	playerName: string;
}

export interface PlayerState {
	id: string;
	name: string;
}

export type GamePhase = 'lobby' | 'playing' | 'results';

export interface GameConfig {
	maxRounds: number; // rounds per player (default 6)
	wordLength: number;
}

export const DEFAULT_CONFIG: GameConfig = {
	maxRounds: 6,
	wordLength: 5,
};

export interface GameState {
	phase: GamePhase;
	players: PlayerState[];
	config: GameConfig;
	secretWord: string;
	guesses: GuessResult[]; // shared board
	currentPlayerIdx: number; // whose turn
	winnerId: string | null;
}
