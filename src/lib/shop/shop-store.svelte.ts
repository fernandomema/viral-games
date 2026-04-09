/**
 * Shop store — manages user entitlements and preferences via Discord SDK.
 * Uses Discord's IAP system: getSkus(), getEntitlements(), startPurchase().
 */

import type { DiscordSDK } from '@discord/embedded-app-sdk';
import type { UserEntitlements, UserPreferences } from './types';
import { ITEM_BY_SKU, BACKGROUNDS, PLAYER_FRAMES, VOTE_EFFECTS, BADGES, REVEAL_EFFECTS } from './catalog';

// ── Reactive state (Svelte 5 module-level) ────────────────────

let _discordSdk: DiscordSDK | null = null;

// User's owned items (derived from Discord entitlements)
let entitlements = $state<UserEntitlements>({
	backgroundIds: ['bg-default'],
	playerFrameIds: ['frame-default'],
	voteEffectIds: ['vote-default'],
	soundIds: [],
	badgeIds: ['badge-default'],
	emoteIds: [],
	revealEffectIds: ['reveal-default'],
});

// User's active selections (persisted in localStorage)
let preferences = $state<UserPreferences>(loadPreferences());

// Available Discord SKUs with prices
let skus = $state<Array<{ id: string; name: string; price: { amount: number; currency: string } }>>([]);

// Loading state
let loading = $state(false);

// ── Init ──────────────────────────────────────────────────────

export function initShop(discordSdk: DiscordSDK) {
	_discordSdk = discordSdk;
	refreshEntitlements();
	refreshSkus();

	// Subscribe to real-time entitlement creation (fires after purchase completes)
	try {
		discordSdk.subscribe('ENTITLEMENT_CREATE', () => {
			refreshEntitlements();
		});
	} catch {
		// ENTITLEMENT_CREATE may not be available yet (Developer Preview)
	}
}

// ── Discord SDK calls ─────────────────────────────────────────

export async function refreshSkus() {
	if (!_discordSdk) return;
	try {
		const res = await _discordSdk.commands.getSkus();
		skus = res.skus.map(s => ({
			id: s.id,
			name: s.name,
			price: s.price,
		}));
	} catch (err) {
		console.error('[Shop] getSkus failed:', err);
	}
}

export async function refreshEntitlements() {
	if (!_discordSdk) return;
	loading = true;
	try {
		const res = await _discordSdk.commands.getEntitlements();
		const owned: UserEntitlements = {
			backgroundIds: ['bg-default'],
			playerFrameIds: ['frame-default'],
			voteEffectIds: ['vote-default'],
			soundIds: [],
			badgeIds: ['badge-default'],
			emoteIds: [],
			revealEffectIds: ['reveal-default'],
		};

		for (const ent of res.entitlements) {
			const item = ITEM_BY_SKU.get(ent.sku_id);
			if (!item) continue;
			if (item.type === 'background' && !owned.backgroundIds.includes(item.id)) {
				owned.backgroundIds.push(item.id);
			} else if (item.type === 'player-frame' && !owned.playerFrameIds.includes(item.id)) {
				owned.playerFrameIds.push(item.id);
			} else if (item.type === 'vote-effect' && !owned.voteEffectIds.includes(item.id)) {
				owned.voteEffectIds.push(item.id);
			} else if (item.type === 'sound' && !owned.soundIds.includes(item.id)) {
				owned.soundIds.push(item.id);
			} else if (item.type === 'badge' && !owned.badgeIds.includes(item.id)) {
				owned.badgeIds.push(item.id);
			} else if (item.type === 'emote' && !owned.emoteIds.includes(item.id)) {
				owned.emoteIds.push(item.id);
			} else if (item.type === 'reveal-effect' && !owned.revealEffectIds.includes(item.id)) {
				owned.revealEffectIds.push(item.id);
			}
		}

		entitlements = owned;
	} catch (err) {
		console.error('[Shop] getEntitlements failed:', err);
	} finally {
		loading = false;
	}
}

