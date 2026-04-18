<script lang="ts">
	import type { GameDef } from '$lib/games/registry';
	import { t } from '$lib/i18n';

	let {
		game,
		isGreen = false,
		iconEl = $bindable<HTMLElement | undefined>(undefined),
		titleEl = $bindable<HTMLElement | undefined>(undefined),
		subtitle = '',
		children,
	}: {
		game: GameDef;
		isGreen?: boolean;
		iconEl?: HTMLElement | undefined;
		titleEl?: HTMLElement | undefined;
		subtitle?: string;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<div class="flex flex-col items-center lg:items-start text-center lg:text-left mb-10 mesh-gradient relative">
	<div class="absolute inset-0 glow-overlay pointer-events-none"></div>
	<div class="relative mb-8">
		<div class="absolute -inset-8 {isGreen ? 'bg-secondary/20' : 'bg-primary-dim/20'} blur-3xl rounded-full"></div>
		<div bind:this={iconEl} class="relative w-32 h-32 rounded-full border-2 border-outline-variant/20 flex items-center justify-center bg-surface-container-low shadow-2xl" style="view-transition-name: game-icon">
			<span class="iconify {game.heroIcon} text-6xl {isGreen ? 'text-secondary' : 'text-primary-dim'} drop-shadow-[0_0_15px_rgba(156,66,244,0.5)]"></span>
		</div>
	</div>
	<p class="{isGreen ? 'text-secondary' : 'text-primary-dim'} font-headline uppercase tracking-[0.4em] text-xs font-bold">{subtitle || t(`game.${game.id}.heroSubtitle`)}</p>
	<h1 bind:this={titleEl} class="text-4xl lg:text-5xl font-headline font-extrabold tracking-tighter mt-2" style="view-transition-name: game-title">
		{@html game.heroTitleHtml}
	</h1>
	<p class="text-on-surface-variant max-w-xs text-sm font-light leading-relaxed mt-3">{t(`game.${game.id}.heroDescription`)}</p>

	{#if children}
		{@render children()}
	{/if}
</div>
