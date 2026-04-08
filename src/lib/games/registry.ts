export type GameType = 'word' | 'draw' | 'fact';

export interface GameDef {
	id: string;
	type: GameType;
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
];

export const GAMES_BY_ID = Object.fromEntries(
	GAMES.map((g) => [g.id, g])
) as Record<string, GameDef>;
