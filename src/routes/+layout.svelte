<script lang="ts">
	import './layout.css';
	import '$lib/i18n/register';
	import { onNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { detectLocale, t } from '$lib/i18n';

	let { children } = $props();

	// Detect locale from browser settings
	if (browser) {
		detectLocale();
	}

	// Auto-redirect to /discord/[game] when running inside a Discord Activity iframe
	if (browser && !page.url.pathname.startsWith('/discord')) {
		const params = page.url.searchParams;
		if (params.has('frame_id') || params.has('instance_id') || params.has('platform')) {
			const gameId = import.meta.env.VITE_DISCORD_GAME_ID || 'impostor';
			goto(`/discord/${gameId}?${params.toString()}`, { replaceState: true });
		}
	}

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<title>Viral Games — Juegos de Grupo para Fiestas y Amigos | Gratis Online</title>
	<meta name="description" content={t('home.meta')} />
	<link rel="canonical" href="https://viral-games.servitimo.net{page.url.pathname}" />
	<link rel="alternate" hreflang="es" href="https://viral-games.servitimo.net{page.url.pathname}?lang=es" />
	<link rel="alternate" hreflang="en" href="https://viral-games.servitimo.net{page.url.pathname}?lang=en" />
	<link rel="alternate" hreflang="x-default" href="https://viral-games.servitimo.net{page.url.pathname}" />
</svelte:head>

<div class="min-h-dvh bg-background text-on-background font-body selection:bg-primary/30">
	{@render children()}
</div>
