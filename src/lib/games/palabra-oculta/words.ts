/**
 * Word bank for Palabra Oculta.
 * Each entry: [category, word]
 * Words should be common Spanish nouns/adjectives that players would guess.
 */

export interface WordEntry {
	category: string;
	word: string;
}

const WORDS_ES: WordEntry[] = [
	// Animales
	{ category: 'Animales', word: 'cocodrilo' },
	{ category: 'Animales', word: 'elefante' },
	{ category: 'Animales', word: 'mariposa' },
	{ category: 'Animales', word: 'delfín' },
	{ category: 'Animales', word: 'jirafa' },
	{ category: 'Animales', word: 'pingüino' },
	{ category: 'Animales', word: 'tortuga' },
	{ category: 'Animales', word: 'camaleón' },
	{ category: 'Animales', word: 'flamenco' },
	{ category: 'Animales', word: 'tiburón' },
	{ category: 'Animales', word: 'gorila' },
	{ category: 'Animales', word: 'serpiente' },
	{ category: 'Animales', word: 'caballo' },
	{ category: 'Animales', word: 'águila' },
	{ category: 'Animales', word: 'cangrejo' },

	// Comida
	{ category: 'Comida', word: 'chocolate' },
	{ category: 'Comida', word: 'hamburguesa' },
	{ category: 'Comida', word: 'espagueti' },
	{ category: 'Comida', word: 'paella' },
	{ category: 'Comida', word: 'croissant' },
	{ category: 'Comida', word: 'guacamole' },
	{ category: 'Comida', word: 'pizza' },
	{ category: 'Comida', word: 'empanada' },
	{ category: 'Comida', word: 'lasaña' },
	{ category: 'Comida', word: 'tortilla' },
	{ category: 'Comida', word: 'sushi' },
	{ category: 'Comida', word: 'helado' },
	{ category: 'Comida', word: 'ceviche' },
	{ category: 'Comida', word: 'panqueque' },
	{ category: 'Comida', word: 'albóndiga' },

	// Países
	{ category: 'Países', word: 'argentina' },
	{ category: 'Países', word: 'australia' },
	{ category: 'Países', word: 'brasil' },
	{ category: 'Países', word: 'canadá' },
	{ category: 'Países', word: 'japón' },
	{ category: 'Países', word: 'egipto' },
	{ category: 'Países', word: 'francia' },
	{ category: 'Países', word: 'noruega' },
	{ category: 'Países', word: 'portugal' },
	{ category: 'Países', word: 'tailandia' },
	{ category: 'Países', word: 'colombia' },
	{ category: 'Países', word: 'alemania' },
	{ category: 'Países', word: 'marruecos' },
	{ category: 'Países', word: 'indonesia' },
	{ category: 'Países', word: 'uruguay' },

	// Deportes
	{ category: 'Deportes', word: 'baloncesto' },
	{ category: 'Deportes', word: 'natación' },
	{ category: 'Deportes', word: 'ciclismo' },
	{ category: 'Deportes', word: 'esgrima' },
	{ category: 'Deportes', word: 'atletismo' },
	{ category: 'Deportes', word: 'gimnasia' },
	{ category: 'Deportes', word: 'voleibol' },
	{ category: 'Deportes', word: 'boxeo' },
	{ category: 'Deportes', word: 'surf' },
	{ category: 'Deportes', word: 'karate' },
	{ category: 'Deportes', word: 'hockey' },
	{ category: 'Deportes', word: 'balonmano' },
	{ category: 'Deportes', word: 'patinaje' },
	{ category: 'Deportes', word: 'escalada' },
	{ category: 'Deportes', word: 'tenis' },

	// Profesiones
	{ category: 'Profesiones', word: 'astronauta' },
	{ category: 'Profesiones', word: 'bombero' },
	{ category: 'Profesiones', word: 'detective' },
	{ category: 'Profesiones', word: 'electricista' },
	{ category: 'Profesiones', word: 'fotógrafo' },
	{ category: 'Profesiones', word: 'peluquero' },
	{ category: 'Profesiones', word: 'arquitecto' },
	{ category: 'Profesiones', word: 'carpintero' },
	{ category: 'Profesiones', word: 'veterinario' },
	{ category: 'Profesiones', word: 'piloto' },
	{ category: 'Profesiones', word: 'cocinero' },
	{ category: 'Profesiones', word: 'periodista' },
	{ category: 'Profesiones', word: 'profesor' },
	{ category: 'Profesiones', word: 'mecánico' },
	{ category: 'Profesiones', word: 'dentista' },

	// Objetos
	{ category: 'Objetos', word: 'telescopio' },
	{ category: 'Objetos', word: 'paraguas' },
	{ category: 'Objetos', word: 'brújula' },
	{ category: 'Objetos', word: 'microscopio' },
	{ category: 'Objetos', word: 'calculadora' },
	{ category: 'Objetos', word: 'despertador' },
	{ category: 'Objetos', word: 'semáforo' },
	{ category: 'Objetos', word: 'chimenea' },
	{ category: 'Objetos', word: 'colchón' },
	{ category: 'Objetos', word: 'escalera' },
	{ category: 'Objetos', word: 'tenedor' },
	{ category: 'Objetos', word: 'pizarra' },
	{ category: 'Objetos', word: 'martillo' },
	{ category: 'Objetos', word: 'candado' },
	{ category: 'Objetos', word: 'mochila' },

	// Naturaleza
	{ category: 'Naturaleza', word: 'volcán' },
	{ category: 'Naturaleza', word: 'cascada' },
	{ category: 'Naturaleza', word: 'arcoíris' },
	{ category: 'Naturaleza', word: 'huracán' },
	{ category: 'Naturaleza', word: 'montaña' },
	{ category: 'Naturaleza', word: 'glaciar' },
	{ category: 'Naturaleza', word: 'océano' },
	{ category: 'Naturaleza', word: 'desierto' },
	{ category: 'Naturaleza', word: 'relámpago' },
	{ category: 'Naturaleza', word: 'terremoto' },
	{ category: 'Naturaleza', word: 'amanecer' },
	{ category: 'Naturaleza', word: 'girasol' },
	{ category: 'Naturaleza', word: 'tsunami' },
	{ category: 'Naturaleza', word: 'cactus' },
	{ category: 'Naturaleza', word: 'pradera' },

	// Música
	{ category: 'Música', word: 'guitarra' },
	{ category: 'Música', word: 'trompeta' },
	{ category: 'Música', word: 'violín' },
	{ category: 'Música', word: 'batería' },
	{ category: 'Música', word: 'saxofón' },
	{ category: 'Música', word: 'acordeón' },
	{ category: 'Música', word: 'pandero' },
	{ category: 'Música', word: 'maracas' },
	{ category: 'Música', word: 'arpa' },
	{ category: 'Música', word: 'flauta' },
];

