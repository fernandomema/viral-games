<script lang="ts">
	import { BACKGROUNDS, PLAYER_FRAMES, VOTE_EFFECTS, PURCHASABLE_BACKGROUNDS, PURCHASABLE_FRAMES, PURCHASABLE_EFFECTS } from '$lib/shop/catalog';
	import {
		purchaseItem,
		selectBackground,
		selectPlayerFrame,
		selectVoteEffect,
		getEntitlements,
		getPreferences,
		ownsItem,
		getSkuPrice,
		formatPrice,
	} from '$lib/shop/shop-store.svelte';
	import { hapticTap } from '$lib/haptics';
	import { t } from '$lib/i18n';

	let { open = $bindable(false) } = $props();

	let tab = $state<'backgrounds' | 'frames' | 'effects'>('backgrounds');
	let entitlements = $derived(getEntitlements());
	let prefs = $derived(getPreferences());

	/** Items with placeholder SKU IDs (SKU_*) are coming soon */
	function isComingSoon(skuId: string): boolean {
		return skuId !== '' && skuId.startsWith('SKU_');
	}

	function handleSelectBackground(id: string) {
		if (!ownsItem(id) && id !== 'bg-default') return;
		selectBackground(id === 'bg-default' ? null : id);
		hapticTap();
	}

	function handleSelectFrame(id: string) {
		if (!ownsItem(id) && id !== 'frame-default') return;
		selectPlayerFrame(id === 'frame-default' ? null : id);
		hapticTap();
	}

	function handleSelectEffect(id: string) {
		if (!ownsItem(id) && id !== 'vote-default') return;
		selectVoteEffect(id === 'vote-default' ? null : id);
		hapticTap();
	}

	async function handlePurchase(skuId: string) {
		hapticTap();
		await purchaseItem(skuId);
	}

	function close() {
		open = false;
		hapticTap();
	}
</script>

