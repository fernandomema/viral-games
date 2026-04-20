import { GAMES_BY_ID } from '$lib/games/registry';

export function load() {
	const game = GAMES_BY_ID['rosco'];
	return { game };
}
