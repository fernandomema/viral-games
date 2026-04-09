/**
 * Shop item catalog — backgrounds, player frames, and vote effects.
 * SKU IDs are placeholders until created in Discord Developer Portal.
 * Set real SKU IDs after creating them at:
 *   https://discord.com/developers/applications/<APP_ID>/skus
 */

import type { ShopBackground, ShopPlayerFrame, ShopVoteEffect, ShopSound, ShopBadge, ShopEmote, ShopRevealEffect } from './types';

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

// ── Sounds ────────────────────────────────────────────────────

export const SOUNDS: ShopSound[] = [
	{
		id: 'sound-laugh',
		skuId: 'SKU_SOUND_LAUGH',
		name: 'Risa',
		description: '¡Una carcajada para momentos divertidos!',
		emoji: '😂',
		src: '/audio/laugh.mp3',
	},
	{
		id: 'sound-suspense',
		skuId: 'SKU_SOUND_SUSPENSE',
		name: 'Suspenso',
		description: 'Tensión dramática al máximo.',
		emoji: '😰',
		src: '/audio/suspense.mp3',
	},
	{
		id: 'sound-airhorn',
		skuId: 'SKU_SOUND_AIRHORN',
		name: 'Bocina',
		description: 'El clásico airhorn para celebrar.',
		emoji: '📯',
		src: '/audio/airhorn.mp3',
	},
	{
		id: 'sound-bruh',
		skuId: 'SKU_SOUND_BRUH',
		name: 'Bruh',
		description: 'Para momentos de incredulidad.',
		emoji: '😐',
		src: '/audio/bruh.mp3',
	},
	{
		id: 'sound-clap',
		skuId: 'SKU_SOUND_CLAP',
		name: 'Aplausos',
		description: 'Un aplauso por buen juego.',
		emoji: '👏',
		src: '/audio/clap.mp3',
	},
	{
		id: 'sound-sad',
		skuId: 'SKU_SOUND_SAD',
		name: 'Triste',
		description: 'Violín triste para la derrota.',
		emoji: '🎻',
		src: '/audio/sad.mp3',
	},
];

// ── Badges ────────────────────────────────────────────────────

export const BADGES: ShopBadge[] = [
	{
		id: 'badge-default',
		skuId: '',
		name: 'Sin Título',
		description: 'Sin título visible.',
		label: '',
		color: '',
	},
	{
		id: 'badge-detective',
		skuId: 'SKU_BADGE_DETECTIVE',
		name: 'Detective Pro',
		description: 'Siempre descubres al impostor.',
		label: 'Detective Pro',
		color: '#60a5fa',
		icon: 'material-symbols--detective',
	},
	{
		id: 'badge-liar',
		skuId: 'SKU_BADGE_LIAR',
		name: 'Mentiroso Nato',
		description: 'Nadie descubre tus mentiras.',
		label: 'Mentiroso Nato',
		color: '#f87171',
		icon: 'material-symbols--theater-comedy',
	},
	{
		id: 'badge-vip',
		skuId: 'SKU_BADGE_VIP',
		name: 'VIP',
		description: 'Estatus exclusivo de jugador premium.',
		label: 'VIP',
		color: '#fbbf24',
		icon: 'material-symbols--star',
	},
	{
		id: 'badge-ghost',
		skuId: 'SKU_BADGE_GHOST',
		name: 'Fantasma',
		description: 'Sigiloso como un fantasma.',
		label: 'Fantasma',
		color: '#a78bfa',
		icon: 'material-symbols--ghost',
	},
	{
		id: 'badge-crown',
		skuId: 'SKU_BADGE_CROWN',
		name: 'Rey del Juego',
		description: 'La corona del mejor jugador.',
		label: 'Rey del Juego',
		color: '#f59e0b',
		icon: 'material-symbols--crown',
	},
];

// ── Emotes ────────────────────────────────────────────────────

export const EMOTES: ShopEmote[] = [
	{
		id: 'emote-sus',
		skuId: 'SKU_EMOTE_SUS',
		name: 'Sospechoso',
		description: 'Hmm... muy sospechoso.',
		emoji: '🤨',
	},
	{
		id: 'emote-think',
		skuId: 'SKU_EMOTE_THINK',
		name: 'Pensando',
		description: 'Déjame pensarlo...',
		emoji: '🤔',
	},
	{
		id: 'emote-skull',
		skuId: 'SKU_EMOTE_SKULL',
		name: 'Muerto',
		description: 'Me muero de la risa.',
		emoji: '💀',
	},
	{
		id: 'emote-fire',
		skuId: 'SKU_EMOTE_FIRE',
		name: 'Fuego',
		description: '¡Qué jugada tan buena!',
		emoji: '🔥',
	},
	{
		id: 'emote-cap',
		skuId: 'SKU_EMOTE_CAP',
		name: 'Mentira',
		description: '¡Eso es mentira!',
		emoji: '🧢',
	},
	{
		id: 'emote-clown',
		skuId: 'SKU_EMOTE_CLOWN',
		name: 'Payaso',
		description: '¿De verdad hiciste eso?',
		emoji: '🤡',
	},
];