{#if open}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex flex-col" onclick={close} onkeydown={(e) => e.key === 'Escape' && close()}>
		<!-- Dimmed backdrop -->
		<div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

		<!-- Modal content -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="relative mt-auto h-[85dvh] bg-surface-container rounded-t-2xl flex flex-col overflow-hidden animate-slide-up"
				 onclick={(e) => e.stopPropagation()} onkeydown={() => {}}>

			<!-- Header -->
			<div class="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 shrink-0">
				<h2 class="text-lg font-bold font-headline flex items-center gap-2">
					<span class="iconify material-symbols--storefront text-xl text-primary"></span>
					<span class="text-on-surface">{t('shop.title')}</span>
				</h2>
				<button onclick={close} class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors">
					<span class="iconify material-symbols--close text-lg"></span>
				</button>
			</div>

			<!-- Tabs -->
			<div class="flex gap-1 px-3 py-2 shrink-0">
				<button
					onclick={() => { tab = 'backgrounds'; hapticTap(); }}
					class="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all {tab === 'backgrounds' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}"
				>
					<span class="iconify material-symbols--wallpaper text-sm align-middle mr-0.5"></span>
					{t('shop.backgrounds')}
				</button>
				<button
					onclick={() => { tab = 'frames'; hapticTap(); }}
					class="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all {tab === 'frames' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}"
				>
					<span class="iconify material-symbols--frame-person text-sm align-middle mr-0.5"></span>
					{t('shop.frames')}
				</button>
				<button
					onclick={() => { tab = 'effects'; hapticTap(); }}
					class="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all {tab === 'effects' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}"
				>
					<span class="iconify material-symbols--auto-awesome text-sm align-middle mr-0.5"></span>
					{t('shop.effects')}
				</button>
			</div>

			<!-- Content -->
			<div class="flex-1 overflow-y-auto px-3 pb-4 min-h-0">
				{#if tab === 'backgrounds'}
					<div class="grid grid-cols-2 gap-2.5 pt-1">
						{#each BACKGROUNDS as bg}
							{@const comingSoon = isComingSoon(bg.skuId)}
							{@const owned = !comingSoon && (ownsItem(bg.id) || bg.skuId === '')}
							{@const active = (prefs.selectedBackgroundId ?? 'bg-default') === bg.id}
							{@const price = bg.skuId && !comingSoon ? getSkuPrice(bg.skuId) : null}
							<button
								onclick={() => comingSoon ? null : owned ? handleSelectBackground(bg.id) : handlePurchase(bg.skuId)}
								disabled={comingSoon}
								class="relative rounded-xl overflow-hidden transition-all {comingSoon ? 'opacity-60 cursor-not-allowed' : ''} {active ? 'ring-2 ring-primary scale-[1.02]' : 'ring-1 ring-outline-variant/30'}"
							>
								<!-- Preview swatch -->
								<div class="aspect-[4/3] relative">
									<div class="absolute inset-0" style="background: {bg.css};"></div>
									{#if bg.overlayCSS}
										<div class="absolute inset-0" style="background: {bg.overlayCSS};"></div>
									{/if}
									<!-- Name overlay -->
									<div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
										<p class="text-on-surface text-xs font-medium text-left">{bg.name}</p>
									</div>
									<!-- Status badge -->
									{#if comingSoon}
										<div class="absolute top-1.5 right-1.5 bg-outline-variant/30 text-on-surface-variant rounded-full px-1.5 py-0.5 text-[10px] font-bold flex items-center gap-0.5">
											<span class="iconify material-symbols--schedule text-xs"></span>
											{t('shop.comingSoon')}
										</div>
									{:else if active}
										<div class="absolute top-1.5 right-1.5 bg-primary text-on-primary rounded-full px-1.5 py-0.5 text-[10px] font-bold flex items-center gap-0.5">
											<span class="iconify material-symbols--check text-xs"></span>
											{t('shop.active')}
										</div>
									{:else if owned}
										<div class="absolute top-1.5 right-1.5 bg-secondary/20 text-secondary rounded-full px-1.5 py-0.5 text-[10px] font-bold">
											{t('shop.owned')}
										</div>
									{:else}
										<div class="absolute top-1.5 right-1.5 bg-tertiary/20 text-tertiary rounded-full px-1.5 py-0.5 text-[10px] font-bold flex items-center gap-0.5">
											<span class="iconify material-symbols--shopping-cart text-xs"></span>
											{price ? formatPrice(price) : t('shop.buy')}
										</div>
									{/if}
								</div>
							</button>
						{/each}
					</div>

				{:else if tab === 'frames'}
					<div class="flex flex-col gap-2.5 pt-1">
						{#each PLAYER_FRAMES as frame}
							{@const comingSoon = isComingSoon(frame.skuId)}
							{@const owned = !comingSoon && (ownsItem(frame.id) || frame.skuId === '')}
							{@const active = (prefs.selectedPlayerFrameId ?? 'frame-default') === frame.id}
							{@const price = frame.skuId && !comingSoon ? getSkuPrice(frame.skuId) : null}
							<button
								onclick={() => comingSoon ? null : owned ? handleSelectFrame(frame.id) : handlePurchase(frame.skuId)}
								disabled={comingSoon}
								class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all {comingSoon ? 'opacity-60 cursor-not-allowed' : ''} {active ? 'ring-2 ring-primary bg-surface-container-high' : 'ring-1 ring-outline-variant/20 bg-surface-container'}"
							>
								<!-- Frame preview chip -->
								<span
									class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high/50 text-sm"
									style="{frame.borderCSS} {frame.glowCSS ?? ''}"
								>
									<span class="iconify material-symbols--person text-primary text-sm"></span>
									<span class="text-on-surface font-medium">{t('shop.player')}</span>
								</span>

								<!-- Info -->
								<div class="flex-1 text-left">
									<p class="text-on-surface text-sm font-medium">{frame.name}</p>
									<p class="text-on-surface-variant text-[10px]">{frame.description}</p>
								</div>

								<!-- Status -->
								{#if comingSoon}
									<span class="text-on-surface-variant text-[10px] font-bold flex items-center gap-0.5">
										<span class="iconify material-symbols--schedule text-xs"></span>
										{t('shop.soon')}
									</span>
								{:else if active}
									<span class="iconify material-symbols--check-circle text-primary text-lg"></span>
								{:else if owned}
									<span class="text-secondary text-[10px] font-bold">{t('shop.owned')}</span>
								{:else}
									<span class="text-tertiary text-[10px] font-bold flex items-center gap-0.5">
										<span class="iconify material-symbols--shopping-cart text-xs"></span>
										{price ? formatPrice(price) : t('shop.buy')}
									</span>
								{/if}
							</button>
						{/each}
					</div>

				{:else if tab === 'effects'}
					<div class="flex flex-col gap-2.5 pt-1">
						{#each VOTE_EFFECTS as effect}
							{@const comingSoon = isComingSoon(effect.skuId)}
							{@const owned = !comingSoon && (ownsItem(effect.id) || effect.skuId === '')}
							{@const active = (prefs.selectedVoteEffectId ?? 'vote-default') === effect.id}
							{@const price = effect.skuId && !comingSoon ? getSkuPrice(effect.skuId) : null}
							<button
								onclick={() => comingSoon ? null : owned ? handleSelectEffect(effect.id) : handlePurchase(effect.skuId)}
								disabled={comingSoon}
								class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all {comingSoon ? 'opacity-60 cursor-not-allowed' : ''} {active ? 'ring-2 ring-primary bg-surface-container-high' : 'ring-1 ring-outline-variant/20 bg-surface-container'}"
							>
								<!-- Effect preview -->
								<span class="text-2xl w-8 text-center">{effect.emoji || '🗳️'}</span>

								<!-- Info -->
								<div class="flex-1 text-left">
									<p class="text-on-surface text-sm font-medium">{effect.name}</p>
									<p class="text-on-surface-variant text-[10px]">{effect.description}</p>
								</div>

								<!-- Status -->
								{#if comingSoon}
									<span class="text-on-surface-variant text-[10px] font-bold flex items-center gap-0.5">
										<span class="iconify material-symbols--schedule text-xs"></span>
										{t('shop.soon')}
									</span>
								{:else if active}
									<span class="iconify material-symbols--check-circle text-primary text-lg"></span>
								{:else if owned}
									<span class="text-secondary text-[10px] font-bold">{t('shop.owned')}</span>
								{:else}
									<span class="text-tertiary text-[10px] font-bold flex items-center gap-0.5">
										<span class="iconify material-symbols--shopping-cart text-xs"></span>
										{price ? formatPrice(price) : t('shop.buy')}
									</span>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes slide-up {
		from { transform: translateY(100%); }
		to { transform: translateY(0); }
	}
	.animate-slide-up {
		animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}
</style>
