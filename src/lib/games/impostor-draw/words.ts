/**
 * Drawable word banks for Impostor Dibujo Edition.
 * Words are things that can actually be drawn.
 * Supports ES and EN locales.
 */



export interface WordPair {
	citizen: string;
	impostor: string[];
}

export interface WordCategory {
	name: string;
	icon: string;
	pairs: WordPair[];
}

const DRAW_CATEGORIES_ES: WordCategory[] = [
	{
		name: 'Animales',
		icon: 'material-symbols--pets',
		pairs: [
			{ citizen: 'Gato', impostor: ['Perro', 'Conejo', 'Hamster'] },
			{ citizen: 'Pez', impostor: ['Ballena', 'Delfín', 'Tiburón'] },
			{ citizen: 'Araña', impostor: ['Cangrejo', 'Escorpión', 'Hormiga'] },
			{ citizen: 'Mariposa', impostor: ['Libélula', 'Abeja', 'Mariquita'] },
			{ citizen: 'Serpiente', impostor: ['Gusano', 'Lagartija', 'Anguila'] },
			{ citizen: 'Pájaro', impostor: ['Murciélago', 'Avión de papel', 'Mosca'] },
			{ citizen: 'Tortuga', impostor: ['Caracol', 'Cangrejo ermitaño', 'Armadillo'] },
			{ citizen: 'Elefante', impostor: ['Hipopótamo', 'Rinoceronte', 'Mamut'] },
			{ citizen: 'Pulpo', impostor: ['Medusa', 'Calamar', 'Estrella de mar'] },
			{ citizen: 'Mono', impostor: ['Oso', 'Koala', 'Perezoso'] },
		],
	},
	{
		name: 'Objetos',
		icon: 'material-symbols--inventory-2',
		pairs: [
			{ citizen: 'Paraguas', impostor: ['Seta', 'Paracaídas', 'Sombrilla'] },
			{ citizen: 'Guitarra', impostor: ['Violín', 'Banjo', 'Arpa'] },
			{ citizen: 'Llave', impostor: ['Candado', 'Llave inglesa', 'Cerradura'] },
			{ citizen: 'Tijeras', impostor: ['Cuchillo', 'Navaja', 'Alicates'] },
			{ citizen: 'Reloj', impostor: ['Brújula', 'Cronómetro', 'Reloj de arena'] },
			{ citizen: 'Bombilla', impostor: ['Vela', 'Linterna', 'Lámpara'] },
			{ citizen: 'Cámara', impostor: ['Televisor', 'Prismáticos', 'Microscopio'] },
			{ citizen: 'Corona', impostor: ['Sombrero', 'Casco', 'Tiara'] },
			{ citizen: 'Espada', impostor: ['Flecha', 'Hacha', 'Tridente'] },
			{ citizen: 'Escalera', impostor: ['Puente', 'Tobogán', 'Rampa'] },
		],
	},
	{
		name: 'Comida',
		icon: 'material-symbols--restaurant',
		pairs: [
			{ citizen: 'Pizza', impostor: ['Pastel', 'Quiche', 'Tortilla'] },
			{ citizen: 'Manzana', impostor: ['Cereza', 'Tomate', 'Melocotón'] },
			{ citizen: 'Hamburguesa', impostor: ['Taco', 'Sándwich', 'Kebab'] },
			{ citizen: 'Helado', impostor: ['Cupcake', 'Paleta', 'Mousse'] },
			{ citizen: 'Banana', impostor: ['Zanahoria', 'Pepino', 'Berenjena'] },
			{ citizen: 'Huevo frito', impostor: ['Panqueque', 'Tortita', 'Crepe'] },
			{ citizen: 'Donut', impostor: ['Pretzel', 'Bagel', 'Rosquilla'] },
			{ citizen: 'Sandía', impostor: ['Piña', 'Melón', 'Coco'] },
			{ citizen: 'Hot dog', impostor: ['Burrito', 'Spring roll', 'Churro'] },
			{ citizen: 'Sushi', impostor: ['Tostada', 'Bruschetta', 'Nigiri'] },
		],
	},
	{
		name: 'Lugares',
		icon: 'material-symbols--location-on',
		pairs: [
			{ citizen: 'Casa', impostor: ['Castillo', 'Iglú', 'Choza'] },
			{ citizen: 'Isla', impostor: ['Montaña', 'Colina', 'Volcán'] },
			{ citizen: 'Cohete', impostor: ['Avión', 'Helicóptero', 'Globo'] },
			{ citizen: 'Barco', impostor: ['Submarino', 'Canoa', 'Balsa'] },
			{ citizen: 'Iglesia', impostor: ['Mezquita', 'Pagoda', 'Templo'] },
			{ citizen: 'Faro', impostor: ['Torre', 'Columna', 'Antena'] },
			{ citizen: 'Volcán', impostor: ['Pirámide', 'Montaña', 'Géiser'] },
			{ citizen: 'Tienda de campaña', impostor: ['Cabaña', 'Iglú', 'Refugio'] },
			{ citizen: 'Noria', impostor: ['Carrusel', 'Montaña rusa', 'Columpio'] },
			{ citizen: 'Puente', impostor: ['Túnel', 'Acueducto', 'Arco'] },
		],
	},
	{
		name: 'Naturaleza',
		icon: 'material-symbols--park',
		pairs: [
			{ citizen: 'Árbol', impostor: ['Cactus', 'Palmera', 'Bambú'] },
			{ citizen: 'Sol', impostor: ['Luna', 'Estrella', 'Planeta'] },
			{ citizen: 'Flor', impostor: ['Hongo', 'Trébol', 'Rosa'] },
			{ citizen: 'Nube', impostor: ['Rayo', 'Neblina', 'Humo'] },
			{ citizen: 'Estrella', impostor: ['Cometa', 'Meteorito', 'Planeta'] },
			{ citizen: 'Arcoíris', impostor: ['Tornado', 'Aurora boreal', 'Remolino'] },
			{ citizen: 'Olas', impostor: ['Cascada', 'Río', 'Maremoto'] },
			{ citizen: 'Hoja', impostor: ['Pluma', 'Pétalo', 'Ala'] },
			{ citizen: 'Fuego', impostor: ['Hielo', 'Lava', 'Chispa'] },
			{ citizen: 'Tela de araña', impostor: ['Nido', 'Red', 'Telaraña'] },
		],
	},
	{
		name: 'Personas',
		icon: 'material-symbols--person',
		pairs: [
			{ citizen: 'Robot', impostor: ['Alien', 'Cyborg', 'Androide'] },
			{ citizen: 'Pirata', impostor: ['Vikingo', 'Marinero', 'Corsario'] },
			{ citizen: 'Payaso', impostor: ['Mago', 'Mimo', 'Arlequín'] },
			{ citizen: 'Fantasma', impostor: ['Vampiro', 'Zombie', 'Momia'] },
			{ citizen: 'Rey', impostor: ['Príncipe', 'Emperador', 'Faraón'] },
			{ citizen: 'Ninja', impostor: ['Samurái', 'Gladiador', 'Espadachín'] },
			{ citizen: 'Sirena', impostor: ['Hada', 'Unicornio', 'Ángel'] },
			{ citizen: 'Superhéroe', impostor: ['Villano', 'Antihéroe', 'Mutante'] },
			{ citizen: 'Astronauta', impostor: ['Buzo', 'Piloto', 'Explorador'] },
			{ citizen: 'Bruja', impostor: ['Monstruo', 'Duende', 'Ogro'] },
		],
	},
];

