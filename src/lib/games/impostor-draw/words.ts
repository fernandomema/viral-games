/**
 * Drawable word banks for Impostor Dibujo Edition.
 * Words are things that can actually be drawn.
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

export const DRAW_CATEGORIES: WordCategory[] = [
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

export function getRandomDrawPair(category?: string): { pair: WordPair; category: string; selectedImpostor: string } {
	let cats = DRAW_CATEGORIES;
	if (category) {
		const found = cats.find((c) => c.name === category);
		if (found) cats = [found];
	}
	const cat = cats[Math.floor(Math.random() * cats.length)];
	const pair = cat.pairs[Math.floor(Math.random() * cat.pairs.length)];
	const selectedImpostor = pair.impostor[Math.floor(Math.random() * pair.impostor.length)];
	return { pair, category: cat.name, selectedImpostor };
}
