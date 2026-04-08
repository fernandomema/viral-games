/**
 * Impostor Game Engine — Pure TypeScript, framework-agnostic.
 * Designed to be reused in Discord Activities SDK or any other runtime.
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

export type GamePhase =
	| 'lobby'        // Selecting players
	| 'reveal'       // Pass-the-phone word reveal
	| 'playing'      // Discussion + timer running
	| 'voting'       // Players vote who's the impostor
	| 'results';     // Show who was the impostor

export interface GameConfig {
	timerSeconds: number;
	impostorCount: number;
	giveImpostorHint: boolean;
	category?: string;
}

export interface GameState {
	phase: GamePhase;
	players: Player[];
	roles: PlayerRole[];
	config: GameConfig;
	secretWord: string;
	impostorWord: string;
	currentRevealIndex: number;
	timerRemaining: number;
	votes: Record<string, string>; // voterId -> targetId
}

export interface GameEvent {
	type: string;
	payload?: unknown;
}

export const DEFAULT_CONFIG: GameConfig = {
	timerSeconds: 300,
	impostorCount: 1,
	giveImpostorHint: true,
};
