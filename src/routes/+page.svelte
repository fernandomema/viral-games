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
			// Clear any residual names first (avoid duplicate view-transition-name)
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
		// Clear previous names before assigning to avoid duplicates
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
</script>

<div class="min-h-screen bg-background">

	<!-- ═══ Fondo (fixed para no interferir con sticky) ═══ -->
	<div class="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true" style="view-transition-name: bg-orbs">
		<div class="absolute inset-0 grid-bg"></div>
		<div class="orb-a absolute -top-48 -left-48 w-150 h-150 rounded-full bg-primary-dim opacity-[0.22] blur-[160px]"></div>
		<div class="orb-b absolute bottom-0 -right-32 w-125 h-125 rounded-full bg-secondary opacity-[0.13] blur-[140px]"></div>
		<div class="orb-c absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-150 h-150 rounded-full bg-primary opacity-[0.07] blur-[180px]"></div>
	</div>

	<!-- ═══ Top App Bar (sticky, frosted) ═══ -->
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

	<!-- ═══ Hero sticky transparente ═══ -->
	<div class="sticky top-14 z-20 px-5 py-4 text-center">
		<h1 class="font-headline font-black leading-none tracking-tighter text-on-surface text-4xl lg:text-5xl neon-glow-primary">
			{@html t('home.chooseMode').replace(t('home.mode'), `<span class="text-primary">${t('home.mode')}</span>`)}
		</h1>
	</div>

	<!-- ═══ Cards ═══ -->
	<main class="relative z-10 max-w-4xl mx-auto px-4 pb-28 pt-4">
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			{#each GAMES as game, i}
				<a
					href="/{game.id}"
					onclick={(e) => navigateTo(e, `/${game.id}`, i)}
					class="game-card group relative overflow-hidden rounded-2xl liquid-card {game.borderClass} flex flex-col cursor-pointer"
				>
					<!-- Glow interior en hover -->
					<div
						class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
						style="background: radial-gradient(ellipse at 50% -20%, {game.hoverGlow} 0%, transparent 65%)"
					></div>

					<!-- Barra superior de color -->
					<div class="h-0.75 w-full flex-none" style={game.barStyle}></div>

					<!-- Cuerpo -->
					<div class="relative flex-1 flex flex-col gap-4 p-5">
						<!-- Número + Icono -->
						<div class="flex items-start justify-between">
							<span class="font-headline text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/30 mt-1">{game.num}</span>
							<div bind:this={iconEls[i]} class="icon-box w-14 h-14 rounded-xl liquid-card {game.borderClass} flex items-center justify-center">
								<span
									class="iconify {game.icon} {game.iconColorClass} text-3xl"
								></span>
							</div>
						</div>

						<!-- Texto -->
						<div class="flex-1">
							<h2 bind:this={titleEls[i]} class="font-headline font-black text-xl leading-tight text-on-surface mb-1.5">{@html game.cardTitleHtml}</h2>
							<p class="font-body text-xs text-on-surface-variant leading-relaxed">{t(`game.${game.id}.description`)}</p>
						</div>

						<!-- CTA -->
						<div class="flex items-center justify-between border-t border-white/8 pt-4">
							<span class="px-3 py-1 rounded-full {game.badgeClass} text-[10px] font-black uppercase tracking-widest">
								{t('home.play')}
							</span>
							<span class="iconify material-symbols--arrow-forward {game.iconColorClass} text-lg opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
							</span>
						</div>
					</div>
				</a>
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
