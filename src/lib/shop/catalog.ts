/**
 * Shop item catalog — backgrounds, player frames, and vote effects.
 * SKU IDs are placeholders until created in Discord Developer Portal.
 * Set real SKU IDs after creating them at:
 *   https://discord.com/developers/applications/<APP_ID>/skus
 */

import type { ShopBackground, ShopPlayerFrame, ShopVoteEffect } from './types';

// ── Backgrounds ───────────────────────────────────────────────

export const BACKGROUNDS: ShopBackground[] = [
	{
		id: 'bg-default',
		skuId: '', // Free — included by default
		name: 'Sombra Oscura',
		description: 'El fondo por defecto del juego.',
		preview: '#0e0e13',
		css: '#0e0e13',
	},
	{
		id: 'bg-nebula',
		skuId: '1491444385227739276', // Replace with real SKU ID
		name: 'Nebulosa Cósmica',
		description: 'Un cielo profundo de púrpuras y azules.',
		preview: 'linear-gradient(135deg, #0a0015 0%, #1a0040 30%, #2d1b69 60%, #0e0e13 100%)',
		css: 'linear-gradient(135deg, #0a0015 0%, #1a0040 30%, #2d1b69 60%, #0e0e13 100%)',
		overlayCSS: 'radial-gradient(ellipse at 30% 20%, rgba(156, 66, 244, 0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(47, 0, 120, 0.1) 0%, transparent 50%)',
	},
	{
		id: 'bg-matrix',
		skuId: 'SKU_BG_MATRIX',
		name: 'Código Matrix',
		description: 'Lluvia digital verde — estilo hacker.',
		preview: 'linear-gradient(180deg, #000a00 0%, #001a00 40%, #003300 80%, #000a00 100%)',
		css: 'linear-gradient(180deg, #000a00 0%, #001a00 40%, #003300 80%, #000a00 100%)',
		overlayCSS: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(47, 248, 1, 0.03) 2px, rgba(47, 248, 1, 0.03) 4px)',
	},
	{
		id: 'bg-inferno',
		skuId: 'SKU_BG_INFERNO',
		name: 'Infierno',
		description: 'Llamas oscuras y rojos profundos.',
		preview: 'linear-gradient(180deg, #1a0000 0%, #330000 30%, #4d0011 60%, #1a0000 100%)',
		css: 'linear-gradient(180deg, #1a0000 0%, #330000 30%, #4d0011 60%, #1a0000 100%)',
		overlayCSS: 'radial-gradient(ellipse at 50% 100%, rgba(233, 0, 54, 0.12) 0%, transparent 60%)',
	},
	{
		id: 'bg-arctic',
		skuId: 'SKU_BG_ARCTIC',
		name: 'Ártico',
		description: 'Tonos fríos de hielo y azul glaciar.',
		preview: 'linear-gradient(180deg, #0a0a1a 0%, #0d1b2a 30%, #1b3a4b 60%, #0a0a1a 100%)',
		css: 'linear-gradient(180deg, #0a0a1a 0%, #0d1b2a 30%, #1b3a4b 60%, #0a0a1a 100%)',
		overlayCSS: 'radial-gradient(ellipse at 50% 0%, rgba(100, 200, 255, 0.08) 0%, transparent 50%)',
	},
	{
		id: 'bg-gold',
		skuId: 'SKU_BG_GOLD',
		name: 'Dorado Élite',
		description: 'Elegancia dorada para los más exclusivos.',
		preview: 'linear-gradient(135deg, #1a1200 0%, #2d1f00 30%, #4d3800 60%, #1a1200 100%)',
		css: 'linear-gradient(135deg, #1a1200 0%, #2d1f00 30%, #4d3800 60%, #1a1200 100%)',
		overlayCSS: 'radial-gradient(ellipse at 50% 30%, rgba(255, 200, 50, 0.08) 0%, transparent 50%)',
	},
	{
		id: 'bg-neon-city',
		skuId: 'SKU_BG_NEON_CITY',
		name: 'Ciudad Neón',
		description: 'Luces de neón y cyberpunk nocturno.',
		preview: 'linear-gradient(180deg, #0a0010 0%, #1a002a 25%, #0a1020 50%, #00101a 75%, #0a0010 100%)',
		css: 'linear-gradient(180deg, #0a0010 0%, #1a002a 25%, #0a1020 50%, #00101a 75%, #0a0010 100%)',
		overlayCSS: 'radial-gradient(ellipse at 20% 80%, rgba(255, 0, 100, 0.08) 0%, transparent 40%), radial-gradient(ellipse at 80% 20%, rgba(0, 200, 255, 0.08) 0%, transparent 40%)',
	},
	{
		id: 'bg-aurora',
		skuId: 'SKU_BG_AURORA',
		name: 'Aurora Boreal',
		description: 'Las luces del norte en tu pantalla.',
		preview: 'linear-gradient(180deg, #000a10 0%, #001520 25%, #002a30 50%, #001a20 75%, #000a10 100%)',
		css: 'linear-gradient(180deg, #000a10 0%, #001520 25%, #002a30 50%, #001a20 75%, #000a10 100%)',
		overlayCSS: 'radial-gradient(ellipse at 30% 30%, rgba(0, 255, 150, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(100, 0, 255, 0.06) 0%, transparent 50%)',
	},
];