const WORDS_EN: WordEntry[] = [
	// Animals
	{ category: 'Animals', word: 'crocodile' },
	{ category: 'Animals', word: 'elephant' },
	{ category: 'Animals', word: 'butterfly' },
	{ category: 'Animals', word: 'dolphin' },
	{ category: 'Animals', word: 'giraffe' },
	{ category: 'Animals', word: 'penguin' },
	{ category: 'Animals', word: 'turtle' },
	{ category: 'Animals', word: 'chameleon' },
	{ category: 'Animals', word: 'flamingo' },
	{ category: 'Animals', word: 'shark' },
	{ category: 'Animals', word: 'gorilla' },
	{ category: 'Animals', word: 'serpent' },
	{ category: 'Animals', word: 'horse' },
	{ category: 'Animals', word: 'eagle' },
	{ category: 'Animals', word: 'crab' },

	// Food
	{ category: 'Food', word: 'chocolate' },
	{ category: 'Food', word: 'hamburger' },
	{ category: 'Food', word: 'spaghetti' },
	{ category: 'Food', word: 'pancake' },
	{ category: 'Food', word: 'croissant' },
	{ category: 'Food', word: 'guacamole' },
	{ category: 'Food', word: 'pizza' },
	{ category: 'Food', word: 'lasagna' },
	{ category: 'Food', word: 'tortilla' },
	{ category: 'Food', word: 'sushi' },
	{ category: 'Food', word: 'pretzel' },
	{ category: 'Food', word: 'muffin' },
	{ category: 'Food', word: 'waffle' },
	{ category: 'Food', word: 'burrito' },
	{ category: 'Food', word: 'dumpling' },

	// Countries
	{ category: 'Countries', word: 'argentina' },
	{ category: 'Countries', word: 'australia' },
	{ category: 'Countries', word: 'brazil' },
	{ category: 'Countries', word: 'canada' },
	{ category: 'Countries', word: 'japan' },
	{ category: 'Countries', word: 'egypt' },
	{ category: 'Countries', word: 'france' },
	{ category: 'Countries', word: 'norway' },
	{ category: 'Countries', word: 'portugal' },
	{ category: 'Countries', word: 'thailand' },
	{ category: 'Countries', word: 'colombia' },
	{ category: 'Countries', word: 'germany' },
	{ category: 'Countries', word: 'morocco' },
	{ category: 'Countries', word: 'indonesia' },
	{ category: 'Countries', word: 'uruguay' },

	// Sports
	{ category: 'Sports', word: 'basketball' },
	{ category: 'Sports', word: 'swimming' },
	{ category: 'Sports', word: 'cycling' },
	{ category: 'Sports', word: 'fencing' },
	{ category: 'Sports', word: 'athletics' },
	{ category: 'Sports', word: 'gymnastics' },
	{ category: 'Sports', word: 'volleyball' },
	{ category: 'Sports', word: 'boxing' },
	{ category: 'Sports', word: 'surfing' },
	{ category: 'Sports', word: 'karate' },
	{ category: 'Sports', word: 'hockey' },
	{ category: 'Sports', word: 'handball' },
	{ category: 'Sports', word: 'skating' },
	{ category: 'Sports', word: 'climbing' },
	{ category: 'Sports', word: 'tennis' },

	// Professions
	{ category: 'Professions', word: 'astronaut' },
	{ category: 'Professions', word: 'firefighter' },
	{ category: 'Professions', word: 'detective' },
	{ category: 'Professions', word: 'electrician' },
	{ category: 'Professions', word: 'photographer' },
	{ category: 'Professions', word: 'architect' },
	{ category: 'Professions', word: 'carpenter' },
	{ category: 'Professions', word: 'veterinarian' },
	{ category: 'Professions', word: 'pilot' },
	{ category: 'Professions', word: 'journalist' },

	// Objects
	{ category: 'Objects', word: 'telescope' },
	{ category: 'Objects', word: 'umbrella' },
	{ category: 'Objects', word: 'compass' },
	{ category: 'Objects', word: 'microscope' },
	{ category: 'Objects', word: 'calculator' },
	{ category: 'Objects', word: 'chimney' },
	{ category: 'Objects', word: 'mattress' },
	{ category: 'Objects', word: 'ladder' },
	{ category: 'Objects', word: 'hammer' },
	{ category: 'Objects', word: 'backpack' },

	// Nature
	{ category: 'Nature', word: 'volcano' },
	{ category: 'Nature', word: 'waterfall' },
	{ category: 'Nature', word: 'rainbow' },
	{ category: 'Nature', word: 'hurricane' },
	{ category: 'Nature', word: 'mountain' },
	{ category: 'Nature', word: 'glacier' },
	{ category: 'Nature', word: 'ocean' },
	{ category: 'Nature', word: 'desert' },
	{ category: 'Nature', word: 'lightning' },
	{ category: 'Nature', word: 'earthquake' },

	// Music
	{ category: 'Music', word: 'guitar' },
	{ category: 'Music', word: 'trumpet' },
	{ category: 'Music', word: 'violin' },
	{ category: 'Music', word: 'drums' },
	{ category: 'Music', word: 'saxophone' },
	{ category: 'Music', word: 'accordion' },
	{ category: 'Music', word: 'tambourine' },
	{ category: 'Music', word: 'maracas' },
	{ category: 'Music', word: 'harp' },
	{ category: 'Music', word: 'flute' },
];

export function getWords(locale: string): WordEntry[] {
	return locale === 'en' ? WORDS_EN : WORDS_ES;
}

export function getCategories(locale: string): string[] {
	const words = getWords(locale);
	return [...new Set(words.map(w => w.category))];
}

export function getRandomWord(locale: string, category?: string): WordEntry {
	const words = getWords(locale);
	const filtered = category ? words.filter(w => w.category === category) : words;
	return filtered[Math.floor(Math.random() * filtered.length)];
}
