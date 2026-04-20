export const ROSCO_LETTERS = [
	'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
	'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S',
	'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
] as const;

export type RoscoLetter = (typeof ROSCO_LETTERS)[number];

export type LetterStatus = 'pending' | 'correct' | 'incorrect' | 'passed';

export interface RoscoClue {
	letter: RoscoLetter;
	clue: string;
	answer: string;
	/** true = "Contiene la X", false = "Empieza por X" */
	contains: boolean;
}

export interface PlayerRosco {
	playerId: string;
	name: string;
	statuses: Record<string, LetterStatus>;
	currentLetterIdx: number;
	correctCount: number;
	incorrectCount: number;
	finished: boolean;
}

export type RoscoPhase = 'lobby' | 'playing' | 'results';

export interface RoscoConfig {
	timerSeconds: number;
}

export const DEFAULT_ROSCO_CONFIG: RoscoConfig = {
	timerSeconds: 120,
};

export interface RoscoState {
	phase: RoscoPhase;
	players: { id: string; name: string }[];
	clues: RoscoClue[];
	playerRoscos: Record<string, PlayerRosco>;
	timerRemaining: number;
	config: RoscoConfig;
}
