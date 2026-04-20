/**
 * Lightweight i18n system for Viral Games.
 * No external dependencies — uses a simple key-based dictionary with reactive locale.
 */

export type Locale = 'es' | 'en';

export const SUPPORTED_LOCALES: Locale[] = ['es', 'en'];

export const LOCALE_LABELS: Record<Locale, string> = {
	es: 'Español',
	en: 'English',
};

type TranslationDict = Record<string, string>;

const translations = new Map<Locale, TranslationDict>();

export function registerLocale(locale: Locale, dict: TranslationDict) {
	translations.set(locale, dict);
}

// ── Reactive locale state (Svelte 5 module-level) ─────────────
let currentLocale = $state<Locale>('es');

export function getLocale(): Locale {
	return currentLocale;
}

export function setLocale(locale: Locale) {
	currentLocale = locale;
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('app-locale', locale);
	}
}

/** Detect locale from ?lang= param, Discord SDK, browser, or localStorage */
export function detectLocale(discordLocale?: string): Locale {
	// 0. URL ?lang= param (highest priority for SEO crawlers)
	if (typeof window !== 'undefined') {
		const urlLang = new URL(window.location.href).searchParams.get('lang')?.toLowerCase() as Locale | null;
		if (urlLang && SUPPORTED_LOCALES.includes(urlLang)) {
			currentLocale = urlLang;
			localStorage.setItem('app-locale', urlLang);
			return urlLang;
		}
	}

	// 1. localStorage override
	if (typeof localStorage !== 'undefined') {
		const saved = localStorage.getItem('app-locale') as Locale | null;
		if (saved && SUPPORTED_LOCALES.includes(saved)) {
			currentLocale = saved;
			return saved;
		}
	}

	// 2. Discord locale (e.g., "en-US", "es-ES", "pt-BR")
	if (discordLocale) {
		const lang = discordLocale.split('-')[0].toLowerCase() as Locale;
		if (SUPPORTED_LOCALES.includes(lang)) {
			currentLocale = lang;
			return lang;
		}
	}

	// 3. Browser language
	if (typeof navigator !== 'undefined') {
		const lang = navigator.language.split('-')[0].toLowerCase() as Locale;
		if (SUPPORTED_LOCALES.includes(lang)) {
			currentLocale = lang;
			return lang;
		}
	}

	// 4. Default
	return currentLocale;
}

/**
 * Translate a key. Supports interpolation with {key} placeholders.
 * Falls back to Spanish if key not found in current locale.
 * Falls back to the key itself if not found in any locale.
 */
export function t(key: string, params?: Record<string, string | number>): string {
	const dict = translations.get(currentLocale);
	let text = dict?.[key] ?? translations.get('es')?.[key] ?? key;
	if (params) {
		for (const [k, v] of Object.entries(params)) {
			text = text.replaceAll(`{${k}}`, String(v));
		}
	}
	return text;
}
