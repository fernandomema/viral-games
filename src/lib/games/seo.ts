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
			'El Impostor es un juego de deducción social para jugar con amigos en fiestas y reuniones. En este juego de grupo gratuito y online, todos los jugadores reciben una palabra secreta idéntica, excepto el impostor, que recibe una diferente. A través de rondas de preguntas, pistas y discusión, el grupo debe deducir quién es el impostor antes de que sea tarde. El Impostor es perfecto para grupos de 3 a 12 personas, se juega directamente desde el navegador sin descargar ninguna app, y está disponible tanto en modo local (pasando el móvil) como en modo online y Discord. Si buscas juegos de fiesta, juegos para amigos o juegos de deducción social, El Impostor es la elección ideal.',
		faqs: [
			{ question: '¿Cuántos jugadores se necesitan para jugar El Impostor?', answer: 'Para jugar El Impostor necesitas un mínimo de 3 jugadores. El juego de deducción social funciona mejor con grupos de 4 a 8 jugadores, aunque admite hasta 12. Es ideal para fiestas, reuniones y quedadas con amigos.' },
			{ question: '¿Cómo funciona el juego El Impostor?', answer: 'En El Impostor, todos los jugadores reciben una palabra secreta, excepto el impostor que recibe una diferente. Durante la fase de discusión, cada jugador da pistas sobre su palabra y el grupo vota quién creen que es el impostor. Si el impostor es descubierto, gana el grupo; si no, gana el impostor.' },
			{ question: '¿Se puede jugar El Impostor online gratis?', answer: 'Sí, El Impostor se puede jugar completamente gratis y online. Puedes crear una sala para que tus amigos se unan desde sus propios dispositivos, o jugar en modo local pasando un solo móvil. No necesitas descargar ninguna aplicación.' },
			{ question: '¿El Impostor funciona en Discord?', answer: 'Sí, El Impostor está disponible como actividad de Discord. Puedes iniciar una partida directamente desde una llamada de voz de Discord, sin salir de la aplicación. Todos los participantes pueden jugar desde su cliente de Discord.' },
		],
	},
	'impostor-draw': {
		description:
			'Impostor Dibujo es la versión artística del popular juego de deducción social El Impostor, diseñado para jugar con amigos en fiestas y reuniones. En este juego de dibujo gratuito y online, todos los jugadores deben dibujar la misma palabra secreta por turnos, pero el impostor no sabe cuál es y debe improvisar un dibujo creíble. El resto del grupo observa los dibujos e intenta descubrir quién es el impostor. Impostor Dibujo se juega gratis desde el navegador, admite de 3 a 10 jugadores, y está disponible en modo local, online y en Discord. Perfecto como juego de fiesta, juego de grupo o juego para amigos que quieran reírse dibujando.',
		faqs: [
			{ question: '¿Cómo se juega Impostor Dibujo?', answer: 'En Impostor Dibujo, cada jugador dibuja por turnos. Todos conocen la palabra secreta excepto el impostor, que debe dibujar algo creíble sin saber qué es. Después de que todos dibujan, el grupo discute y vota quién es el impostor. Es un juego de deducción social con dibujo, perfecto para fiestas.' },
			{ question: '¿Se necesita saber dibujar para jugar?', answer: 'No, Impostor Dibujo es divertido precisamente porque los dibujos son simples y rápidos. No importa tu nivel artístico — lo importante es la estrategia y la capacidad de engaño. Es un juego de grupo donde la diversión está en las risas, no en el arte.' },
			{ question: '¿Cuántas rondas tiene Impostor Dibujo?', answer: 'Puedes configurar entre 1 y 5 rondas de dibujo en cada partida de Impostor Dibujo. También puedes ajustar el tiempo por turno. Cada ronda tiene una palabra nueva y un nuevo impostor, lo que mantiene el juego fresco y emocionante.' },
		],
	},
	'impostor-datos': {
		description:
			'Impostor Datos es un juego de deducción social basado en datos curiosos reales, perfecto para jugar con amigos en fiestas y reuniones. En este juego gratuito y online, todos los jugadores reciben un dato curioso verdadero, excepto el impostor, que recibe uno falso. Durante la ronda de discusión, cada jugador comparte su dato y el grupo debe votar quién tiene la mentira. Impostor Datos combina diversión con aprendizaje: descubrirás hechos sorprendentes sobre ciencia, historia, naturaleza y más. Se juega gratis desde el navegador, admite de 3 a 10 jugadores, y está disponible en modo local, online y en Discord.',
		faqs: [
			{ question: '¿Qué tipo de datos curiosos se usan en Impostor Datos?', answer: 'Impostor Datos incluye cientos de datos curiosos verificados sobre ciencia, historia, naturaleza, geografía, tecnología y más. Todos los datos son sorprendentes y reales, lo que hace que el juego sea educativo además de divertido. El impostor recibe un dato falso inventado que parece creíble.' },
			{ question: '¿Cómo gana el impostor en Impostor Datos?', answer: 'En Impostor Datos, el impostor gana si no es descubierto por el grupo. Su estrategia debe ser inventar un dato falso que suene creíble y defenderlo durante la discusión. Si la mayoría vota a otro jugador, el impostor se salva y gana la ronda.' },
			{ question: '¿Impostor Datos es un juego educativo?', answer: 'Sí, Impostor Datos es tanto un juego de fiesta como un juego educativo. En cada partida aprenderás datos curiosos reales que no conocías. Es perfecto para grupos que quieren divertirse y aprender al mismo tiempo.' },
		],
	},
	basta: {
		description:
			'¡Basta! es un juego clásico de velocidad mental online y gratuito, perfecto para jugar con amigos y en fiestas. En este juego de palabras y categorías, una letra al azar aparece y todos los jugadores deben escribir palabras que empiecen por esa letra en diferentes categorías (animales, países, nombres, etc.) lo más rápido posible. Cuando alguien termina, grita ¡Basta! y se puntúan las respuestas. Las respuestas únicas valen más puntos que las compartidas. ¡Basta! se juega online con cada jugador en su propio dispositivo, admite desde 2 jugadores sin límite máximo, y es completamente gratis. Ideal como juego de grupo, juego de fiesta o juego para reuniones familiares.',
		faqs: [
			{ question: '¿Cuántos jugadores necesito para jugar ¡Basta!?', answer: '¡Basta! requiere un mínimo de 2 jugadores y no tiene límite máximo. Cuantos más jugadores, más divertido y competitivo se vuelve el juego. Es perfecto para grupos grandes en fiestas y reuniones.' },
			{ question: '¿Cómo se puntúa en ¡Basta!?', answer: 'En ¡Basta!, obtienes puntos por cada respuesta válida que escribas. Si tu respuesta coincide con la de otro jugador, ambos reciben menos puntos. Las respuestas únicas que nadie más escribió valen más. El jugador con más puntos totales al final de las rondas gana la partida.' },
			{ question: '¿Se puede jugar ¡Basta! en persona o solo online?', answer: '¡Basta! en Viral Games se juega exclusivamente online — cada jugador usa su propio dispositivo (móvil, tablet o PC) conectado a la misma sala. Esto permite jugar tanto estando juntos en persona como a distancia. Es gratis y no requiere descargar ninguna app.' },
		],
	},
	'palabra-oculta': {
		description:
			'Palabra Oculta es un juego de adivinanza de palabras gratuito y online, perfecto para poner a prueba tu vocabulario y tu lógica. En este juego individual, debes descubrir la palabra secreta oculta mediante intentos. Con cada intento, recibes una pista de distancia alfabética que indica qué tan cerca estás de la palabra objetivo: una flecha hacia arriba o hacia abajo te dice la dirección, y un número muestra la distancia. El rango de letras posibles se va estrechando con cada intento, ayudándote a adivinar más rápido. Palabra Oculta tiene múltiples categorías (animales, comida, países, deportes y más) y se juega gratis desde el navegador. Si te gustan los juegos de palabras, juegos de lógica o juegos tipo Wordle, Palabra Oculta es para ti.',
		faqs: [
			{ question: '¿Cómo funciona la distancia alfabética en Palabra Oculta?', answer: 'En Palabra Oculta, después de cada intento ves una flecha (↑ si la palabra secreta está después en el abecedario, ↓ si está antes) y un número que indica la distancia. Las primeras letras pesan mucho más que las últimas. Por ejemplo, si la palabra empieza por una letra muy diferente, la distancia será mayor.' },
			{ question: '¿Palabra Oculta es un juego para un solo jugador?', answer: 'Sí, Palabra Oculta es un juego individual de palabras. Compites contra ti mismo para adivinar la palabra secreta en el menor número de intentos. Es perfecto para jugar solo en cualquier momento, como un desafío diario de vocabulario.' },
			{ question: '¿Qué categorías de palabras tiene Palabra Oculta?', answer: 'Palabra Oculta ofrece categorías como Animales, Comida, Países, Deportes, Profesiones, Objetos y más. Puedes elegir una categoría específica o jugar con categoría aleatoria para un desafío extra. Hay cientos de palabras en español e inglés.' },
		],
	},
	'tragos-locos': {
		description:
			'Tragos Locos es el mejor juego de bebidas y retos para fiestas, reuniones y previas. Con cientos de tarjetas de retos, preguntas atrevidas, verdad o reto y múltiples modos de juego, es el juego de fiesta por excelencia. Tragos Locos tiene modos como PreFiesta (calentamiento), Tragos Locos (el clásico), Best Friends (para mejores amigos) y Hot (para parejas y adultos). Con más de 393 preguntas y retos, cada partida es diferente. Se juega desde 2 personas hasta grupos grandes, se puede jugar sin alcohol sustituyendo los tragos por otros castigos divertidos, y tiene una versión gratuita. Si buscas juegos de beber, juegos para fiestas o juegos para previas, Tragos Locos es la mejor opción.',
		faqs: [
			{ question: '¿Qué modos de juego tiene Tragos Locos?', answer: 'Tragos Locos tiene varios modos de juego: PreFiesta (perfecto para calentar motores), Tragos Locos (el modo clásico con retos y preguntas variadas), Best Friends (preguntas para conocer mejor a tus amigos) y Hot (modo para parejas y adultos con preguntas picantes). Cada modo tiene su propio estilo y nivel de intensidad.' },
			{ question: '¿Se puede jugar Tragos Locos sin alcohol?', answer: 'Sí, Tragos Locos se puede jugar perfectamente sin alcohol. Puedes sustituir los tragos por cualquier otro castigo divertido: hacer ejercicio, comer algo picante, cantar una canción... El juego de retos es igual de entretenido sin bebidas alcohólicas.' },
			{ question: '¿Cuántas personas pueden jugar Tragos Locos?', answer: 'Tragos Locos se puede jugar desde 2 personas hasta grupos grandes sin límite. El juego de fiesta se adapta automáticamente al número de jugadores. Es ideal tanto para una previa íntima como para una fiesta grande.' },
			{ question: '¿Tragos Locos es gratis?', answer: 'Tragos Locos tiene una versión gratuita con acceso a un número limitado de preguntas y retos. La versión premium desbloquea todos los modos de juego, todas las preguntas y funciones exclusivas. Es el juego de bebidas más completo del mercado.' },
		],
	},
	crossword: {
		description:
			'Crucigrama Multijugador es un juego de palabras competitivo para jugar con amigos online. En este crucigrama gratuito y online, se genera un tablero procedural con palabras de distintas categorías (animales, comida, geografía, deportes, ciencia, profesiones). Los jugadores compiten en tiempo real por resolver las pistas del crucigrama: ¡cada palabra solo puede ser resuelta por un jugador! Gana quien más palabras complete. También se puede jugar en modo individual. El crucigrama tiene tableros de distintos tamaños (9×9, 13×13, 15×15), se juega desde el navegador sin descargar nada, y es perfecto como juego de grupo, juego para amigos o pasatiempo individual.',
		faqs: [
			{ question: '¿Cómo funciona el Crucigrama Multijugador?', answer: 'Se genera un crucigrama procedural con palabras de distintas categorías. Todos los jugadores ven el mismo tablero y compiten por resolver las pistas. Cuando un jugador resuelve una palabra correctamente, esa palabra queda resuelta para todos y suma puntos solo para ese jugador. Gana quien resuelva más palabras.' },
			{ question: '¿Se puede jugar el Crucigrama solo?', answer: 'Sí, el Crucigrama tiene un modo individual en el que puedes resolver todo el tablero a tu ritmo. Es perfecto como pasatiempo o para practicar vocabulario.' },
			{ question: '¿Qué tamaños de tablero tiene el Crucigrama?', answer: 'El Crucigrama ofrece tres tamaños de tablero: Pequeño (9×9), Mediano (13×13) y Grande (15×15). A mayor tamaño, más palabras y más desafiante la partida.' },
			{ question: '¿El Crucigrama es gratis?', answer: 'Sí, el Crucigrama Multijugador es completamente gratis. Se juega directamente desde el navegador sin necesidad de descargar ninguna aplicación.' },
		],
	},
	probable: {
		description:
			'¿Quién es más probable? es un juego de votación social gratuito y online perfecto para fiestas, reuniones y quedadas con amigos. Se muestra una pregunta divertida del tipo "¿Quién es más probable que...?" y todos votan a quién del grupo creen que encaja mejor. Al final se revela quién recibió más votos. Es ideal para conocer mejor a tu grupo de amigos, romper el hielo y pasar un rato de risas. Se juega desde 2 jugadores, en modo local pasando el móvil o en modo online cada uno desde su dispositivo.',
		faqs: [
			{ question: '¿Cómo se juega Quién es más probable?', answer: 'Se muestra una pregunta divertida del tipo "¿Quién es más probable que...?" y cada jugador vota señalando a quién del grupo cree que encaja mejor. Se revelan los votos y quien recibe más votos se lleva el punto. Gana quien acumule más puntos al final de las rondas.' },
			{ question: '¿Cuántos jugadores se necesitan?', answer: 'Se necesitan al menos 2 jugadores. El juego es más divertido con grupos de 4 o más personas. No hay límite máximo de jugadores.' },
			{ question: '¿Es gratis?', answer: 'Sí, ¿Quién es más probable? es completamente gratis. Se juega desde el navegador sin descargar ninguna app.' },
		],
	},
	spyfall: {
		description:
			'Impostor Ubicación es un juego de deducción social tipo Spyfall gratuito y online, perfecto para fiestas y reuniones. Todos los jugadores reciben la misma ubicación secreta (Hospital, Aeropuerto, Playa...) excepto el espía, que no sabe dónde está. El grupo hace preguntas para descubrir al espía, mientras el espía intenta adivinar la ubicación. Si el grupo vota correctamente al espía, ganan; si el espía adivina la ubicación, gana él. Se juega de 3 a 12 personas, gratis desde el navegador.',
		faqs: [
			{ question: '¿Cómo se juega Impostor Ubicación?', answer: 'Cada jugador recibe una ubicación secreta (excepto el espía que recibe ???). Durante rondas de preguntas, el grupo intenta identificar al espía sin revelar la ubicación. El espía observa las respuestas para intentar adivinar dónde están.' },
			{ question: '¿En qué se diferencia de El Impostor?', answer: 'En Impostor Ubicación, el espía no recibe ninguna pista — solo sabe que es el espía. Las ubicaciones son más concretas (lugares reales) y el espía puede intentar adivinar la ubicación para ganar, incluso si lo descubren.' },
			{ question: '¿Cuántos jugadores se necesitan?', answer: 'Se necesitan al menos 3 jugadores. El juego funciona mejor con 5-8 personas. Admite hasta 12 jugadores.' },
		],
	},
	wordle: {
		description:
			'Wordle Battle es un juego multijugador gratuito inspirado en Wordle. Cada jugador intenta adivinar la misma palabra secreta de 5 letras en 6 intentos. Las letras se colorean: verde (posición correcta), amarillo (letra presente pero mal ubicada), gris (letra ausente). Quien adivine primero o con menos intentos gana. Perfecto para jugar con amigos desde el navegador.',
		faqs: [
			{ question: '¿Cómo se juega Wordle Battle?', answer: 'Cada jugador escribe palabras de 5 letras por turnos. Después de cada intento, las letras se colorean para indicar si están en la posición correcta (verde), presentes en la palabra (amarillo) o ausentes (gris). Gana quien adivine la palabra con menos intentos.' },
			{ question: '¿Cuántos intentos hay?', answer: 'Cada jugador tiene 6 intentos para adivinar la palabra secreta de 5 letras.' },
			{ question: '¿Se puede jugar gratis?', answer: 'Sí, Wordle Battle es completamente gratis. Se juega directamente desde el navegador sin descargar nada.' },
		],
	},
};

