/**
 * SEO content for each game: description and FAQs.
 * Used for game landing pages.
 */

export interface GameFaq {
	question: string;
	answer: string;
}

export interface GameSeo {
	description: string;
	faqs: GameFaq[];
}

const SEO_ES: Record<string, GameSeo> = {
	impostor: {
		description:
			'El Impostor es un juego de deducción social donde un jugador recibe una palabra diferente al resto. A través de preguntas y respuestas, el grupo debe descubrir quién es el impostor antes de que sea tarde. Perfecto para fiestas y reuniones con amigos.',
		faqs: [
			{ question: '¿Cuántos jugadores se necesitan para jugar El Impostor?', answer: 'Se necesitan un mínimo de 3 jugadores. El juego funciona mejor con 4-8 jugadores.' },
			{ question: '¿Cómo funciona el juego?', answer: 'Todos reciben una palabra secreta, excepto el impostor que recibe una diferente. Durante la discusión, deben descubrir quién no conoce la palabra real.' },
			{ question: '¿Se puede jugar online?', answer: 'Sí, puedes jugar en modo local pasando el móvil o en modo online creando una sala para que se unan tus amigos.' },
			{ question: '¿Funciona en Discord?', answer: 'Sí, El Impostor está disponible como actividad de Discord para jugar directamente en llamadas de voz.' },
		],
	},
	'impostor-draw': {
		description:
			'Impostor Dibujo es la versión artística del clásico juego del impostor. Todos los jugadores deben dibujar la misma palabra secreta, pero el impostor no sabe cuál es. ¿Podrá disimular con su dibujo?',
		faqs: [
			{ question: '¿Cómo se juega Impostor Dibujo?', answer: 'Cada jugador dibuja por turnos. Todos conocen la palabra excepto el impostor, que debe dibujar algo creíble sin saber qué es.' },
			{ question: '¿Se necesita saber dibujar?', answer: 'No, el juego es divertido precisamente porque los dibujos son simples. Lo importante es la estrategia, no el arte.' },
			{ question: '¿Cuántas rondas tiene?', answer: 'Puedes configurar entre 1 y 5 rondas de dibujo, con tiempo ajustable por turno.' },
		],
	},
	'impostor-datos': {
		description:
			'Impostor Datos es un juego donde todos reciben un dato curioso real, excepto el impostor que recibe uno falso. Durante la discusión, cada jugador comparte su dato y el grupo vota quién tiene la mentira.',
		faqs: [
			{ question: '¿Qué tipo de datos se usan?', answer: 'El juego incluye datos curiosos sobre ciencia, historia, naturaleza y más. Todos son verificados y sorprendentes.' },
			{ question: '¿Cómo gana el impostor?', answer: 'El impostor gana si no es descubierto. Debe inventar un dato creíble y defenderlo durante la discusión.' },
			{ question: '¿Es educativo?', answer: 'Sí, además de divertido, aprenderás datos curiosos reales en cada partida.' },
		],
	},
	basta: {
		description:
			'¡Basta! es un juego clásico de velocidad mental donde debes escribir palabras que empiecen por una letra al azar en diferentes categorías. Compite contra tus amigos para ver quién piensa más rápido.',
		faqs: [
			{ question: '¿Cuántos jugadores necesito?', answer: 'Se necesitan mínimo 2 jugadores. No hay límite máximo.' },
			{ question: '¿Cómo se puntúa?', answer: 'Obtienes puntos por cada respuesta válida. Si coincides con otro jugador, ambos reciben menos puntos. Las respuestas únicas valen más.' },
			{ question: '¿Se puede jugar en persona?', answer: 'Basta se juega online, cada jugador usa su propio dispositivo conectado a la misma sala.' },
		],
	},
	'palabra-oculta': {
		description:
			'Palabra Oculta es un juego de adivinanza donde debes descubrir la palabra secreta. Con cada intento, recibes una pista de distancia alfabética que te indica qué tan cerca estás.',
		faqs: [
			{ question: '¿Cómo funciona la distancia alfabética?', answer: 'Después de cada intento, ves una flecha (↑ o ↓) que indica si la palabra secreta está antes o después en el abecedario, y un número que indica la distancia.' },
			{ question: '¿Es un juego para un solo jugador?', answer: 'Sí, Palabra Oculta es un juego individual. Compite contra ti mismo para adivinar en el menor número de intentos.' },
			{ question: '¿Hay diferentes categorías?', answer: 'Sí, puedes elegir entre categorías como Animales, Comida, Países, Deportes y más, o jugar con categoría aleatoria.' },
		],
	},
	'tragos-locos': {
		description:
			'Tragos Locos es el mejor juego de bebidas para fiestas. Con tarjetas de retos, preguntas atrevidas y múltiples modos de juego, es perfecto para animar cualquier reunión social.',
		faqs: [
			{ question: '¿Qué modos de juego tiene?', answer: 'Tiene modos como PreFiesta, Tragos Locos, Best Friends, Hot y más. Cada uno con un estilo diferente de preguntas y retos.' },
			{ question: '¿Se puede jugar sin alcohol?', answer: 'Sí, puedes sustituir los tragos por cualquier otro castigo divertido. El juego es igual de entretenido.' },
			{ question: '¿Cuántas personas pueden jugar?', answer: 'Desde 2 personas hasta grupos grandes. El juego se adapta al número de jugadores.' },
			{ question: '¿Es gratis?', answer: 'Tiene una versión gratuita con acceso limitado. La versión premium desbloquea todos los modos y preguntas.' },
		],
	},
};

