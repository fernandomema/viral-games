<script lang="ts">
	import { goto } from '$app/navigation';
	import { getActiveGame, clearActiveGame } from '$lib/active-game';
	import { GAMES } from '$lib/games/registry';
	import { t, getLocale, setLocale, SUPPORTED_LOCALES, LOCALE_LABELS } from '$lib/i18n';
	import type { Locale } from '$lib/i18n';

	let titleEls: HTMLElement[] = [];
	let iconEls: HTMLElement[] = [];

	// Restore hero names when navigating back from a game page
	$effect(() => {
		const id = getActiveGame();
		if (id) {
			titleEls.forEach(el => { if (el) el.style.viewTransitionName = ''; });
			iconEls.forEach(el => { if (el) el.style.viewTransitionName = ''; });
			const i = GAMES.findIndex(g => g.id === id);
			if (i >= 0) {
				if (titleEls[i]) titleEls[i].style.viewTransitionName = 'game-title';
				if (iconEls[i]) iconEls[i].style.viewTransitionName = 'game-icon';
			}
			clearActiveGame();
		}
	});

	function navigateTo(e: MouseEvent, href: string, index: number) {
		e.preventDefault();
		titleEls.forEach(el => { if (el) el.style.viewTransitionName = ''; });
		iconEls.forEach(el => { if (el) el.style.viewTransitionName = ''; });
		if (titleEls[index]) titleEls[index].style.viewTransitionName = 'game-title';
		if (iconEls[index]) iconEls[index].style.viewTransitionName = 'game-icon';
		goto(href);
	}

	function toggleLocale() {
		const current = getLocale();
		const i = SUPPORTED_LOCALES.indexOf(current);
		const next = SUPPORTED_LOCALES[(i + 1) % SUPPORTED_LOCALES.length];
		setLocale(next);
	}

	function getOnlineHref(game: typeof GAMES[0]): string | null {
		if (!game.onlineEnabled) return null;
		if (game.id === 'basta') return '/basta';
		return `/online/${game.id}`;
	}

	function getLocalHref(game: typeof GAMES[0]): string | null {
		if (!game.localEnabled) return null;
		if (game.externalUrl) return game.externalUrl;
		return `/${game.id}`;
	}
</script>

