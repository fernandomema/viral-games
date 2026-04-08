/**
 * Shop system types for Discord IAP integration.
 * SKUs are created in the Discord Developer Portal.
 * Items here are the client-side catalog that maps SKU IDs to visual definitions.
 */

export type ShopItemType = 'background' | 'player-frame' | 'vote-effect';

export interface ShopBackground {
	id: string;
	skuId: string; // Discord SKU ID — set after creating in Developer Portal
	name: string;
	description: string;
	preview: string; // CSS background value for preview thumbnail
	css: string; // CSS background applied to the game container
	overlayCSS?: string; // Optional overlay effect
}

export interface ShopPlayerFrame {
	id: string;
	skuId: string;
	name: string;
	description: string;
	borderCSS: string; // CSS applied to player name chips
	glowCSS?: string;
}

export interface ShopVoteEffect {
	id: string;
	skuId: string;
	name: string;
	description: string;
	emoji: string; // Visual indicator in vote list
}

export type ShopItem = ShopBackground | ShopPlayerFrame | ShopVoteEffect;

export interface UserEntitlements {
	backgroundIds: string[];
	playerFrameIds: string[];
	voteEffectIds: string[];
}

export interface UserPreferences {
	selectedBackgroundId: string | null;
	selectedPlayerFrameId: string | null;
	selectedVoteEffectId: string | null;
}
