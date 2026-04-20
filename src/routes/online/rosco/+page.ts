import { GAMES_BY_ID } from '$lib/games/registry';
import { error } from '@sveltejs/kit';

export function load() {
	const game = GAMES_BY_ID['rosco'];
	if (!game) error(404, 'Modo de juego no encontrado');
	return { game };
}