const SEO_EN: Record<string, GameSeo> = {
	impostor: {
		description:
			'The Impostor is a social deduction game where one player receives a different word from everyone else. Through questions and discussion, the group must figure out who the impostor is before it\'s too late.',
		faqs: [
			{ question: 'How many players do you need?', answer: 'You need at least 3 players. The game works best with 4-8 players.' },
			{ question: 'How does the game work?', answer: 'Everyone receives a secret word, except the impostor who gets a different one. During discussion, you must figure out who doesn\'t know the real word.' },
			{ question: 'Can you play online?', answer: 'Yes, you can play locally passing the phone or online by creating a room for your friends to join.' },
			{ question: 'Does it work on Discord?', answer: 'Yes, The Impostor is available as a Discord Activity to play directly in voice calls.' },
		],
	},
	'impostor-draw': {
		description:
			'Impostor Draw is the artistic version of the classic impostor game. All players must draw the same secret word, but the impostor doesn\'t know what it is. Can they fake it?',
		faqs: [
			{ question: 'How do you play Impostor Draw?', answer: 'Each player draws in turns. Everyone knows the word except the impostor, who must draw something believable without knowing what it is.' },
			{ question: 'Do you need to know how to draw?', answer: 'No, the game is fun precisely because drawings are simple. Strategy matters more than art.' },
			{ question: 'How many rounds are there?', answer: 'You can set between 1 and 5 drawing rounds, with adjustable time per turn.' },
		],
	},
	'impostor-datos': {
		description:
			'Impostor Facts is a game where everyone receives a real fun fact, except the impostor who gets a fake one. During discussion, each player shares their fact and the group votes on who has the lie.',
		faqs: [
			{ question: 'What kinds of facts are used?', answer: 'The game includes fun facts about science, history, nature and more. All are verified and surprising.' },
			{ question: 'How does the impostor win?', answer: 'The impostor wins if they\'re not caught. They must invent a believable fact and defend it during discussion.' },
			{ question: 'Is it educational?', answer: 'Yes, besides being fun, you\'ll learn real fun facts every game.' },
		],
	},
	basta: {
		description:
			'Basta! is a classic speed thinking game where you must write words starting with a random letter across different categories. Compete against your friends to see who thinks fastest.',
		faqs: [
			{ question: 'How many players do you need?', answer: 'You need at least 2 players. There\'s no maximum limit.' },
			{ question: 'How is it scored?', answer: 'You get points for each valid answer. If you match another player, both get fewer points. Unique answers are worth more.' },
			{ question: 'Can you play in person?', answer: 'Basta is played online, each player uses their own device connected to the same room.' },
		],
	},
	'palabra-oculta': {
		description:
			'Hidden Word is a guessing game where you must discover the secret word. With each attempt, you receive an alphabetical distance clue showing how close you are.',
		faqs: [
			{ question: 'How does alphabetical distance work?', answer: 'After each guess, you see an arrow (↑ or ↓) showing if the secret word comes before or after alphabetically, plus a number showing the distance.' },
			{ question: 'Is it a single-player game?', answer: 'Yes, Hidden Word is an individual game. Compete against yourself to guess in the fewest attempts.' },
			{ question: 'Are there different categories?', answer: 'Yes, you can choose from categories like Animals, Food, Countries, Sports and more, or play with a random category.' },
		],
	},
	'tragos-locos': {
		description:
			'Tragos Locos is the ultimate drinking game for parties. With challenge cards, daring questions and multiple game modes, it\'s perfect for any social gathering.',
		faqs: [
			{ question: 'What game modes does it have?', answer: 'It has modes like PreParty, Tragos Locos, Best Friends, Hot and more. Each with a different style of questions and challenges.' },
			{ question: 'Can you play without alcohol?', answer: 'Yes, you can substitute drinks with any other fun penalty. The game is just as entertaining.' },
			{ question: 'How many people can play?', answer: 'From 2 people to large groups. The game adapts to the number of players.' },
			{ question: 'Is it free?', answer: 'It has a free version with limited access. The premium version unlocks all modes and questions.' },
		],
	},
};

export function getGameSeo(gameId: string, locale: string): GameSeo | null {
	const map = locale === 'en' ? SEO_EN : SEO_ES;
	return map[gameId] ?? null;
}
