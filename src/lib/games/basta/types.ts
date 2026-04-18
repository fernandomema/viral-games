/**
 * Basta (Stop / Scattergories) — Types
 * Players fill in words for 5 categories starting with a random letter.
 * Anyone can press STOP to end the round for everyone.
 * Then players vote on each other's answers.
 */

export interface Player {
	id: string;
	name: string;
	avatar?: string;
	eliminated: boolean;
}

export type GamePhase =
	| 'lobby'
	| 'playing'      // Players fill in words
	| 'voting'       // Players validate each other's answers
	| 'scores'       // Round scores shown
	| 'results';     // Final winner(s) shown

export interface GameConfig {
	timerSeconds: number;
	totalRounds: number;
}

export const DEFAULT_CONFIG: GameConfig = {
	timerSeconds: 60,
	totalRounds: 3,
};

/** A single player's answers for a round */
export interface PlayerAnswers {
	playerId: string;
	answers: Record<string, string>; // categoryName -> answer
}

/** A vote on a specific answer: playerId + category */
export interface AnswerVote {
	voterId: string;
	targetPlayerId: string;
	category: string;
	valid: boolean;
}

/** Score breakdown per player per round */
export interface RoundScore {
	playerId: string;
	points: number; // points earned this round
	breakdown: Record<string, number>; // category -> points for that category
}

export interface GameState {
	phase: GamePhase;
	players: Player[];
	config: GameConfig;

	// Current round
	currentRound: number;
	currentLetter: string;
	categories: string[];

	// Playing phase
	timerRemaining: number;
	answers: PlayerAnswers[];
	stoppedBy: string | null; // playerId who pressed STOP

	// Voting phase
	votes: AnswerVote[];

	// Scores
	roundScores: RoundScore[];
	totalScores: Record<string, number>; // playerId -> total across all rounds
}
