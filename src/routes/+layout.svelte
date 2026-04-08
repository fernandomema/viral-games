<script lang="ts">
	import './layout.css';
	import { onNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { browser } from '$app/environment';

	let { children } = $props();

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
	<meta name="description" content="Juegos sociales para jugar con amigos pasando el móvil" />
</svelte:head>

<div class="min-h-dvh bg-background text-on-background font-body selection:bg-primary/30">
	{@render children()}
</div>