<div class="min-h-screen bg-background">

	<!-- ═══ Fondo ═══ -->
	<div class="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true" style="view-transition-name: bg-orbs">
		<div class="absolute inset-0 grid-bg"></div>
		<div class="orb-a absolute -top-48 -left-48 w-150 h-150 rounded-full bg-primary-dim opacity-[0.22] blur-[160px]"></div>
		<div class="orb-b absolute bottom-0 -right-32 w-125 h-125 rounded-full bg-secondary opacity-[0.13] blur-[140px]"></div>
		<div class="orb-c absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-150 h-150 rounded-full bg-primary opacity-[0.07] blur-[180px]"></div>
	</div>

	<!-- ═══ Top App Bar ═══ -->
	<div class="sticky top-0 z-30" style="background: rgba(14,14,19,0.82); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px)">
		<header class="flex items-center justify-between px-5 h-14 border-b border-white/8">
			<div class="flex items-center gap-2">
				<span class="iconify material-symbols--sports-esports text-primary text-xl"></span>
				<span class="font-headline font-black text-base tracking-tighter text-on-surface">VIRAL GAMES</span>
			</div>
			<div class="flex items-center gap-3">
				<button
					onclick={toggleLocale}
					class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high border border-outline-variant/30 hover:bg-surface-container-highest transition-colors"
					title="Change language"
				>
					<span class="iconify material-symbols--language text-on-surface-variant text-sm"></span>
					<span class="font-label text-on-surface-variant text-[10px] tracking-widest uppercase">{getLocale().toUpperCase()}</span>
				</button>
				<div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/25">
					<span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
					<span class="font-label text-secondary text-[10px] tracking-widest uppercase">{GAMES.length} {t('home.modes')}</span>
				</div>
			</div>
		</header>
	</div>

	<!-- ═══ Hero ═══ -->
	<div class="relative z-10 px-5 pt-10 pb-6 text-center">
		<div class="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 mb-4">
			<span class="iconify material-symbols--sports-esports text-primary text-sm"></span>
			<span class="font-label text-primary text-[10px] tracking-widest uppercase font-bold">{t('home.meta')}</span>
		</div>
		<h1 class="font-headline font-black leading-none tracking-tighter text-on-surface text-5xl lg:text-6xl neon-glow-primary mb-3">
			{@html t('home.chooseMode').replace(t('home.mode'), `<span class="text-primary">${t('home.mode')}</span>`)}
		</h1>
		<p class="text-on-surface-variant text-sm max-w-md mx-auto">{t('home.meta')}</p>
	</div>

	<!-- ═══ Cards ═══ -->
	<main class="relative z-10 max-w-5xl mx-auto px-4 pb-28 pt-2">
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
			{#each GAMES as game, i}
				{@const onlineHref = getOnlineHref(game)}
				{@const localHref = getLocalHref(game)}
				<div class="game-card group relative overflow-hidden rounded-2xl liquid-card {game.borderClass} flex flex-col">
					<!-- Glow interior en hover -->
					<div
						class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
						style="background: radial-gradient(ellipse at 50% -20%, {game.hoverGlow} 0%, transparent 65%)"
					></div>

					<!-- Barra superior de color -->
					<div class="h-1 w-full flex-none" style={game.barStyle}></div>

					<!-- Cuerpo -->
					<div class="relative flex-1 flex flex-col gap-4 p-5">
						<!-- Número + Icono -->
						<div class="flex items-start justify-between">
							<span class="font-headline text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/30 mt-1">{game.num}</span>
							<div bind:this={iconEls[i]} class="icon-box w-16 h-16 rounded-xl liquid-card {game.borderClass} flex items-center justify-center">
								<span class="iconify {game.icon} {game.iconColorClass} text-4xl"></span>
							</div>
						</div>

						<!-- Texto -->
						<div class="flex-1">
							<h2 bind:this={titleEls[i]} class="font-headline font-black text-xl leading-tight text-on-surface mb-2">{@html game.cardTitleHtml}</h2>
							<p class="font-body text-xs text-on-surface-variant leading-relaxed">{t(`game.${game.id}.description`)}</p>
						</div>

						<!-- Tipo badge -->
						<div class="flex items-center gap-2">
							{#if game.type === 'guess'}
								<span class="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest">1 jugador</span>
							{:else if game.type === 'basta' || game.type === 'external'}
								<span class="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">2+ {getLocale() === 'en' ? 'players' : 'jugadores'}</span>
							{:else}
								<span class="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">{t('home.players')}</span>
							{/if}
						</div>

						<!-- Botones Local / Online -->
						<div class="flex gap-2 pt-2 border-t border-white/8">
							{#if localHref}
								{#if game.externalUrl}
									<a
										href={localHref}
										target="_blank"
										rel="noopener"
										class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl {game.badgeClass} text-xs font-black uppercase tracking-widest transition-all active:scale-95 hover:brightness-110"
									>
										<span class="iconify material-symbols--open-in-new text-sm"></span>
										{t('home.play')}
									</a>
								{:else}
									<a
										href={localHref}
										onclick={(e) => navigateTo(e, localHref, i)}
										class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl {game.badgeClass} text-xs font-black uppercase tracking-widest transition-all active:scale-95 hover:brightness-110"
									>
										<span class="iconify material-symbols--smartphone text-sm"></span>
										Local
									</a>
								{/if}
							{/if}
							{#if onlineHref}
								<a
									href={onlineHref}
									class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl {localHref ? 'bg-surface-container-high border border-outline-variant/20 text-on-surface' : game.badgeClass} text-xs font-black uppercase tracking-widest transition-all active:scale-95 hover:bg-surface-container-highest"
								>
									<span class="iconify material-symbols--wifi text-secondary text-sm"></span>
									Online
								</a>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Stats -->
		<div class="mt-10 flex items-center justify-center">
			<div class="inline-flex items-center gap-5 px-6 py-3 rounded-2xl liquid-card border border-white/8">
				<div class="flex items-center gap-2">
					<span class="iconify material-symbols--group text-primary text-sm"></span>
					<span class="font-label text-xs text-on-surface-variant">{t('home.players')}</span>
				</div>
				<div class="w-px h-4 bg-white/10"></div>
				<div class="flex items-center gap-2">
					<span class="iconify material-symbols--wifi text-secondary text-sm"></span>
					<span class="font-label text-xs text-on-surface-variant">{t('home.offline')}</span>
				</div>
			</div>
		</div>
	</main>
</div>

<style>
	.grid-bg {
		background-image:
			linear-gradient(rgba(202, 152, 255, 0.05) 1px, transparent 1px),
			linear-gradient(90deg, rgba(202, 152, 255, 0.05) 1px, transparent 1px);
		background-size: 56px 56px;
	}

	.liquid-card {
		background: rgba(30, 30, 38, 0.55);
		backdrop-filter: blur(28px) saturate(160%);
		-webkit-backdrop-filter: blur(28px) saturate(160%);
	}

	@keyframes orb-breathe {
		0%, 100% { transform: scale(1); }
		50%       { transform: scale(1.12); }
	}
	.orb-a { animation: orb-breathe 10s ease-in-out infinite; }
	.orb-b { animation: orb-breathe 14s ease-in-out infinite 4s; }

	.game-card {
		transition: transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 280ms ease;
	}
	.game-card:hover  { transform: translateY(-6px) scale(1.02); }
	.game-card:active { transform: scale(0.96); transition-duration: 100ms; }

	.icon-box {
		transition: transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	.game-card:hover .icon-box {
		transform: scale(1.1) rotate(-5deg);
	}
</style>
