/**
 * Impostor Dibujo Edition — Types
 * Same as impostor but adds drawing phases and stroke data.
 */

export interface Player {
	id: string;
	name: string;
	avatar?: string;
	eliminated: boolean;
}

export type Role = 'citizen' | 'impostor';

export interface PlayerRole {
	playerId: string;
	role: Role;
	word: string;
}

export interface Stroke {
	playerId: string;
	points: { x: number; y: number }[];
	color: string;
	width: number;
}

export type GamePhase =
	| 'lobby'        // Selecting players
	| 'reveal'       // Pass-the-phone word reveal
	| 'drawing'      // Players take turns drawing a stroke each
	| 'voting'       // Players vote who's the impostor
	| 'results';     // Show who was the impostor

export interface GameConfig {
	timerPerTurn: number;      // seconds per drawing turn
	rounds: number;            // how many full drawing rounds
	impostorCount: number;
	giveImpostorHint: boolean;
	category?: string;
}

export const DEFAULT_CONFIG: GameConfig = {
	timerPerTurn: 15,
	rounds: 2,
	impostorCount: 1,
	giveImpostorHint: true,
};

export interface GameState {
	phase: GamePhase;
	players: Player[];
	roles: PlayerRole[];
	config: GameConfig;
	secretWord: string;
	impostorWord: string;
	currentRevealIndex: number;
	// Drawing-specific
	strokes: Stroke[];
	currentDrawerIndex: number;
	currentRound: number;
	turnTimerRemaining: number;
	// Voting
	votes: Record<string, string>;
}
