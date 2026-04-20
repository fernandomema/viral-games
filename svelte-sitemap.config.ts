import type { OptionsSvelteSitemap } from 'svelte-sitemap';
import { GAMES } from './src/lib/games/registry';

const gamePaths = GAMES
	.filter((g) => g.localEnabled)
	.map((g) => g.id);

const config: OptionsSvelteSitemap = {
	domain: 'https://viral-games.servitimo.net',
	ignore: ['discord.html', 'discord/**', '_app/**'],
	additional: gamePaths,
	changeFreq: 'weekly',
};

export default config;
