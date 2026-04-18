import type { OptionsSvelteSitemap } from 'svelte-sitemap';

const config: OptionsSvelteSitemap = {
	domain: 'https://viral-games.servitimo.net',
	ignore: ['discord/**', '_app/**'],
	changeFreq: 'weekly',
};

export default config;
