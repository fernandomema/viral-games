<script lang="ts">
	import type { GameDef } from '$lib/games/registry';
	import { haptic, hapticTap } from '$lib/haptics';
	import { t } from '$lib/i18n';

	let {
		game,
		isGreen = false,
		configImpostors = $bindable(1),
		configTimer = $bindable(300),
		configHint = $bindable(true),
		configRounds = $bindable(2),
		configTurnTimer = $bindable(15),
		maxImpostors = 1,
		playerCount = 0,
	}: {
		game: GameDef;
		isGreen?: boolean;
		configImpostors?: number;
		configTimer?: number;
		configHint?: boolean;
		configRounds?: number;
		configTurnTimer?: number;
		maxImpostors?: number;
		playerCount?: number;
	} = $props();

	function formatTime(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	}
</script>

<div class="glass-panel rounded-2xl p-6 border border-outline-variant/10 mb-6">
	<div class="flex items-center gap-2 mb-5">
		<span class="iconify material-symbols--tune {isGreen ? 'text-primary' : 'text-primary-dim'} text-xl"></span>
		<h3 class="font-headline text-lg font-bold tracking-tight">{t('game.config')}</h3>
	</div>

	<!-- Impostor count -->
	<div class="mb-5">
		<div class="flex items-center justify-between mb-2">
			<span class="text-sm font-bold text-on-surface-variant font-headline uppercase tracking-wider">{t('game.impostors')}</span>
			<span class="{isGreen ? 'text-primary' : 'text-primary-dim'} font-headline font-bold text-lg">{configImpostors}</span>
		</div>
		<div class="flex items-center gap-3">
			<button onclick={() => { const prev = configImpostors; configImpostors = Math.max(1, configImpostors - 1); configImpostors === prev ? haptic('error') : hapticTap(); }}
				class="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant/20 flex items-center justify-center active:scale-90 transition-all hover:bg-surface-container-highest"
				aria-label="Decrease impostors">
				<span class="iconify material-symbols--remove text-on-surface-variant"></span>
			</button>
			<div class="grow h-2 bg-surface-container-highest rounded-full overflow-hidden">
				<div class="h-full bg-linear-to-r from-primary-dim to-primary rounded-full transition-all"
					style="width: {(configImpostors / Math.max(maxImpostors, 1)) * 100}%"></div>
			</div>
			<button onclick={() => { const prev = configImpostors; configImpostors = Math.min(maxImpostors, configImpostors + 1); configImpostors === prev ? haptic('error') : hapticTap(); }}
				class="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant/20 flex items-center justify-center active:scale-90 transition-all hover:bg-surface-container-highest"
				aria-label="Increase impostors">
				<span class="iconify material-symbols--add text-on-surface-variant"></span>
			</button>
		</div>
		<p class="text-[10px] text-on-surface-variant mt-1">{t('game.maxImpostors', { max: maxImpostors, count: playerCount })}</p>
	</div>

	<!-- Timer (word + fact only) -->
	{#if game.type === 'word' || game.type === 'fact'}
		<div class="mb-5">
			<div class="flex items-center justify-between mb-2">
				<span class="text-sm font-bold text-on-surface-variant font-headline uppercase tracking-wider">{t('game.timer')}</span>
				<span class="{isGreen ? 'text-primary' : 'text-primary-dim'} font-headline font-bold">{formatTime(configTimer)}</span>
			</div>
			<div class="flex flex-wrap gap-2">
				{#each [120, 180, 300, 420, 600] as tv}
					<button onclick={() => { configTimer = tv; hapticTap(); }}
						class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95
							{configTimer === tv ? 'bg-primary text-on-primary-fixed' : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/20'}">
						{formatTime(tv)}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Rounds (draw only) -->
	{#if game.type === 'draw'}
		<div class="mb-5">
			<div class="flex items-center justify-between mb-2">
				<span class="text-sm font-bold text-on-surface-variant font-headline uppercase tracking-wider">{t('game.rounds')}</span>
				<span class="text-primary-dim font-headline font-bold">{configRounds}</span>
			</div>
			<div class="flex flex-wrap gap-2">
				{#each [1,2,3,4] as r}
					<button onclick={() => { configRounds = r; hapticTap(); }}
						class="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95
							{configRounds === r ? 'bg-primary text-on-primary-fixed' : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/20'}">
						{r}
					</button>
				{/each}
			</div>
		</div>

		<!-- Timer per turn -->
		<div class="mb-5">
			<div class="flex items-center justify-between mb-2">
				<span class="text-sm font-bold text-on-surface-variant font-headline uppercase tracking-wider">{t('game.secsPerTurn')}</span>
				<span class="text-primary-dim font-headline font-bold">{configTurnTimer}s</span>
			</div>
			<div class="flex flex-wrap gap-2">
				{#each [10, 15, 20, 30] as tv}
					<button onclick={() => { configTurnTimer = tv; hapticTap(); }}
						class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95
							{configTurnTimer === tv ? 'bg-primary text-on-primary-fixed' : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/20'}">
						{tv}s
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Hint toggle (word + draw only) -->
	{#if game.type === 'word' || game.type === 'draw'}
		<div class="flex items-center justify-between p-3 rounded-xl bg-surface-container-high border border-outline-variant/10">
			<div class="flex items-center gap-3">
				<span class="iconify material-symbols--lightbulb {isGreen ? 'text-primary' : 'text-primary-dim'} text-xl"></span>
				<div>
					<p class="text-sm font-bold text-on-surface">{t('game.impostorHint')}</p>
					<p class="text-[10px] text-on-surface-variant">{game.type === 'word' ? t('game.impostorHintDesc') : t('game.impostorHintShort')}</p>
				</div>
			</div>
			<button onclick={() => { configHint = !configHint; hapticTap(); }}
				class="w-12 h-7 rounded-full transition-all relative {configHint ? 'bg-primary' : 'bg-surface-container-highest border border-outline-variant/30'}"
				aria-label="Toggle hint">
				<div class="w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-all {configHint ? 'left-6' : 'left-1'}"></div>
			</button>
		</div>
	{/if}
</div>
