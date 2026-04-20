export type GameType = 'word' | 'draw' | 'fact' | 'basta' | 'guess' | 'external' | 'crossword' | 'rosco' | 'probable' | 'spyfall' | 'wordle' | 'pictionary';

export interface GameDef {
	id: string;
	type: GameType;
	/** Available in Discord Activities */
	discordEnabled: boolean;
	/** Has online multiplayer (web) */
	onlineEnabled: boolean;
	/** Has local play */
	localEnabled: boolean;
	/** External URL — game hosted elsewhere */
	externalUrl?: string;
	// Home card
	num: string;
	cardTitleHtml: string;
	description: string;
	icon: string;
	borderClass: string;
	badgeClass: string;
	iconColorClass: string;
	barStyle: string;
	hoverGlow: string;
	// Game page header
	headerIcon: string;
	headerTitle: string;
	// Game page hero
	heroIcon: string;
	heroSubtitle: string;
	heroTitleHtml: string;
	heroDescription: string;
	// Player labels
	playerLabel: string;
	inputPlaceholder: string;
	citizenLabel: string;
	// Reveal
	revealHiddenText: string;
	// Voting
	votingTitle: string;
	votingSubtitle: string;
}

export const GAMES: GameDef[] = [
	{
		id: 'impostor',
		type: 'word',
		discordEnabled: true,
		onlineEnabled: true,
		localEnabled: true,
		num: '01',
		cardTitleHtml:
			'EL <span style="background:linear-gradient(90deg,#9c42f4,#ca98ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">IMPOSTOR</span>',
		description: 'Detecta al intruso antes de que sea tarde.',
		icon: 'material-symbols--fingerprint',
		borderClass: 'neon-border-purple',
		badgeClass: 'bg-primary-dim text-on-primary',
		iconColorClass: 'text-primary',
		barStyle: 'background: linear-gradient(90deg, #9c42f4, #ca98ff)',
		hoverGlow: 'rgba(156,66,244,0.2)',
		headerIcon: 'material-symbols--shield-person',
		headerTitle: 'EL IMPOSTOR',
		heroIcon: 'material-symbols--fingerprint',
		heroSubtitle: 'Inicia el Interrogatorio',
		heroTitleHtml:
			'EL <span class="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary-container">IMPOSTOR</span>',
		heroDescription:
			'Un juego de deducción, engaño y astucia. ¿Podrás descubrir quién miente?',
		playerLabel: 'Agente',
		inputPlaceholder: 'Nombre del agente...',
		citizenLabel: 'Ciudadano',
		revealHiddenText: 'Pulsa para ver tu identidad',
		votingTitle: '¿QUIÉN ES EL IMPOSTOR?',
		votingSubtitle: 'Selecciona al jugador sospechoso',
	},
	{
		id: 'impostor-draw',
		type: 'draw',
		discordEnabled: true,
		onlineEnabled: true,
		localEnabled: true,
		num: '02',
		cardTitleHtml:
			'IMPOSTOR <span style="background:linear-gradient(90deg,#2be800,#2ff801);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">DIBUJO</span>',
		description: 'Dibuja la palabra secreta... si la conoces.',
		icon: 'material-symbols--draw',
		borderClass: 'neon-border-green',
		badgeClass: 'bg-secondary text-on-secondary',
		iconColorClass: 'text-secondary',
		barStyle: 'background: linear-gradient(90deg, #2be800, #2ff801)',
		hoverGlow: 'rgba(47,248,1,0.14)',
		headerIcon: 'material-symbols--draw',
		headerTitle: 'IMPOSTOR DIBUJO',
		heroIcon: 'material-symbols--draw',
		heroSubtitle: 'Edición Artística',
		heroTitleHtml:
			'IMPOSTOR <span class="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary-container">DIBUJO</span>',
		heroDescription:
			'Dibuja la palabra secreta. El impostor no la conoce... ¿podrá disimular?',
		playerLabel: 'Artista',
		inputPlaceholder: 'Nombre del artista...',
		citizenLabel: 'Artista',
		revealHiddenText: 'Pulsa para ver qué dibujar',
		votingTitle: '¿QUIÉN DIBUJÓ MAL?',
		votingSubtitle: 'Selecciona al impostor del dibujo',
	},
	{
		id: 'impostor-datos',
		type: 'fact',
		discordEnabled: true,
		onlineEnabled: true,
		localEnabled: true,
		num: '03',
		cardTitleHtml:
			'IMPOSTOR <span style="background:linear-gradient(90deg,#2be800,#2ff801);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">DATOS</span>',
		description: '¿Verdad o mentira? Descubre el dato falso.',
		icon: 'material-symbols--quiz',
		borderClass: 'neon-border-green',
		badgeClass: 'bg-secondary text-on-secondary',
		iconColorClass: 'text-secondary',
		barStyle: 'background: linear-gradient(90deg, #2be800, #2ff801)',
		hoverGlow: 'rgba(47,248,1,0.14)',
		headerIcon: 'material-symbols--quiz',
		headerTitle: 'IMPOSTOR DATOS',
		heroIcon: 'material-symbols--quiz',
		heroSubtitle: '¿Verdad o Mentira?',
		heroTitleHtml:
			'IMPOSTOR <span class="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary-container">DATOS</span>',
		heroDescription:
			'Todos reciben un dato curioso real... excepto el impostor. ¿Quién tiene la mentira?',
		playerLabel: 'Investigador',
		inputPlaceholder: 'Nombre del investigador...',
		citizenLabel: 'Investigador',
		revealHiddenText: 'Pulsa para ver tu dato',
		votingTitle: '¿QUIÉN TIENE EL DATO FALSO?',
		votingSubtitle: 'Selecciona al jugador que crees que miente',
	},
	{
		id: 'basta',
		type: 'basta',
		discordEnabled: true,
		onlineEnabled: true,
		localEnabled: false,
		num: '04',
		cardTitleHtml:
			'<span style="background:linear-gradient(90deg,#f59e0b,#fbbf24);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">¡BASTA!</span>',
		description: 'Piensa rápido. Escribe palabras con la letra elegida.',
		icon: 'material-symbols--edit-note',
		borderClass: 'neon-border-amber',
		badgeClass: 'bg-amber-600 text-white',
		iconColorClass: 'text-amber-500',
		barStyle: 'background: linear-gradient(90deg, #f59e0b, #fbbf24)',
		hoverGlow: 'rgba(245,158,11,0.2)',
		headerIcon: 'material-symbols--edit-note',
		headerTitle: '¡BASTA!',
		heroIcon: 'material-symbols--edit-note',
		heroSubtitle: '¡Piensa Rápido!',
		heroTitleHtml:
			'<span class="text-transparent bg-clip-text bg-linear-to-r from-amber-500 to-amber-300">¡BASTA!</span>',
		heroDescription:
			'Rellena las categorías con palabras que empiecen por la letra elegida. ¡El más rápido gana!',
		playerLabel: 'Jugador',
		inputPlaceholder: 'Nombre del jugador...',
		citizenLabel: 'Jugador',
		revealHiddenText: '',
		votingTitle: '¿ES VÁLIDA LA RESPUESTA?',
		votingSubtitle: 'Vota si las respuestas son correctas',
	},
	{
		id: 'palabra-oculta',
		type: 'guess',
		discordEnabled: false,
		onlineEnabled: false,
		localEnabled: true,
		num: '05',
		cardTitleHtml:
			'PALABRA <span style="background:linear-gradient(90deg,#06b6d4,#67e8f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">OCULTA</span>',
		description: 'Adivina la palabra oculta con pistas alfabéticas.',
		icon: 'material-symbols--search',
		borderClass: 'neon-border-cyan',
		badgeClass: 'bg-cyan-600 text-white',
		iconColorClass: 'text-cyan-500',
		barStyle: 'background: linear-gradient(90deg, #06b6d4, #67e8f9)',
		hoverGlow: 'rgba(6,182,212,0.2)',
		headerIcon: 'material-symbols--search',
		headerTitle: 'PALABRA OCULTA',
		heroIcon: 'material-symbols--search',
		heroSubtitle: '¿Podrás adivinarla?',
		heroTitleHtml:
			'PALABRA <span class="text-transparent bg-clip-text bg-linear-to-r from-cyan-500 to-cyan-300">OCULTA</span>',
		heroDescription:
			'Adivina la palabra secreta. Cada intento te dice qué tan cerca estás alfabéticamente.',
		playerLabel: 'Jugador',
		inputPlaceholder: 'Escribe una palabra...',
		citizenLabel: '',
		revealHiddenText: '',
		votingTitle: '',
		votingSubtitle: '',
	},
	{
		id: 'tragos-locos',
		type: 'external',
		discordEnabled: false,
		onlineEnabled: false,
		localEnabled: true,
		externalUrl: 'https://tragos-locos.servitimo.net/intro',
		num: '06',
		cardTitleHtml:
			'<span style="background:linear-gradient(90deg,#f97316,#fb923c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">TRAGOS LOCOS</span>',
		description: 'El mejor juego de bebidas para fiestas. Retos, preguntas y diversión.',
		icon: 'material-symbols--local-bar',
		borderClass: 'neon-border-orange',
		badgeClass: 'bg-orange-600 text-white',
		iconColorClass: 'text-orange-500',
		barStyle: 'background: linear-gradient(90deg, #f97316, #fb923c)',
		hoverGlow: 'rgba(249,115,22,0.2)',
		headerIcon: 'material-symbols--local-bar',
		headerTitle: 'TRAGOS LOCOS',
		heroIcon: 'material-symbols--local-bar',
		heroSubtitle: '¡A beber!',
		heroTitleHtml:
			'<span class="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-orange-300">TRAGOS LOCOS</span>',
		heroDescription:
			'Juego de bebidas con tarjetas de retos, preguntas atrevidas y modos para todo tipo de fiestas.',
		playerLabel: 'Jugador',
		inputPlaceholder: '',
		citizenLabel: '',
		revealHiddenText: '',
		votingTitle: '',
		votingSubtitle: '',
	},
	{
		id: 'crossword',
		type: 'crossword',
		discordEnabled: false,
		onlineEnabled: true,
		localEnabled: true,
		num: '07',
		cardTitleHtml:
			'<span style="background:linear-gradient(90deg,#0ea5e9,#38bdf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">CRUCIGRAMA</span>',
		description: 'Resuelve el crucigrama más rápido que tus rivales.',
		icon: 'material-symbols--grid-on',
		borderClass: 'neon-border-sky',
		badgeClass: 'bg-sky-600 text-white',
		iconColorClass: 'text-sky-500',
		barStyle: 'background: linear-gradient(90deg, #0ea5e9, #38bdf8)',
		hoverGlow: 'rgba(14,165,233,0.2)',
		headerIcon: 'material-symbols--grid-on',
		headerTitle: 'CRUCIGRAMA',
		heroIcon: 'material-symbols--grid-on',
		heroSubtitle: '¡A resolver!',
		heroTitleHtml:
			'<span class="text-transparent bg-clip-text bg-linear-to-r from-sky-500 to-sky-300">CRUCIGRAMA</span>',
		heroDescription:
			'Compite por resolver más palabras del crucigrama. ¡Cada palabra solo la puede resolver un jugador!',
		playerLabel: 'Jugador',
		inputPlaceholder: 'Tu nombre',
		citizenLabel: '',
		revealHiddenText: '',
		votingTitle: '',
		votingSubtitle: '',
	},
	{
		id: 'rosco',
		type: 'rosco',
		discordEnabled: false,
		onlineEnabled: true,
		localEnabled: true,
		num: '08',
		cardTitleHtml:
			'<span style="background:linear-gradient(90deg,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">ROSCO VELOZ</span>',
		description: 'Responde una definición por cada letra del abecedario. ¡El más rápido gana!',
		icon: 'material-symbols--circle',
		borderClass: 'neon-border-pink',
		badgeClass: 'bg-pink-600 text-white',
		iconColorClass: 'text-pink-500',
		barStyle: 'background: linear-gradient(90deg, #a855f7, #ec4899)',
		hoverGlow: 'rgba(168,85,247,0.2)',
		headerIcon: 'material-symbols--circle',
		headerTitle: 'ROSCO VELOZ',
		heroIcon: 'material-symbols--circle',
		heroSubtitle: '¡Completa el Rosco!',
		heroTitleHtml:
			'<span class="text-transparent bg-clip-text bg-linear-to-r from-purple-500 to-pink-500">ROSCO VELOZ</span>',
		heroDescription:
			'Una definición por cada letra del abecedario. Responde, pasa o falla. ¡Quien más acierte gana!',
		playerLabel: 'Jugador',
		inputPlaceholder: 'Tu nombre',
		citizenLabel: '',
		revealHiddenText: '',
		votingTitle: '',
		votingSubtitle: '',
	},
	{
		id: 'probable',
		type: 'probable',
		discordEnabled: false,
		onlineEnabled: true,
		localEnabled: true,
		num: '09',
		cardTitleHtml:
			'<span style="background:linear-gradient(90deg,#f43f5e,#fb7185);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">¿QUIÉN ES MÁS PROBABLE?</span>',
		description: 'Vota quién del grupo es más probable que haga algo. ¡Las risas están aseguradas!',
		icon: 'material-symbols--group',
		borderClass: 'neon-border-rose',
		badgeClass: 'bg-rose-600 text-white',
		iconColorClass: 'text-rose-500',
		barStyle: 'background: linear-gradient(90deg, #f43f5e, #fb7185)',
		hoverGlow: 'rgba(244,63,94,0.2)',
		headerIcon: 'material-symbols--group',
		headerTitle: '¿QUIÉN ES MÁS PROBABLE?',
		heroIcon: 'material-symbols--group',
		heroSubtitle: '¡Hora de votar!',
		heroTitleHtml:
			'<span class="text-transparent bg-clip-text bg-linear-to-r from-rose-500 to-rose-300">¿QUIÉN ES MÁS PROBABLE?</span>',
		heroDescription:
			'Responde quién del grupo es más probable que haga algo loco. ¡Las respuestas los sorprenderán!',
		playerLabel: 'Jugador',
		inputPlaceholder: 'Nombre del jugador...',
		citizenLabel: '',
		revealHiddenText: '',
		votingTitle: '',
		votingSubtitle: '',
	},
	{
		id: 'spyfall',
		type: 'spyfall',
		discordEnabled: false,
		onlineEnabled: true,
		localEnabled: true,
		num: '10',
		cardTitleHtml:
			'<span style="background:linear-gradient(90deg,#6366f1,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">IMPOSTOR UBICACIÓN</span>',
		description: 'Todos conocen la ubicación menos el espía. ¡Descúbrelo antes de que adivine!',
		icon: 'material-symbols--location-on',
		borderClass: 'neon-border-indigo',
		badgeClass: 'bg-indigo-600 text-white',
		iconColorClass: 'text-indigo-500',
		barStyle: 'background: linear-gradient(90deg, #6366f1, #818cf8)',
		hoverGlow: 'rgba(99,102,241,0.2)',
		headerIcon: 'material-symbols--location-on',
		headerTitle: 'IMPOSTOR UBICACIÓN',
		heroIcon: 'material-symbols--location-on',
		heroSubtitle: '¿Dónde estamos?',
		heroTitleHtml:
			'IMPOSTOR <span class="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-indigo-300">UBICACIÓN</span>',
		heroDescription:
			'Todos saben la ubicación secreta, menos el espía. Haz preguntas para descubrirlo... ¡sin revelar dónde estás!',
		playerLabel: 'Agente',
		inputPlaceholder: 'Nombre del agente...',
		citizenLabel: 'Agente',
		revealHiddenText: 'Pulsa para ver tu ubicación',
		votingTitle: '¿QUIÉN ES EL ESPÍA?',
		votingSubtitle: 'Selecciona al jugador sospechoso',
	},
	{
		id: 'wordle',
		type: 'wordle',
		discordEnabled: false,
		onlineEnabled: false,
		localEnabled: true,
		num: '11',
		cardTitleHtml:
			'<span style="background:linear-gradient(90deg,#22c55e,#4ade80);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">WORDLE BATTLE</span>',
		description: 'Adivina la palabra de 5 letras antes que tus amigos. ¡6 intentos!',
		icon: 'mdi--alphabet-latin',
		borderClass: 'neon-border-green',
		badgeClass: 'bg-green-600 text-white',
		iconColorClass: 'text-green-500',
		barStyle: 'background: linear-gradient(90deg, #22c55e, #4ade80)',
		hoverGlow: 'rgba(34,197,94,0.2)',
		headerIcon: 'mdi--alphabet-latin',
		headerTitle: 'WORDLE BATTLE',
		heroIcon: 'mdi--alphabet-latin',
		heroSubtitle: '¡Adivina la palabra!',
		heroTitleHtml:
			'WORDLE <span class="text-transparent bg-clip-text bg-linear-to-r from-green-500 to-green-300">BATTLE</span>',
		heroDescription:
			'Cada jugador intenta adivinar la misma palabra secreta de 5 letras en 6 intentos. ¡Quien la descubra primero gana!',
		playerLabel: 'Jugador',
		inputPlaceholder: 'Tu nombre...',
		citizenLabel: '',
		revealHiddenText: '',
		votingTitle: '',
		votingSubtitle: '',
	},
];

export const GAMES_BY_ID = Object.fromEntries(
	GAMES.map((g) => [g.id, g])
) as Record<string, GameDef>;

export const DISCORD_GAMES = GAMES.filter(g => g.discordEnabled);
