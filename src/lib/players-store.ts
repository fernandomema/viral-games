/**
 * Shared player persistence via localStorage.
 * Players are stored globally so they persist across games and rounds.
 */

export interface StoredPlayer {
	id: string;
	name: string;
}

const STORAGE_KEY = 'viral-games-players';

export function loadPlayers(): StoredPlayer[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(
			(p: unknown): p is StoredPlayer =>
				typeof p === 'object' && p !== null && typeof (p as StoredPlayer).id === 'string' && typeof (p as StoredPlayer).name === 'string'
		);
	} catch {
		return [];
	}
}

export function savePlayers(players: StoredPlayer[]): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(players.map(p => ({ id: p.id, name: p.name }))));
	} catch {
		// Storage full or unavailable — ignore
	}
}
