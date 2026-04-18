<script lang="ts">
	import { hapticTap } from '$lib/haptics';
	import { t } from '$lib/i18n';

	let {
		categories,
		selectedCategory = $bindable<string | undefined>(undefined),
		isGreen = false,
	}: {
		categories: { name: string; icon: string }[];
		selectedCategory?: string | undefined;
		isGreen?: boolean;
	} = $props();
</script>

<div class="glass-panel rounded-2xl p-6 border border-outline-variant/10 mb-6">
	<div class="flex items-center gap-2 mb-4">
		<span class="iconify material-symbols--category {isGreen ? 'text-secondary' : 'text-primary-dim'} text-xl"></span>
		<h3 class="font-headline text-lg font-bold tracking-tight">{t('game.category')}</h3>
	</div>
	<div class="flex flex-wrap gap-2">
		<button
			onclick={() => { selectedCategory = undefined; hapticTap(); }}
			class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95
				{selectedCategory === undefined ? 'bg-primary text-on-primary-fixed' : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/20'}"
		>
			{t('game.random')}
		</button>
		{#each categories as cat}
			<button
				onclick={() => { selectedCategory = cat.name; hapticTap(); }}
				class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1
					{selectedCategory === cat.name ? 'bg-primary text-on-primary-fixed' : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/20'}"
			>
				<span class="iconify {cat.icon} text-sm"></span>
				{cat.name}
			</button>
		{/each}
	</div>
</div>
