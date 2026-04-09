<script lang="ts">
	import { BACKGROUNDS, PLAYER_FRAMES, VOTE_EFFECTS, SOUNDS, BADGES, EMOTES, REVEAL_EFFECTS } from '$lib/shop/catalog';
	import {
		purchaseItem,
		selectBackground,
		selectPlayerFrame,
		selectVoteEffect,
		selectBadge,
		selectRevealEffect,
		getEntitlements,
		getPreferences,
		ownsItem,
		getSkuPrice,
		formatPrice,
	} from '$lib/shop/shop-store.svelte';
	import { hapticTap } from '$lib/haptics';
	import { t } from '$lib/i18n';

	let { open = $bindable(false) } = $props();

	type ShopTab = 'backgrounds' | 'frames' | 'effects' | 'sounds' | 'badges' | 'emotes' | 'reveals';
	let tab = $state<ShopTab>('backgrounds');
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

	function handleSelectBadge(id: string) {
		if (!ownsItem(id) && id !== 'badge-default') return;
		selectBadge(id === 'badge-default' ? null : id);
		hapticTap();
	}

	function handleSelectReveal(id: string) {
		if (!ownsItem(id) && id !== 'reveal-default') return;
		selectRevealEffect(id === 'reveal-default' ? null : id);
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

	const tabs: { id: ShopTab; icon: string; labelKey: string }[] = [
		{ id: 'backgrounds', icon: 'material-symbols--wallpaper', labelKey: 'shop.backgrounds' },
		{ id: 'frames', icon: 'material-symbols--frame-person', labelKey: 'shop.frames' },
		{ id: 'effects', icon: 'material-symbols--auto-awesome', labelKey: 'shop.effects' },
		{ id: 'sounds', icon: 'material-symbols--volume-up', labelKey: 'shop.sounds' },
		{ id: 'badges', icon: 'material-symbols--badge', labelKey: 'shop.badges' },
		{ id: 'emotes', icon: 'material-symbols--emoji-emotions', labelKey: 'shop.emotes' },
		{ id: 'reveals', icon: 'material-symbols--celebration', labelKey: 'shop.reveals' },
	];
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
			<div class="flex gap-0.5 px-2 py-2 shrink-0 overflow-x-auto no-scrollbar">
				{#each tabs as t_tab}
					<button
						onclick={() => { tab = t_tab.id; hapticTap(); }}
						class="flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all flex items-center gap-1 {tab === t_tab.id ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}"
					>
						<span class="iconify {t_tab.icon} text-sm"></span>
						{t(t_tab.labelKey)}
					</button>
				{/each}
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
								<span class="text-2xl w-8 text-center">{effect.emoji || '🗳️'}</span>
								<div class="flex-1 text-left">
									<p class="text-on-surface text-sm font-medium">{effect.name}</p>
									<p class="text-on-surface-variant text-[10px]">{effect.description}</p>
								</div>
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

				{:else if tab === 'sounds'}
					<div class="flex flex-col gap-2.5 pt-1">
						{#each SOUNDS as sound}
							{@const comingSoon = isComingSoon(sound.skuId)}
							{@const owned = !comingSoon && ownsItem(sound.id)}
							{@const price = sound.skuId && !comingSoon ? getSkuPrice(sound.skuId) : null}
							<button
								onclick={() => comingSoon ? null : owned ? null : handlePurchase(sound.skuId)}
								disabled={comingSoon}
								class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all {comingSoon ? 'opacity-60 cursor-not-allowed' : ''} {owned ? 'ring-2 ring-secondary/50 bg-surface-container-high' : 'ring-1 ring-outline-variant/20 bg-surface-container'}"
							>
								<span class="text-2xl w-8 text-center">{sound.emoji}</span>
								<div class="flex-1 text-left">
									<p class="text-on-surface text-sm font-medium">{sound.name}</p>
									<p class="text-on-surface-variant text-[10px]">{sound.description}</p>
								</div>
								{#if comingSoon}
									<span class="text-on-surface-variant text-[10px] font-bold flex items-center gap-0.5">
										<span class="iconify material-symbols--schedule text-xs"></span>
										{t('shop.soon')}
									</span>
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

				{:else if tab === 'badges'}
					<div class="flex flex-col gap-2.5 pt-1">
						{#each BADGES as badge}
							{@const comingSoon = isComingSoon(badge.skuId)}
							{@const owned = !comingSoon && (ownsItem(badge.id) || badge.skuId === '')}
							{@const active = (prefs.selectedBadgeId ?? 'badge-default') === badge.id}
							{@const price = badge.skuId && !comingSoon ? getSkuPrice(badge.skuId) : null}
							<button
								onclick={() => comingSoon ? null : owned ? handleSelectBadge(badge.id) : handlePurchase(badge.skuId)}
								disabled={comingSoon}
								class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all {comingSoon ? 'opacity-60 cursor-not-allowed' : ''} {active ? 'ring-2 ring-primary bg-surface-container-high' : 'ring-1 ring-outline-variant/20 bg-surface-container'}"
							>
								<span class="w-8 text-center">
									{#if badge.icon}
										<span class="iconify {badge.icon} text-2xl" style="color: {badge.color};"></span>
									{:else}
										<span class="text-2xl text-on-surface-variant/30">—</span>
									{/if}
								</span>
								<div class="flex-1 text-left">
									<p class="text-on-surface text-sm font-medium">{badge.name}</p>
									{#if badge.label}
										<p class="text-[10px] font-bold" style="color: {badge.color};">{badge.label}</p>
									{:else}
										<p class="text-on-surface-variant text-[10px]">{badge.description}</p>
									{/if}
								</div>
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

				{:else if tab === 'emotes'}
					<div class="grid grid-cols-3 gap-2.5 pt-1">
						{#each EMOTES as emote}
							{@const comingSoon = isComingSoon(emote.skuId)}
							{@const owned = !comingSoon && ownsItem(emote.id)}
							{@const price = emote.skuId && !comingSoon ? getSkuPrice(emote.skuId) : null}
							<button
								onclick={() => comingSoon ? null : owned ? null : handlePurchase(emote.skuId)}
								disabled={comingSoon}
								class="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all {comingSoon ? 'opacity-60 cursor-not-allowed' : ''} {owned ? 'ring-2 ring-secondary/50 bg-surface-container-high' : 'ring-1 ring-outline-variant/20 bg-surface-container'}"
							>
								<span class="text-3xl">{emote.emoji}</span>
								<p class="text-on-surface text-xs font-medium">{emote.name}</p>
								{#if comingSoon}
									<span class="text-on-surface-variant text-[9px] font-bold">{t('shop.soon')}</span>
								{:else if owned}
									<span class="text-secondary text-[9px] font-bold">{t('shop.owned')}</span>
								{:else}
									<span class="text-tertiary text-[9px] font-bold">{price ? formatPrice(price) : t('shop.buy')}</span>
								{/if}
							</button>
						{/each}
					</div>

				{:else if tab === 'reveals'}
					<div class="flex flex-col gap-2.5 pt-1">
						{#each REVEAL_EFFECTS as reveal}
							{@const comingSoon = isComingSoon(reveal.skuId)}
							{@const owned = !comingSoon && (ownsItem(reveal.id) || reveal.skuId === '')}
							{@const active = (prefs.selectedRevealEffectId ?? 'reveal-default') === reveal.id}
							{@const price = reveal.skuId && !comingSoon ? getSkuPrice(reveal.skuId) : null}
							<button
								onclick={() => comingSoon ? null : owned ? handleSelectReveal(reveal.id) : handlePurchase(reveal.skuId)}
								disabled={comingSoon}
								class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all {comingSoon ? 'opacity-60 cursor-not-allowed' : ''} {active ? 'ring-2 ring-primary bg-surface-container-high' : 'ring-1 ring-outline-variant/20 bg-surface-container'}"
							>
								<span class="text-2xl w-8 text-center">{reveal.emoji || '📋'}</span>
								<div class="flex-1 text-left">
									<p class="text-on-surface text-sm font-medium">{reveal.name}</p>
									<p class="text-on-surface-variant text-[10px]">{reveal.description}</p>
								</div>
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
	.no-scrollbar::-webkit-scrollbar { display: none; }
	.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
