// Re-export from .svelte.ts so $lib/i18n barrel imports keep working
export {
	type Locale,
	SUPPORTED_LOCALES,
	LOCALE_LABELS,
	registerLocale,
	getLocale,
	setLocale,
	detectLocale,
	t,
} from './index.svelte';
