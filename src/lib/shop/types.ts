/**
 * Shop system types for Discord IAP integration.
 * SKUs are created in the Discord Developer Portal.
 * Items here are the client-side catalog that maps SKU IDs to visual definitions.
 */

export type ShopItemType = 'background' | 'player-frame' | 'vote-effect' | 'sound' | 'badge' | 'emote' | 'reveal-effect';

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

export interface ShopSound {
	id: string;
	skuId: string;
	name: string;
	description: string;
	emoji: string; // Preview icon
	src: string; // Path to audio file (e.g. /audio/laugh.mp3)
}

export interface ShopBadge {
	id: string;
	skuId: string;
	name: string;
	description: string;
	label: string; // Text displayed under player name
	color: string; // CSS color for the badge text
	icon?: string; // Optional iconify icon class
}

export interface ShopEmote {
	id: string;
	skuId: string;
	name: string;
	description: string;
	emoji: string; // The emote character(s) displayed
}

export interface ShopRevealEffect {
	id: string;
	skuId: string;
	name: string;
	description: string;
	emoji: string; // Preview icon
	animation: string; // CSS animation class or identifier
}

export type ShopItem = ShopBackground | ShopPlayerFrame | ShopVoteEffect | ShopSound | ShopBadge | ShopEmote | ShopRevealEffect;

export interface UserEntitlements {
	backgroundIds: string[];
	playerFrameIds: string[];
	voteEffectIds: string[];
	soundIds: string[];
	badgeIds: string[];
	emoteIds: string[];
	revealEffectIds: string[];
}

export interface UserPreferences {
	selectedBackgroundId: string | null;
	selectedPlayerFrameId: string | null;
	selectedVoteEffectId: string | null;
	selectedBadgeId: string | null;
	selectedRevealEffectId: string | null;
}
