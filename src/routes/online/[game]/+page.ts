import { GAMES_BY_ID } from '$lib/games/registry';
import { error } from '@sveltejs/kit';

export function load({ params }: { params: { game: string } }) {
	const game = GAMES_BY_ID[params.game];
	if (!game) error(404, 'Modo de juego no encontrado');
	// Only allow impostor game types for online mode
	if (game.type !== 'word' && game.type !== 'draw' && game.type !== 'fact') {
		error(404, 'Este juego no soporta modo online');
	}
	return { game };
}
