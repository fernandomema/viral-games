import { GAMES_BY_ID } from '$lib/games/registry';
import { error } from '@sveltejs/kit';

export function load({ params }: { params: { game: string } }) {
	const game = GAMES_BY_ID[params.game];
	if (!game) error(404, 'Modo de juego no encontrado');
	return { game };
}
