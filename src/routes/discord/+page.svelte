<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	const gameId = import.meta.env.VITE_DISCORD_GAME_ID || 'impostor';
	$effect(() => {
		const qs = page.url.search;
		goto(`/discord/${gameId}${qs}`, { replaceState: true });
	});
</script>

<div class="h-dvh bg-background flex items-center justify-center">
	<span class="iconify material-symbols--sports-esports text-5xl text-primary animate-pulse"></span>
</div>
