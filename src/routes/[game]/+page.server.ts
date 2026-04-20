import { GAMES } from "$lib/games/registry";
import type { EntryGenerator } from "./$types";

export const entries: EntryGenerator = () => {
	return Object.keys(GAMES).map((value, index) => {
		return {
			game: GAMES[index].id,
		};
	});
};