// ── Player Frames ─────────────────────────────────────────────

export const PLAYER_FRAMES: ShopPlayerFrame[] = [
	{
		id: 'frame-default',
		skuId: '',
		name: 'Estándar',
		description: 'El marco por defecto.',
		borderCSS: '',
	},
	{
		id: 'frame-holographic',
		skuId: 'SKU_FRAME_HOLO',
		name: 'Holográfico',
		description: 'Brillo holográfico arcoíris.',
		borderCSS: 'border: 1.5px solid transparent; background-image: linear-gradient(var(--color-surface-container), var(--color-surface-container)), linear-gradient(135deg, #ff0080, #7928ca, #00d4ff, #2ff801, #ff0080); background-origin: border-box; background-clip: padding-box, border-box;',
		glowCSS: 'box-shadow: 0 0 8px rgba(121, 40, 202, 0.3), 0 0 8px rgba(0, 212, 255, 0.2);',
	},
	{
		id: 'frame-fire',
		skuId: 'SKU_FRAME_FIRE',
		name: 'Fuego',
		description: 'Llamas ardientes rodeando tu nombre.',
		borderCSS: 'border: 1.5px solid #ff4500;',
		glowCSS: 'box-shadow: 0 0 8px rgba(255, 69, 0, 0.4), 0 0 16px rgba(255, 69, 0, 0.2);',
	},
	{
		id: 'frame-diamond',
		skuId: 'SKU_FRAME_DIAMOND',
		name: 'Diamante',
		description: 'Brillo de diamante puro.',
		borderCSS: 'border: 1.5px solid #b9f2ff;',
		glowCSS: 'box-shadow: 0 0 10px rgba(185, 242, 255, 0.4), 0 0 20px rgba(185, 242, 255, 0.15);',
	},
];

// ── Vote Effects ──────────────────────────────────────────────

export const VOTE_EFFECTS: ShopVoteEffect[] = [
	{
		id: 'vote-default',
		skuId: '',
		name: 'Estándar',
		description: 'Voto sin efecto especial.',
		emoji: '',
	},
	{
		id: 'vote-fire',
		skuId: 'SKU_VOTE_FIRE',
		name: 'Voto de Fuego',
		description: 'Tu voto va envuelto en llamas.',
		emoji: '🔥',
	},
	{
		id: 'vote-skull',
		skuId: 'SKU_VOTE_SKULL',
		name: 'Voto Mortal',
		description: 'Una calavera marca a tu sospechoso.',
		emoji: '💀',
	},
	{
		id: 'vote-star',
		skuId: 'SKU_VOTE_STAR',
		name: 'Voto Estelar',
		description: 'Estrellas brillantes acompañan tu voto.',
		emoji: '⭐',
	},
];

// ── Helpers ───────────────────────────────────────────────────

/** All purchasable backgrounds (excluding the default free one) */ 
export const PURCHASABLE_BACKGROUNDS = BACKGROUNDS.filter(b => b.skuId !== '');

/** All purchasable player frames (excluding default) */
export const PURCHASABLE_FRAMES = PLAYER_FRAMES.filter(f => f.skuId !== '');

/** All purchasable vote effects (excluding default) */
export const PURCHASABLE_EFFECTS = VOTE_EFFECTS.filter(e => e.skuId !== '');

/** Map item ID to SKU ID */
export const ITEM_BY_ID = new Map<string, { type: string; skuId: string }>([
	...BACKGROUNDS.filter(b => b.skuId).map(b => [b.id, { type: 'background', skuId: b.skuId }] as const),
	...PLAYER_FRAMES.filter(f => f.skuId).map(f => [f.id, { type: 'player-frame', skuId: f.skuId }] as const),
	...VOTE_EFFECTS.filter(e => e.skuId).map(e => [e.id, { type: 'vote-effect', skuId: e.skuId }] as const),
]);

/** Map SKU ID to item */
export const ITEM_BY_SKU = new Map<string, { id: string; type: string }>([
	...BACKGROUNDS.filter(b => b.skuId).map(b => [b.skuId, { id: b.id, type: 'background' }] as const),
	...PLAYER_FRAMES.filter(f => f.skuId).map(f => [f.skuId, { id: f.id, type: 'player-frame' }] as const),
	...VOTE_EFFECTS.filter(e => e.skuId).map(e => [e.skuId, { id: e.id, type: 'vote-effect' }] as const),
]);