const SEO_EN: Record<string, GameSeo> = {
	impostor: {
		description:
			'The Impostor is a free online social deduction game perfect for playing with friends at parties and gatherings. In this multiplayer party game, all players receive the same secret word, except the impostor who gets a different one. Through rounds of questions, clues and discussion, the group must figure out who the impostor is before it\'s too late. The Impostor supports 3 to 12 players, plays directly in the browser with no app download needed, and is available in local mode (pass the phone), online multiplayer and Discord. If you\'re looking for party games, games for friends or social deduction games, The Impostor is the perfect choice.',
		faqs: [
			{ question: 'How many players do you need to play The Impostor?', answer: 'You need at least 3 players to play The Impostor. This social deduction game works best with 4-8 players but supports up to 12. It\'s ideal for parties, gatherings and hangouts with friends.' },
			{ question: 'How does The Impostor game work?', answer: 'In The Impostor, everyone receives a secret word except the impostor who gets a different one. During the discussion phase, each player gives clues about their word and the group votes on who they think the impostor is. If the impostor is caught, the group wins; if not, the impostor wins.' },
			{ question: 'Can you play The Impostor online for free?', answer: 'Yes, The Impostor is completely free to play online. You can create a room for friends to join from their own devices, or play locally by passing a single phone. No app download required.' },
			{ question: 'Does The Impostor work on Discord?', answer: 'Yes, The Impostor is available as a Discord Activity. You can start a game directly from a Discord voice call without leaving the app. All participants can play from their Discord client.' },
		],
	},
	'impostor-draw': {
		description:
			'Impostor Draw is the artistic version of the popular social deduction game The Impostor, designed for playing with friends at parties and gatherings. In this free online drawing game, all players must draw the same secret word in turns, but the impostor doesn\'t know what it is and must improvise a believable drawing. The rest of the group watches the drawings and tries to figure out who the impostor is. Impostor Draw is free to play in the browser, supports 3-10 players, and is available in local, online and Discord modes. Perfect as a party game, group game or game for friends who want to have fun drawing.',
		faqs: [
			{ question: 'How do you play Impostor Draw?', answer: 'In Impostor Draw, each player draws in turns. Everyone knows the secret word except the impostor, who must draw something believable without knowing what it is. After everyone draws, the group discusses and votes on who the impostor is. It\'s a social deduction drawing game perfect for parties.' },
			{ question: 'Do you need drawing skills to play?', answer: 'No, Impostor Draw is fun precisely because drawings are simple and quick. Your art level doesn\'t matter — what counts is strategy and deception. It\'s a group game where the fun is in the laughs, not the art.' },
			{ question: 'How many rounds does Impostor Draw have?', answer: 'You can configure between 1 and 5 drawing rounds per game in Impostor Draw. You can also adjust the time per turn. Each round has a new word and a new impostor, keeping the game fresh and exciting.' },
		],
	},
	'impostor-datos': {
		description:
			'Impostor Facts is a social deduction game based on real fun facts, perfect for playing with friends at parties and gatherings. In this free online game, all players receive a true fun fact, except the impostor who gets a fake one. During the discussion round, each player shares their fact and the group must vote on who has the lie. Impostor Facts combines fun with learning: you\'ll discover surprising facts about science, history, nature and more. It\'s free to play in the browser, supports 3-10 players, and is available in local, online and Discord modes.',
		faqs: [
			{ question: 'What kinds of fun facts are used in Impostor Facts?', answer: 'Impostor Facts includes hundreds of verified fun facts about science, history, nature, geography, technology and more. All facts are surprising and real, making the game educational as well as fun. The impostor receives a fabricated fact designed to sound believable.' },
			{ question: 'How does the impostor win in Impostor Facts?', answer: 'In Impostor Facts, the impostor wins if they\'re not caught by the group. Their strategy must be to invent a believable fake fact and defend it during discussion. If the majority votes for another player, the impostor gets away with it.' },
			{ question: 'Is Impostor Facts an educational game?', answer: 'Yes, Impostor Facts is both a party game and an educational game. Every game you\'ll learn real fun facts you didn\'t know. It\'s perfect for groups who want to have fun and learn at the same time.' },
		],
	},
	basta: {
		description:
			'Basta! is a classic free online speed thinking game, perfect for playing with friends at parties and gatherings. In this word and category game, a random letter appears and all players must write words starting with that letter across different categories (animals, countries, names, etc.) as fast as possible. When someone finishes, they shout Basta! and answers are scored. Unique answers score more points than shared ones. Basta! is played online with each player on their own device, supports 2+ players with no maximum limit, and is completely free. Ideal as a group game, party game or game for family gatherings.',
		faqs: [
			{ question: 'How many players do you need for Basta!?', answer: 'Basta! requires a minimum of 2 players and has no maximum limit. The more players, the more fun and competitive the game becomes. It\'s perfect for large groups at parties and gatherings.' },
			{ question: 'How is scoring done in Basta!?', answer: 'In Basta!, you earn points for each valid answer you write. If your answer matches another player\'s, both receive fewer points. Unique answers that nobody else wrote are worth more. The player with the most total points at the end of all rounds wins the game.' },
			{ question: 'Can you play Basta! in person or only online?', answer: 'Basta! on Viral Games is played exclusively online — each player uses their own device (phone, tablet or PC) connected to the same room. This allows playing both in person together and remotely. It\'s free and requires no app download.' },
		],
	},
	'palabra-oculta': {
		description:
			'Hidden Word is a free online word guessing game, perfect for testing your vocabulary and logic skills. In this single-player word game, you must discover the hidden secret word through guesses. With each attempt, you receive an alphabetical distance clue showing how close you are to the target word: an up or down arrow tells you the direction, and a number shows the distance. The range of possible letters narrows with each guess, helping you find the answer faster. Hidden Word has multiple categories (animals, food, countries, sports and more) and is free to play in the browser. If you like word games, logic games or Wordle-style games, Hidden Word is for you.',
		faqs: [
			{ question: 'How does alphabetical distance work in Hidden Word?', answer: 'In Hidden Word, after each guess you see an arrow (↑ if the secret word comes after alphabetically, ↓ if before) and a number showing the distance. The first letters weigh much more than the last ones. For example, if the word starts with a very different letter, the distance will be much larger.' },
			{ question: 'Is Hidden Word a single-player game?', answer: 'Yes, Hidden Word is an individual word game. You compete against yourself to guess the secret word in the fewest attempts possible. It\'s perfect for playing alone anytime, like a daily vocabulary challenge.' },
			{ question: 'What word categories does Hidden Word have?', answer: 'Hidden Word offers categories like Animals, Food, Countries, Sports, Professions, Objects and more. You can choose a specific category or play with a random one for an extra challenge. There are hundreds of words in Spanish and English.' },
		],
	},
	'tragos-locos': {
		description:
			'Tragos Locos is the ultimate drinking game and challenge game for parties, gatherings and pre-parties. With hundreds of challenge cards, daring questions, truth or dare and multiple game modes, it\'s the definitive party game. Tragos Locos has modes like PreParty (warmup), Tragos Locos (the classic), Best Friends (for close friends) and Hot (for couples and adults). With over 393 questions and challenges, every game is different. It supports 2+ players in large groups, can be played without alcohol by substituting drinks with other fun penalties, and has a free version. If you\'re looking for drinking games, party games or pre-party games, Tragos Locos is the best choice.',
		faqs: [
			{ question: 'What game modes does Tragos Locos have?', answer: 'Tragos Locos has several game modes: PreParty (perfect for warming up), Tragos Locos (the classic mode with varied challenges and questions), Best Friends (questions to get to know your friends better) and Hot (mode for couples and adults with spicy questions). Each mode has its own style and intensity level.' },
			{ question: 'Can you play Tragos Locos without alcohol?', answer: 'Yes, Tragos Locos can be played perfectly without alcohol. You can substitute drinks with any other fun penalty: exercise, eat something spicy, sing a song... The challenge game is just as entertaining without alcoholic drinks.' },
			{ question: 'How many people can play Tragos Locos?', answer: 'Tragos Locos can be played from 2 people to large groups with no limit. The party game adapts automatically to the number of players. It\'s ideal for both an intimate pre-party and a big party.' },
			{ question: 'Is Tragos Locos free?', answer: 'Tragos Locos has a free version with access to a limited number of questions and challenges. The premium version unlocks all game modes, all questions and exclusive features. It\'s the most complete drinking game on the market.' },
		],
	},
	crossword: {
		description:
			'Multiplayer Crossword is a competitive word game to play with friends online. In this free online crossword, a procedural board is generated with words from different categories (animals, food, geography, sports, science, professions). Players compete in real time to solve crossword clues — each word can only be solved by one player! The player who completes the most words wins. You can also play in single-player mode. The crossword has different board sizes (9×9, 13×13, 15×15), plays directly in the browser with no download needed, and is perfect as a group game, game for friends or individual pastime.',
		faqs: [
			{ question: 'How does Multiplayer Crossword work?', answer: 'A procedural crossword is generated with words from different categories. All players see the same board and compete to solve the clues. When a player correctly solves a word, it\'s revealed for everyone and only that player scores. The player who solves the most words wins.' },
			{ question: 'Can you play the Crossword alone?', answer: 'Yes, the Crossword has a single-player mode where you can solve the entire board at your own pace. Perfect as a pastime or to practice vocabulary.' },
			{ question: 'What board sizes does the Crossword have?', answer: 'The Crossword offers three board sizes: Small (9×9), Medium (13×13) and Large (15×15). Larger boards have more words and are more challenging.' },
			{ question: 'Is the Crossword free?', answer: 'Yes, Multiplayer Crossword is completely free. It plays directly in the browser with no app download needed.' },
		],
	},
	probable: {
		description:
			'Most Likely To is a free online social voting game perfect for parties, gatherings and hangouts with friends. A fun question appears like "Who is most likely to...?" and everyone votes on who in the group best fits. The votes are revealed and whoever gets the most votes scores a point. It\'s ideal for getting to know your friend group better, breaking the ice and having a good laugh. Plays from 2 players, in local mode passing the phone or online with each player on their own device.',
		faqs: [
			{ question: 'How do you play Most Likely To?', answer: 'A fun question appears like "Who is most likely to...?" and each player votes for who they think best fits. Votes are revealed and whoever gets the most votes scores a point. The player with the most points at the end wins.' },
			{ question: 'How many players do you need?', answer: 'You need at least 2 players. The game is more fun with groups of 4 or more. There\'s no maximum player limit.' },
			{ question: 'Is it free?', answer: 'Yes, Most Likely To is completely free. Play in the browser with no app download needed.' },
		],
	},
	spyfall: {
		description:
			'Impostor Location is a free online Spyfall-style social deduction game, perfect for parties and gatherings. All players receive the same secret location (Hospital, Airport, Beach...) except the spy, who doesn\'t know where they are. The group asks questions to find the spy, while the spy tries to guess the location. If the group correctly votes out the spy, they win; if the spy guesses the location, they win. Plays with 3-12 people, free in the browser.',
		faqs: [
			{ question: 'How do you play Impostor Location?', answer: 'Each player receives a secret location (except the spy who gets ???). During question rounds, the group tries to identify the spy without revealing the location. The spy observes answers to try to figure out where they are.' },
			{ question: 'How is it different from The Impostor?', answer: 'In Impostor Location, the spy receives no hint at all — they only know they\'re the spy. Locations are more concrete (real places) and the spy can try to guess the location to win, even if they\'re caught.' },
			{ question: 'How many players do you need?', answer: 'You need at least 3 players. The game works best with 5-8 people. Supports up to 12 players.' },
		],
	},
	wordle: {
		description:
			'Wordle Battle is a free multiplayer game inspired by Wordle. Each player tries to guess the same secret 5-letter word in 6 attempts. Letters are colored: green (correct position), yellow (present but wrong position), gray (absent). Whoever guesses first or with fewer attempts wins. Perfect for playing with friends in the browser.',
		faqs: [
			{ question: 'How do you play Wordle Battle?', answer: 'Each player types 5-letter words taking turns. After each guess, letters are colored to indicate if they are in the correct position (green), present in the word (yellow), or absent (gray). The player who guesses the word with the fewest attempts wins.' },
			{ question: 'How many attempts do you get?', answer: 'Each player gets 6 attempts to guess the secret 5-letter word.' },
			{ question: 'Is it free to play?', answer: 'Yes, Wordle Battle is completely free. It plays directly in the browser with no download needed.' },
		],
	},
};

export function getGameSeo(gameId: string, locale: string): GameSeo | null {
	const map = locale === 'en' ? SEO_EN : SEO_ES;
	return map[gameId] ?? null;
}