const DRAW_CATEGORIES_EN: WordCategory[] = [
	{
		name: 'Animals',
		icon: 'material-symbols--pets',
		pairs: [
			{ citizen: 'Cat', impostor: ['Dog', 'Rabbit', 'Hamster'] },
			{ citizen: 'Fish', impostor: ['Whale', 'Dolphin', 'Shark'] },
			{ citizen: 'Spider', impostor: ['Crab', 'Scorpion', 'Ant'] },
			{ citizen: 'Butterfly', impostor: ['Dragonfly', 'Bee', 'Ladybug'] },
			{ citizen: 'Snake', impostor: ['Worm', 'Lizard', 'Eel'] },
			{ citizen: 'Bird', impostor: ['Bat', 'Paper plane', 'Fly'] },
			{ citizen: 'Turtle', impostor: ['Snail', 'Hermit crab', 'Armadillo'] },
			{ citizen: 'Elephant', impostor: ['Hippo', 'Rhino', 'Mammoth'] },
			{ citizen: 'Octopus', impostor: ['Jellyfish', 'Squid', 'Starfish'] },
			{ citizen: 'Monkey', impostor: ['Bear', 'Koala', 'Sloth'] },
		],
	},
	{
		name: 'Objects',
		icon: 'material-symbols--inventory-2',
		pairs: [
			{ citizen: 'Umbrella', impostor: ['Mushroom', 'Parachute', 'Parasol'] },
			{ citizen: 'Guitar', impostor: ['Violin', 'Banjo', 'Harp'] },
			{ citizen: 'Key', impostor: ['Padlock', 'Wrench', 'Lock'] },
			{ citizen: 'Scissors', impostor: ['Knife', 'Razor', 'Pliers'] },
			{ citizen: 'Clock', impostor: ['Compass', 'Stopwatch', 'Hourglass'] },
			{ citizen: 'Light bulb', impostor: ['Candle', 'Flashlight', 'Lamp'] },
			{ citizen: 'Camera', impostor: ['Television', 'Binoculars', 'Microscope'] },
			{ citizen: 'Crown', impostor: ['Hat', 'Helmet', 'Tiara'] },
			{ citizen: 'Sword', impostor: ['Arrow', 'Axe', 'Trident'] },
			{ citizen: 'Ladder', impostor: ['Bridge', 'Slide', 'Ramp'] },
		],
	},
	{
		name: 'Food',
		icon: 'material-symbols--restaurant',
		pairs: [
			{ citizen: 'Pizza', impostor: ['Pie', 'Quiche', 'Tortilla'] },
			{ citizen: 'Apple', impostor: ['Cherry', 'Tomato', 'Peach'] },
			{ citizen: 'Burger', impostor: ['Taco', 'Sandwich', 'Kebab'] },
			{ citizen: 'Ice cream', impostor: ['Cupcake', 'Popsicle', 'Mousse'] },
			{ citizen: 'Banana', impostor: ['Carrot', 'Cucumber', 'Eggplant'] },
			{ citizen: 'Fried egg', impostor: ['Pancake', 'Waffle', 'Crepe'] },
			{ citizen: 'Donut', impostor: ['Pretzel', 'Bagel', 'Ring cake'] },
			{ citizen: 'Watermelon', impostor: ['Pineapple', 'Melon', 'Coconut'] },
			{ citizen: 'Hot dog', impostor: ['Burrito', 'Spring roll', 'Churro'] },
			{ citizen: 'Sushi', impostor: ['Toast', 'Bruschetta', 'Nigiri'] },
		],
	},
	{
		name: 'Places',
		icon: 'material-symbols--location-on',
		pairs: [
			{ citizen: 'House', impostor: ['Castle', 'Igloo', 'Hut'] },
			{ citizen: 'Island', impostor: ['Mountain', 'Hill', 'Volcano'] },
			{ citizen: 'Rocket', impostor: ['Airplane', 'Helicopter', 'Balloon'] },
			{ citizen: 'Ship', impostor: ['Submarine', 'Canoe', 'Raft'] },
			{ citizen: 'Church', impostor: ['Mosque', 'Pagoda', 'Temple'] },
			{ citizen: 'Lighthouse', impostor: ['Tower', 'Column', 'Antenna'] },
			{ citizen: 'Volcano', impostor: ['Pyramid', 'Mountain', 'Geyser'] },
			{ citizen: 'Tent', impostor: ['Cabin', 'Igloo', 'Shelter'] },
			{ citizen: 'Ferris wheel', impostor: ['Carousel', 'Roller coaster', 'Swing'] },
			{ citizen: 'Bridge', impostor: ['Tunnel', 'Aqueduct', 'Arch'] },
		],
	},
	{
		name: 'Nature',
		icon: 'material-symbols--park',
		pairs: [
			{ citizen: 'Tree', impostor: ['Cactus', 'Palm tree', 'Bamboo'] },
			{ citizen: 'Sun', impostor: ['Moon', 'Star', 'Planet'] },
			{ citizen: 'Flower', impostor: ['Mushroom', 'Clover', 'Rose'] },
			{ citizen: 'Cloud', impostor: ['Lightning', 'Fog', 'Smoke'] },
			{ citizen: 'Star', impostor: ['Comet', 'Meteor', 'Planet'] },
			{ citizen: 'Rainbow', impostor: ['Tornado', 'Northern lights', 'Whirlpool'] },
			{ citizen: 'Waves', impostor: ['Waterfall', 'River', 'Tsunami'] },
			{ citizen: 'Leaf', impostor: ['Feather', 'Petal', 'Wing'] },
			{ citizen: 'Fire', impostor: ['Ice', 'Lava', 'Spark'] },
			{ citizen: 'Spiderweb', impostor: ['Nest', 'Net', 'Web'] },
		],
	},
	{
		name: 'People',
		icon: 'material-symbols--person',
		pairs: [
			{ citizen: 'Robot', impostor: ['Alien', 'Cyborg', 'Android'] },
			{ citizen: 'Pirate', impostor: ['Viking', 'Sailor', 'Corsair'] },
			{ citizen: 'Clown', impostor: ['Magician', 'Mime', 'Jester'] },
			{ citizen: 'Ghost', impostor: ['Vampire', 'Zombie', 'Mummy'] },
			{ citizen: 'King', impostor: ['Prince', 'Emperor', 'Pharaoh'] },
			{ citizen: 'Ninja', impostor: ['Samurai', 'Gladiator', 'Swordsman'] },
			{ citizen: 'Mermaid', impostor: ['Fairy', 'Unicorn', 'Angel'] },
			{ citizen: 'Superhero', impostor: ['Villain', 'Antihero', 'Mutant'] },
			{ citizen: 'Astronaut', impostor: ['Diver', 'Pilot', 'Explorer'] },
			{ citizen: 'Witch', impostor: ['Monster', 'Goblin', 'Ogre'] },
		],
	},
];

const DRAW_DATA: Record<string, WordCategory[]> = {
	es: DRAW_CATEGORIES_ES,
	en: DRAW_CATEGORIES_EN,
};

export function getDrawCategories(locale: string = 'es'): WordCategory[] {
	return DRAW_DATA[locale] ?? DRAW_CATEGORIES_ES;
}

/** @deprecated Use getDrawCategories() for locale-aware categories */
export const DRAW_CATEGORIES = DRAW_CATEGORIES_ES;

export function getRandomDrawPair(category?: string, locale: string = 'es'): { pair: WordPair; category: string; selectedImpostor: string } {
	const allCats = getDrawCategories(locale);
	let cats = allCats;
	if (category) {
		const found = cats.find((c) => c.name === category);
		if (found) cats = [found];
	}
	const cat = cats[Math.floor(Math.random() * cats.length)];
	const pair = cat.pairs[Math.floor(Math.random() * cat.pairs.length)];
	const selectedImpostor = pair.impostor[Math.floor(Math.random() * pair.impostor.length)];
	return { pair, category: cat.name, selectedImpostor };
}
