<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { DISCORD_GAMES } from '$lib/games/registry';
	import type { GameDef } from '$lib/games/registry';
	import { hapticTap } from '$lib/haptics';

	let { currentGame, buildHref }: { currentGame: GameDef; buildHref: (game: GameDef) => string } = $props();

	let open = $state(false);
</script>

<div class="relative">
	<button onclick={() => { open = !open; hapticTap(); }}
		class="w-8 h-8 rounded-full bg-surface-container-high/60 flex items-center justify-center text-secondary hover:bg-surface-container-highest transition-colors"
		aria-label="Switch game"
	>
		<span class="iconify material-symbols--swap-horiz text-lg"></span>
	</button>
	{#if open}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="absolute right-0 top-10 z-50 bg-surface-container-highest rounded-xl border border-outline-variant/20 shadow-xl p-1 min-w-40"
			 onmouseleave={() => open = false}>
			{#each DISCORD_GAMES as g}
				<button
					onclick={() => { open = false; if (g.id !== currentGame.id) goto(buildHref(g)); }}
					class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors {g.id === currentGame.id ? 'bg-primary/15 text-primary' : 'text-on-surface hover:bg-surface-container-high'}"
				>
					<span class="iconify {g.icon} {g.iconColorClass} text-base"></span>
					<span class="font-bold text-xs">{g.headerTitle}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>