export async function purchaseItem(skuId: string) {
	if (!_discordSdk) return;
	try {
		await _discordSdk.commands.startPurchase({ sku_id: skuId });
		// After purchase, refresh entitlements to pick up the new item
		await refreshEntitlements();
	} catch (err) {
		console.error('[Shop] startPurchase failed:', err);
	}
}

// ── Preference management ─────────────────────────────────────

function loadPreferences(): UserPreferences {
	if (typeof localStorage === 'undefined') {
		return { selectedBackgroundId: null, selectedPlayerFrameId: null, selectedVoteEffectId: null, selectedBadgeId: null, selectedRevealEffectId: null };
	}
	try {
		const raw = localStorage.getItem('shop-preferences');
		if (raw) return JSON.parse(raw);
	} catch { /* ignore */ }
	return { selectedBackgroundId: null, selectedPlayerFrameId: null, selectedVoteEffectId: null, selectedBadgeId: null, selectedRevealEffectId: null };
}

function savePreferences() {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem('shop-preferences', JSON.stringify(preferences));
}

export function selectBackground(id: string | null) {
	preferences.selectedBackgroundId = id;
	savePreferences();
}

export function selectPlayerFrame(id: string | null) {
	preferences.selectedPlayerFrameId = id;
	savePreferences();
}

export function selectVoteEffect(id: string | null) {
	preferences.selectedVoteEffectId = id;
	savePreferences();
}

export function selectBadge(id: string | null) {
	preferences.selectedBadgeId = id;
	savePreferences();
}

export function selectRevealEffect(id: string | null) {
	preferences.selectedRevealEffectId = id;
	savePreferences();
}

// ── Getters (exported reactive) ───────────────────────────────

export function getEntitlements() { return entitlements; }
export function getPreferences() { return preferences; }
export function getSkus() { return skus; }
export function isLoading() { return loading; }

export function getActiveBackground() {
	const id = preferences.selectedBackgroundId ?? 'bg-default';
	return BACKGROUNDS.find(b => b.id === id) ?? BACKGROUNDS[0];
}

export function getActivePlayerFrame() {
	const id = preferences.selectedPlayerFrameId ?? 'frame-default';
	return PLAYER_FRAMES.find(f => f.id === id) ?? PLAYER_FRAMES[0];
}

export function getActiveVoteEffect() {
	const id = preferences.selectedVoteEffectId ?? 'vote-default';
	return VOTE_EFFECTS.find(e => e.id === id) ?? VOTE_EFFECTS[0];
}

export function getActiveBadge() {
	const id = preferences.selectedBadgeId ?? 'badge-default';
	return BADGES.find(b => b.id === id) ?? BADGES[0];
}

export function getActiveRevealEffect() {
	const id = preferences.selectedRevealEffectId ?? 'reveal-default';
	return REVEAL_EFFECTS.find(r => r.id === id) ?? REVEAL_EFFECTS[0];
}

export function ownsItem(itemId: string): boolean {
	return (
		entitlements.backgroundIds.includes(itemId) ||
		entitlements.playerFrameIds.includes(itemId) ||
		entitlements.voteEffectIds.includes(itemId) ||
		entitlements.soundIds.includes(itemId) ||
		entitlements.badgeIds.includes(itemId) ||
		entitlements.emoteIds.includes(itemId) ||
		entitlements.revealEffectIds.includes(itemId)
	);
}

export function getSkuPrice(skuId: string): { amount: number; currency: string } | null {
	const sku = skus.find(s => s.id === skuId);
	return sku?.price ?? null;
}

export function formatPrice(price: { amount: number; currency: string }): string {
	// Discord prices are in the smallest currency unit (e.g., cents)
	return new Intl.NumberFormat('es', {
		style: 'currency',
		currency: price.currency,
	}).format(price.amount / 100);
}
