<script lang="ts">
	import { goto } from '$app/navigation';
	import { getActiveGame, clearActiveGame } from '$lib/active-game';
	import { GAMES } from '$lib/games/registry';
	import { t, getLocale, setLocale, SUPPORTED_LOCALES } from '$lib/i18n';
	import type { Locale } from '$lib/i18n';
	import GameCard from '$lib/components/GameCard.svelte';
	import JsonLd from '$lib/components/JsonLd.svelte';
	import { organizationSchema, webApplicationSchema, faqSchema } from '$lib/games/schemas';

	const homeFaqs = [
		{ question: '¿Qué es Viral Games?', answer: 'Viral Games es una plataforma gratuita de juegos de grupo para fiestas y reuniones de amigos. Incluye juegos como El Impostor, ¡Basta!, Rosco Veloz, Crucigrama y más. Se juega directamente desde el navegador sin descargar nada.' },
		{ question: '¿Cuántos jugadores se necesitan?', answer: 'Depende del juego: algunos requieren mínimo 2 jugadores (Basta, Rosco), otros 3 (Impostor). La mayoría admite hasta 10-12 jugadores. Ideal para fiestas y reuniones.' },
		{ question: '¿Es gratis?', answer: 'Sí, todos los juegos de Viral Games son completamente gratuitos. No necesitas crear cuenta ni descargar ninguna aplicación.' },
		{ question: '¿Se puede jugar online con amigos?', answer: 'Sí, la mayoría de juegos tienen modo online donde cada jugador juega desde su propio dispositivo. También puedes jugar en modo local pasando un solo móvil, o directamente en Discord.' },
	];

	let titleEls: (HTMLElement | undefined)[] = $state(Array(GAMES.length));
	let iconEls: (HTMLElement | undefined)[] = $state(Array(GAMES.length));

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
		<!-- Section header -->
		<div class="flex items-center justify-between mb-5">
			<h2 class="font-headline text-base font-bold text-on-surface tracking-tight">{getLocale() === 'en' ? 'Pick your game' : 'Elige tu juego'}</h2>
			<span class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50 bg-surface-container-high border border-outline-variant/20 rounded-full px-3 py-1">{GAMES.length} {t('home.modes')}</span>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
			{#each GAMES as game, i}
				<div class={i === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}>
					<GameCard {game} index={i} onNavigate={navigateTo} bind:titleEl={titleEls[i]} bind:iconEl={iconEls[i]} featured={i === 0} />
				</div>
			{/each}
		</div>

		<!-- Stats -->
		<div class="mt-10 flex items-center justify-center">
			<div class="inline-flex items-center liquid-card border border-white/8 rounded-2xl overflow-hidden divide-x divide-white/8">
				<div class="flex flex-col items-center px-6 py-4">
					<span class="font-headline text-2xl font-black text-primary">{GAMES.length}</span>
					<span class="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">{t('home.modes')}</span>
				</div>
				<div class="flex flex-col items-center px-6 py-4">
					<span class="font-headline text-2xl font-black text-secondary">3+</span>
					<span class="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">{getLocale() === 'en' ? 'Players' : 'Jugadores'}</span>
				</div>
				<div class="flex flex-col items-center px-6 py-4">
					<span class="font-headline text-2xl font-black text-green-400">∞</span>
					<span class="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">{getLocale() === 'en' ? 'Fun' : 'Risas'}</span>
				</div>
			</div>
		</div>
	</main>

	<!-- ═══ SEO Content Block ═══ -->
	<section class="relative z-10 max-w-3xl mx-auto px-5 pb-12">
		<h2 class="font-headline text-xl font-bold text-on-surface mb-3">
			{getLocale() === 'en' ? 'Free Party Games to Play with Friends Online' : 'Juegos de Fiesta Gratis para Jugar con Amigos Online'}
		</h2>
		<p class="text-on-surface-variant text-sm leading-relaxed mb-8">
			{getLocale() === 'en'
				? 'Viral Games is a free collection of multiplayer party games you can play directly in your browser. No downloads, no sign-ups — just pick a game, invite your friends, and start playing. Choose from social deduction games like The Impostor, word games like Basta and Rosco Veloz, puzzle games like Crossword, and more. Available in local mode (pass the phone), online mode (each player on their device), and Discord activities.'
				: 'Viral Games es una colección gratuita de juegos multijugador para fiestas que puedes jugar directamente en tu navegador. Sin descargas, sin registros — solo elige un juego, invita a tus amigos y empieza a jugar. Elige entre juegos de deducción social como El Impostor, juegos de palabras como Basta y Rosco Veloz, juegos de puzzle como Crucigrama, y mucho más. Disponible en modo local (pasando el móvil), modo online (cada jugador en su dispositivo) y como actividad de Discord.'}
		</p>

		<!-- FAQ -->
		<h2 class="font-headline text-lg font-bold text-on-surface mb-4">
			{getLocale() === 'en' ? 'Frequently Asked Questions' : 'Preguntas Frecuentes'}
		</h2>
		<div class="flex flex-col gap-3">
			{#each homeFaqs as faq}
				<details class="group bg-surface-container rounded-xl border border-outline-variant/10">
					<summary class="px-4 py-3 cursor-pointer text-on-surface font-medium text-sm flex items-center justify-between">
						{faq.question}
						<span class="iconify material-symbols--expand-more text-on-surface-variant group-open:rotate-180 transition-transform"></span>
					</summary>
					<p class="px-4 pb-3 text-on-surface-variant text-sm leading-relaxed">{faq.answer}</p>
				</details>
			{/each}
		</div>
	</section>

	<!-- JSON-LD -->
	<JsonLd data={organizationSchema()} />
	<JsonLd data={webApplicationSchema()} />
	<JsonLd data={faqSchema(homeFaqs)} />

	<!-- ═══ Footer ═══ -->
	<footer class="relative z-10 border-t border-outline-variant/10 py-8 px-6 text-center">
		<div class="flex items-center justify-center gap-4 text-xs text-on-surface-variant/60">
			<a href="/privacy" class="hover:text-on-surface-variant transition-colors">{getLocale() === 'en' ? 'Privacy Policy' : 'Política de Privacidad'}</a>
			<span class="text-outline-variant/30">·</span>
			<a href="/terms" class="hover:text-on-surface-variant transition-colors">{getLocale() === 'en' ? 'Terms of Service' : 'Términos de Servicio'}</a>
		</div>
		<p class="text-[10px] text-on-surface-variant/40 mt-3">© {new Date().getFullYear()} Viral Games</p>
	</footer>
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
</style>