// ── Reveal Effects ────────────────────────────────────────────

export const REVEAL_EFFECTS: ShopRevealEffect[] = [
	{
		id: 'reveal-default',
		skuId: '',
		name: 'Estándar',
		description: 'Revelación sin efecto especial.',
		emoji: '',
		animation: '',
	},
	{
		id: 'reveal-confetti',
		skuId: 'SKU_REVEAL_CONFETTI',
		name: 'Confeti',
		description: 'Lluvia de confeti al revelar.',
		emoji: '🎉',
		animation: 'confetti',
	},
	{
		id: 'reveal-explosion',
		skuId: 'SKU_REVEAL_EXPLOSION',
		name: 'Explosión',
		description: 'Explosión dramática de revelación.',
		emoji: '💥',
		animation: 'explosion',
	},
	{
		id: 'reveal-spotlight',
		skuId: 'SKU_REVEAL_SPOTLIGHT',
		name: 'Spotlight',
		description: 'Un foco de luz sobre el impostor.',
		emoji: '🔦',
		animation: 'spotlight',
	},
	{
		id: 'reveal-glitch',
		skuId: 'SKU_REVEAL_GLITCH',
		name: 'Glitch',
		description: 'Distorsión digital al revelar.',
		emoji: '📺',
		animation: 'glitch',
	},
];

// ── Helpers ───────────────────────────────────────────────────

/** All purchasable backgrounds (excluding the default free one) */ 
export const PURCHASABLE_BACKGROUNDS = BACKGROUNDS.filter(b => b.skuId !== '');

/** All purchasable player frames (excluding default) */
export const PURCHASABLE_FRAMES = PLAYER_FRAMES.filter(f => f.skuId !== '');

/** All purchasable vote effects (excluding default) */
export const PURCHASABLE_EFFECTS = VOTE_EFFECTS.filter(e => e.skuId !== '');

/** All sounds (all are purchasable) */
export const PURCHASABLE_SOUNDS = SOUNDS.filter(s => s.skuId !== '');

/** All purchasable badges (excluding default) */
export const PURCHASABLE_BADGES = BADGES.filter(b => b.skuId !== '');

/** All emotes (all are purchasable) */
export const PURCHASABLE_EMOTES = EMOTES.filter(e => e.skuId !== '');

/** All purchasable reveal effects (excluding default) */
export const PURCHASABLE_REVEAL_EFFECTS = REVEAL_EFFECTS.filter(r => r.skuId !== '');

/** Map item ID to SKU ID */
export const ITEM_BY_ID = new Map<string, { type: string; skuId: string }>([
	...BACKGROUNDS.filter(b => b.skuId).map(b => [b.id, { type: 'background', skuId: b.skuId }] as const),
	...PLAYER_FRAMES.filter(f => f.skuId).map(f => [f.id, { type: 'player-frame', skuId: f.skuId }] as const),
	...VOTE_EFFECTS.filter(e => e.skuId).map(e => [e.id, { type: 'vote-effect', skuId: e.skuId }] as const),
	...SOUNDS.filter(s => s.skuId).map(s => [s.id, { type: 'sound', skuId: s.skuId }] as const),
	...BADGES.filter(b => b.skuId).map(b => [b.id, { type: 'badge', skuId: b.skuId }] as const),
	...EMOTES.filter(e => e.skuId).map(e => [e.id, { type: 'emote', skuId: e.skuId }] as const),
	...REVEAL_EFFECTS.filter(r => r.skuId).map(r => [r.id, { type: 'reveal-effect', skuId: r.skuId }] as const),
]);

/** Map SKU ID to item */
export const ITEM_BY_SKU = new Map<string, { id: string; type: string }>([
	...BACKGROUNDS.filter(b => b.skuId).map(b => [b.skuId, { id: b.id, type: 'background' }] as const),
	...PLAYER_FRAMES.filter(f => f.skuId).map(f => [f.skuId, { id: f.id, type: 'player-frame' }] as const),
	...VOTE_EFFECTS.filter(e => e.skuId).map(e => [e.skuId, { id: e.id, type: 'vote-effect' }] as const),
	...SOUNDS.filter(s => s.skuId).map(s => [s.skuId, { id: s.id, type: 'sound' }] as const),
	...BADGES.filter(b => b.skuId).map(b => [b.skuId, { id: b.id, type: 'badge' }] as const),
	...EMOTES.filter(e => e.skuId).map(e => [e.skuId, { id: e.id, type: 'emote' }] as const),
	...REVEAL_EFFECTS.filter(r => r.skuId).map(r => [r.skuId, { id: r.id, type: 'reveal-effect' }] as const),
]);
