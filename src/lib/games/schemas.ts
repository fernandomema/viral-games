/**
 * Reusable JSON-LD schema builders.
 * Each function returns a plain object ready for <JsonLd data={...} />.
 */

import type { GameFaq } from './seo';

const BASE_URL = 'https://viral-games.servitimo.net';

export function organizationSchema() {
	return {
		'@type': 'Organization',
		name: 'Viral Games',
		url: BASE_URL,
		logo: `${BASE_URL}/icon-512.png`,
	};
}

export function webApplicationSchema(overrides: Partial<Record<string, any>> = {}) {
	return {
		'@type': 'WebApplication',
		name: 'Viral Games',
		url: BASE_URL,
		applicationCategory: 'GameApplication',
		operatingSystem: 'Any',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
		...overrides,
	};
}

export function gameSchema(opts: {
	name: string;
	description: string;
	url: string;
	minPlayers?: number;
	maxPlayers?: number;
}) {
	return {
		'@type': 'VideoGame',
		name: opts.name,
		description: opts.description,
		url: `${BASE_URL}${opts.url}`,
		genre: 'Party Game',
		gamePlatform: 'Web Browser',
		numberOfPlayers: opts.minPlayers && opts.maxPlayers
			? { '@type': 'QuantitativeValue', minValue: opts.minPlayers, maxValue: opts.maxPlayers }
			: undefined,
		playMode: 'MultiPlayer',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
		isAccessibleForFree: true,
	};
}

export function faqSchema(faqs: GameFaq[]) {
	return {
		'@type': 'FAQPage',
		mainEntity: faqs.map(f => ({
			'@type': 'Question',
			name: f.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: f.answer,
			},
		})),
	};
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: item.name,
			item: `${BASE_URL}${item.url}`,
		})),
	};
}
