/**
 * Basta — Category pools.
 * Each round picks 5 random categories from this pool.
 * Supports ES and EN locales.
 */

export interface BastaCategory {
	name: string;
	icon: string;
}

const CATEGORIES_ES: BastaCategory[] = [
	{ name: 'Nombre', icon: 'material-symbols--person' },
	{ name: 'Animal', icon: 'material-symbols--pets' },
	{ name: 'Ciudad', icon: 'material-symbols--location-city' },
	{ name: 'País', icon: 'material-symbols--flag' },
	{ name: 'Fruta', icon: 'material-symbols--nutrition' },
	{ name: 'Color', icon: 'material-symbols--palette' },
	{ name: 'Comida', icon: 'material-symbols--restaurant' },
	{ name: 'Profesión', icon: 'material-symbols--work' },
	{ name: 'Película', icon: 'material-symbols--movie' },
	{ name: 'Deporte', icon: 'material-symbols--sports-soccer' },
	{ name: 'Objeto', icon: 'material-symbols--category' },
	{ name: 'Marca', icon: 'material-symbols--verified' },
	{ name: 'Canción', icon: 'material-symbols--music-note' },
	{ name: 'Ropa', icon: 'material-symbols--checkroom' },
	{ name: 'Planta', icon: 'material-symbols--eco' },
];

const CATEGORIES_EN: BastaCategory[] = [
	{ name: 'Name', icon: 'material-symbols--person' },
	{ name: 'Animal', icon: 'material-symbols--pets' },
	{ name: 'City', icon: 'material-symbols--location-city' },
	{ name: 'Country', icon: 'material-symbols--flag' },
	{ name: 'Fruit', icon: 'material-symbols--nutrition' },
	{ name: 'Color', icon: 'material-symbols--palette' },
	{ name: 'Food', icon: 'material-symbols--restaurant' },
	{ name: 'Profession', icon: 'material-symbols--work' },
	{ name: 'Movie', icon: 'material-symbols--movie' },
	{ name: 'Sport', icon: 'material-symbols--sports-soccer' },
	{ name: 'Object', icon: 'material-symbols--category' },
	{ name: 'Brand', icon: 'material-symbols--verified' },
	{ name: 'Song', icon: 'material-symbols--music-note' },
	{ name: 'Clothing', icon: 'material-symbols--checkroom' },
	{ name: 'Plant', icon: 'material-symbols--eco' },
];

const CATEGORY_DATA: Record<string, BastaCategory[]> = {
	es: CATEGORIES_ES,
	en: CATEGORIES_EN,
};

export function getBastaCategories(locale: string = 'es'): BastaCategory[] {
	return CATEGORY_DATA[locale] ?? CATEGORIES_ES;
}

/** Pick `count` random categories from the pool */
export function pickRandomCategories(count: number = 5, locale: string = 'es'): BastaCategory[] {
	const pool = [...getBastaCategories(locale)];
	const picked: BastaCategory[] = [];
	for (let i = 0; i < count && pool.length > 0; i++) {
		const idx = Math.floor(Math.random() * pool.length);
		picked.push(pool.splice(idx, 1)[0]);
	}
	return picked;
}

/**
 * Letters used in the game. We exclude difficult letters
 * (Q, X, W, Y, Z, Ñ) to keep it fun.
 */
const LETTERS = 'ABCDEFGHIJKLMNOPRSTUVW'.split('');

/** Pick a random letter for the round */
export function pickRandomLetter(): string {
	return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}
