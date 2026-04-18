<script lang="ts">
	import type { GameDef } from '$lib/games/registry';
	import { t, getLocale } from '$lib/i18n';

	let { game, index, onNavigate, titleEl = $bindable<HTMLElement | undefined>(undefined), iconEl = $bindable<HTMLElement | undefined>(undefined), featured = false }: {
		game: GameDef;
		index: number;
		onNavigate: (e: MouseEvent, href: string, index: number) => void;
		titleEl?: HTMLElement;
		iconEl?: HTMLElement;
		featured?: boolean;
	} = $props();

	// V3-style card patterns & colors per game id
	const CARD_STYLES: Record<string, string> = {
		impostor: `
			--ca-glow:rgba(192,132,252,.28);--ca-glow2:rgba(139,92,246,.2);
			--ca-border:rgba(192,132,252,.32);--ca-border-hi:rgba(192,132,252,.55);
			--ca-icon-bg:rgba(192,132,252,.15);--ca-icon-border:rgba(192,132,252,.28);
			--ca-tag:#c084fc;--ca-tag-bg:rgba(192,132,252,.12);--ca-tag-border:rgba(192,132,252,.25);
			--ca-btn-bg:rgba(192,132,252,.2);--ca-btn-border:rgba(192,132,252,.35);
			--pat-size:40px 40px;--pat-opacity:.5;
			--pat-url:url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='rgba(192,132,252,0.28)' stroke-width='1'%3E%3Cpolygon points='20,3 37,20 20,37 3,20'/%3E%3C/g%3E%3Cg fill='none' stroke='rgba(192,132,252,0.12)' stroke-width='0.8'%3E%3Cpolygon points='20,10 30,20 20,30 10,20'/%3E%3C/g%3E%3C/svg%3E")
		`,
		'impostor-draw': `
			--ca-glow:rgba(74,222,128,.25);--ca-glow2:rgba(16,185,129,.18);
			--ca-border:rgba(74,222,128,.28);--ca-border-hi:rgba(74,222,128,.5);
			--ca-icon-bg:rgba(74,222,128,.14);--ca-icon-border:rgba(74,222,128,.25);
			--ca-tag:#4ade80;--ca-tag-bg:rgba(74,222,128,.1);--ca-tag-border:rgba(74,222,128,.22);
			--ca-btn-bg:rgba(74,222,128,.18);--ca-btn-border:rgba(74,222,128,.3);
			--pat-size:28px 28px;--pat-opacity:.55;
			--pat-url:url("data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='rgba(74,222,128,0.25)' stroke-width='0.8' fill='none'%3E%3Cline x1='0' y1='14' x2='28' y2='14'/%3E%3Cline x1='14' y1='0' x2='14' y2='28'/%3E%3C/g%3E%3Ccircle cx='14' cy='14' r='4' stroke='rgba(74,222,128,0.18)' stroke-width='0.8' fill='none'/%3E%3Ccircle cx='14' cy='14' r='1.5' fill='rgba(74,222,128,0.2)'/%3E%3C/svg%3E")
		`,
		'impostor-datos': `
			--ca-glow:rgba(74,222,128,.25);--ca-glow2:rgba(16,185,129,.18);
			--ca-border:rgba(74,222,128,.28);--ca-border-hi:rgba(74,222,128,.5);
			--ca-icon-bg:rgba(74,222,128,.14);--ca-icon-border:rgba(74,222,128,.25);
			--ca-tag:#4ade80;--ca-tag-bg:rgba(74,222,128,.1);--ca-tag-border:rgba(74,222,128,.22);
			--ca-btn-bg:rgba(74,222,128,.18);--ca-btn-border:rgba(74,222,128,.3);
			--pat-size:32px 32px;--pat-opacity:.5;
			--pat-url:url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='rgba(74,222,128,0.22)'%3E%3Crect x='3' y='18' width='5' height='11' rx='1.5'/%3E%3Crect x='11' y='11' width='5' height='18' rx='1.5'/%3E%3Crect x='19' y='6' width='5' height='23' rx='1.5'/%3E%3C/g%3E%3Cline x1='1' y1='31' x2='31' y2='31' stroke='rgba(74,222,128,0.15)' stroke-width='0.8'/%3E%3C/svg%3E")
		`,
		basta: `
			--ca-glow:rgba(251,191,36,.25);--ca-glow2:rgba(245,158,11,.18);
			--ca-border:rgba(251,191,36,.28);--ca-border-hi:rgba(251,191,36,.5);
			--ca-icon-bg:rgba(251,191,36,.13);--ca-icon-border:rgba(251,191,36,.25);
			--ca-tag:#fbbf24;--ca-tag-bg:rgba(251,191,36,.1);--ca-tag-border:rgba(251,191,36,.22);
			--ca-btn-bg:rgba(251,191,36,.18);--ca-btn-border:rgba(251,191,36,.3);
			--pat-size:32px 20px;--pat-opacity:.55;
			--pat-url:url("data:image/svg+xml,%3Csvg width='32' height='20' viewBox='0 0 32 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='0,10 8,2 16,10 24,2 32,10' fill='none' stroke='rgba(251,191,36,0.3)' stroke-width='1.5' stroke-linejoin='round' stroke-linecap='round'/%3E%3Cpolyline points='0,20 8,12 16,20 24,12 32,20' fill='none' stroke='rgba(251,191,36,0.14)' stroke-width='1.5' stroke-linejoin='round' stroke-linecap='round'/%3E%3C/svg%3E")
		`,
		'palabra-oculta': `
			--ca-glow:rgba(34,211,238,.25);--ca-glow2:rgba(6,182,212,.18);
			--ca-border:rgba(34,211,238,.28);--ca-border-hi:rgba(34,211,238,.5);
			--ca-icon-bg:rgba(34,211,238,.13);--ca-icon-border:rgba(34,211,238,.25);
			--ca-tag:#22d3ee;--ca-tag-bg:rgba(34,211,238,.1);--ca-tag-border:rgba(34,211,238,.22);
			--ca-btn-bg:rgba(34,211,238,.18);--ca-btn-border:rgba(34,211,238,.3);
			--pat-size:34px 40px;--pat-opacity:.5;
			--pat-url:url("data:image/svg+xml,%3Csvg width='34' height='40' viewBox='0 0 34 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='rgba(34,211,238,0.26)' stroke-width='1'%3E%3Cpolygon points='17,2 31,10 31,26 17,34 3,26 3,10'/%3E%3C/g%3E%3C/svg%3E")
		`,
		'tragos-locos': `
			--ca-glow:rgba(251,146,60,.25);--ca-glow2:rgba(234,88,12,.18);
			--ca-border:rgba(251,146,60,.28);--ca-border-hi:rgba(251,146,60,.5);
			--ca-icon-bg:rgba(251,146,60,.13);--ca-icon-border:rgba(251,146,60,.25);
			--ca-tag:#fb923c;--ca-tag-bg:rgba(251,146,60,.1);--ca-tag-border:rgba(251,146,60,.22);
			--ca-btn-bg:rgba(251,146,60,.18);--ca-btn-border:rgba(251,146,60,.3);
			--pat-size:36px 36px;--pat-opacity:.45;
			--pat-url:url("data:image/svg+xml,%3Csvg width='36' height='36' viewBox='0 0 36 36' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='rgba(251,146,60,0.25)' stroke-width='1'%3E%3Ccircle cx='18' cy='18' r='10'/%3E%3Ccircle cx='18' cy='18' r='4'/%3E%3C/g%3E%3C/svg%3E")
		`,
		'crossword': `
			--ca-glow:rgba(56,189,248,.25);--ca-glow2:rgba(14,165,233,.18);
			--ca-border:rgba(56,189,248,.28);--ca-border-hi:rgba(56,189,248,.5);
			--ca-icon-bg:rgba(56,189,248,.13);--ca-icon-border:rgba(56,189,248,.25);
			--ca-tag:#38bdf8;--ca-tag-bg:rgba(56,189,248,.1);--ca-tag-border:rgba(56,189,248,.22);
			--ca-btn-bg:rgba(56,189,248,.18);--ca-btn-border:rgba(56,189,248,.3);
			--pat-size:32px 32px;--pat-opacity:.45;
			--pat-url:url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='2' y='2' width='12' height='12' fill='rgba(56,189,248,0.15)' rx='1'/%3E%3Crect x='18' y='18' width='12' height='12' fill='rgba(56,189,248,0.15)' rx='1'/%3E%3Crect x='2' y='18' width='12' height='12' fill='none' stroke='rgba(56,189,248,0.12)' rx='1'/%3E%3Crect x='18' y='2' width='12' height='12' fill='none' stroke='rgba(56,189,248,0.12)' rx='1'/%3E%3C/svg%3E")
		`,
	};

	function getOnlineHref(): string | null {
		if (!game.onlineEnabled) return null;
		if (game.id === 'basta') return '/basta';
		if (game.id === 'crossword') return '/crossword?mode=online';
		return `/online/${game.id}`;
	}

	function getLocalHref(): string | null {
		if (!game.localEnabled) return null;
		if (game.externalUrl) return game.externalUrl;
		if (game.id === 'crossword') return '/crossword?mode=local';
		return `/${game.id}`;
	}

	function getPlayersBadge(): string {
		if (game.type === 'guess') return getLocale() === 'en' ? '1 player' : '1 jugador';
		if (game.type === 'basta' || game.type === 'external' || game.type === 'crossword') return `2+ ${getLocale() === 'en' ? 'players' : 'jugadores'}`;
		return t('home.players');
	}

	function getPlayersBadgeClass(): string {
		if (game.type === 'guess') return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
		return 'bg-[var(--ca-tag-bg)] border-[var(--ca-tag-border)] text-[var(--ca-tag)]';
	}

	let localHref = $derived(getLocalHref());
	let onlineHref = $derived(getOnlineHref());
	let cardStyle = $derived(CARD_STYLES[game.id] || '');
