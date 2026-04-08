/**
 * Impostor Datos Edition — Types
 * Same as impostor but uses fun facts instead of words.
 * The impostor gets a fake fact; players must find the lie.
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
	fact: string;
}

export type GamePhase =
	| 'lobby'        // Selecting players
	| 'reveal'       // Pass-the-phone fact reveal
	| 'playing'      // Discussion + timer running
	| 'voting'       // Players vote who has the fake fact
	| 'results';     // Show who was the impostor

export interface GameConfig {
	timerSeconds: number;
	impostorCount: number;
	category?: string;
}

export const DEFAULT_CONFIG: GameConfig = {
	timerSeconds: 300,
	impostorCount: 1,
};

export interface GameState {
	phase: GamePhase;
	players: Player[];
	roles: PlayerRole[];
	config: GameConfig;
	realFact: string;
	fakeFact: string;
	currentRevealIndex: number;
	timerRemaining: number;
	votes: Record<string, string>; // voterId -> targetId
}
