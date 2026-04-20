export interface Player {
	id: string;
	name: string;
	score: number; // times voted "most likely"
}

export type GamePhase = 'lobby' | 'question' | 'voting' | 'results' | 'final';

export interface GameConfig {
	totalRounds: number;
}

export const DEFAULT_CONFIG: GameConfig = {
	totalRounds: 10,
};

export interface GameState {
	phase: GamePhase;
	players: Player[];
	config: GameConfig;
	currentRound: number;
	currentQuestion: string;
	votes: Record<string, string>; // voterId → targetId
	roundResult: { targetId: string; targetName: string; count: number } | null;
	usedQuestions: Set<number>;
}