</script>

<div class="gc group relative overflow-hidden rounded-2xl cursor-pointer" style={cardStyle}>
	<!-- Base bg -->
	<div class="absolute inset-0 z-0 bg-(--surface,rgba(30,30,38,0.55))" style="backdrop-filter:blur(28px) saturate(160%);-webkit-backdrop-filter:blur(28px) saturate(160%)"></div>

	<!-- Pattern layer -->
	<div class="c-pattern absolute inset-0 z-1 pointer-events-none"></div>

	<!-- Color tint glow -->
	<div class="c-tint absolute inset-0 z-2 pointer-events-none"></div>

	<!-- Popular badge -->
	{#if index === 0}
		<span class="absolute top-3 right-3 z-10 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest" style="background:var(--ca-tag);color:#1a0040">⭐ Popular</span>
	{/if}

	<!-- Content -->
	<div class="relative z-3 p-5 flex flex-col gap-3">
		<!-- Num + Icon -->
		<div class="flex items-start justify-between">
			<span class="font-headline text-[10px] font-bold tracking-[0.2em] opacity-30 mt-1">{game.num}</span>
			<div bind:this={iconEl} class="icon-w w-14 h-14 rounded-xl flex items-center justify-center" style="background:var(--ca-icon-bg);border:1px solid var(--ca-icon-border)">
				<span class="iconify {game.icon} text-3xl" style="color:var(--ca-tag)"></span>
			</div>
		</div>

		<!-- Tag -->
		<span class="self-start text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full" style="color:var(--ca-tag);background:var(--ca-tag-bg);border:1px solid var(--ca-tag-border)">
			{getPlayersBadge()}
		</span>

		<!-- Title + desc -->
		<div>
			<h2 bind:this={titleEl} class="font-headline font-black text-xl leading-tight text-on-surface mb-1">{@html game.cardTitleHtml}</h2>
			<p class="text-on-surface-variant text-xs leading-relaxed">{t(`game.${game.id}.description`)}</p>
		</div>

		<!-- Action buttons -->
		<div class="flex gap-2 pt-2 border-t border-white/8 mt-auto">
			{#if localHref}
				{#if game.externalUrl}
					<a
						href={localHref}
						target="_blank"
						rel="noopener"
						class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
						style="background:var(--ca-btn-bg);border:1px solid var(--ca-btn-border);color:var(--ca-tag)"
					>
						<span class="iconify material-symbols--open-in-new text-sm"></span>
						{t('home.play')}
					</a>
				{:else}
					<a
						href={localHref}
						onclick={(e) => onNavigate(e, localHref!, index)}
						class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
						style="background:var(--ca-btn-bg);border:1px solid var(--ca-btn-border);color:var(--ca-tag)"
					>
						<span class="iconify material-symbols--smartphone text-sm"></span>
						Local
					</a>
				{/if}
			{/if}
			{#if onlineHref}
				<a
					href={onlineHref}
					class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 {localHref ? 'bg-white/5 border border-white/10 text-on-surface-variant' : ''}"
					style={!localHref ? `background:var(--ca-btn-bg);border:1px solid var(--ca-btn-border);color:var(--ca-tag)` : ''}
				>
					<span class="iconify material-symbols--wifi text-sm"></span>
					Online
				</a>
			{/if}
		</div>
	</div>
</div>

<style>
	.gc {
		border: 1px solid var(--ca-border, rgba(255,255,255,0.07));
		box-shadow: 0 8px 32px var(--ca-glow, rgba(0,0,0,.3));
		transition: transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 280ms ease, border-color 280ms ease;
	}

	@media (hover: hover) {
		.gc:hover {
			transform: translateY(-5px) scale(1.015);
			border-color: var(--ca-border-hi, rgba(255,255,255,0.13));
			box-shadow: 0 20px 56px var(--ca-glow, rgba(0,0,0,.35)), 0 0 0 1px var(--ca-border, transparent);
		}
		.gc:active { transform: scale(0.97); transition-duration: 100ms; }
		.gc:hover .c-pattern { opacity: 1; }
		.gc:hover .c-tint { opacity: 1; }
		.gc:hover .icon-w { transform: scale(1.12) rotate(-6deg); }
	}

	@media (hover: none) {
		.gc:active { transform: scale(0.97); transition-duration: 100ms; }
	}

	.c-pattern {
		background-image: var(--pat-url);
		background-size: var(--pat-size, 48px 48px);
		background-repeat: repeat;
		opacity: var(--pat-opacity, .55);
		transition: opacity 300ms ease;
	}

	.c-tint {
		background:
			radial-gradient(ellipse 100% 60% at 100% 100%, var(--ca-glow, transparent) 0%, transparent 65%),
			radial-gradient(ellipse 70% 50% at 0% 0%, var(--ca-glow2, transparent) 0%, transparent 60%);
		opacity: .6;
		transition: opacity 300ms ease;
	}

	.icon-w {
		transition: transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}
</style>
