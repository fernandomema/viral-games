import { GAMES_BY_ID } from '$lib/games/registry';

export function load() {
	return { game: GAMES_BY_ID['probable'] };
}
