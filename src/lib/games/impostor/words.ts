/**
 * Word banks for El Impostor — framework-agnostic.
 * Each category has pairs: [citizenWord, impostorWord]
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

export const WORD_CATEGORIES: WordCategory[] = [
	{
		name: 'Lugares',
		icon: 'material-symbols--location-on',
		pairs: [
			{ citizen: 'Biblioteca', impostor: ['Librería', 'Archivo', 'Sala de lectura'] },
			{ citizen: 'Hospital', impostor: ['Clínica', 'Consultorio', 'Sanatorio'] },
			{ citizen: 'Playa', impostor: ['Piscina', 'Lago', 'Río'] },
			{ citizen: 'Cine', impostor: ['Teatro', 'Sala de conciertos', 'Auditorio'] },
			{ citizen: 'Aeropuerto', impostor: ['Estación de tren', 'Terminal de buses', 'Puerto'] },
			{ citizen: 'Gimnasio', impostor: ['Parque', 'Cancha', 'Estadio'] },
			{ citizen: 'Museo', impostor: ['Galería', 'Exposición', 'Centro cultural'] },
			{ citizen: 'Restaurante', impostor: ['Cafetería', 'Bar', 'Cantina'] },
			{ citizen: 'Iglesia', impostor: ['Templo', 'Catedral', 'Mezquita'] },
			{ citizen: 'Supermercado', impostor: ['Mercado', 'Tienda', 'Bodega'] },
			{ citizen: 'Escuela', impostor: ['Universidad', 'Instituto', 'Academia'] },
			{ citizen: 'Zoológico', impostor: ['Acuario', 'Reserva natural', 'Safari'] },
		],
	},
	{
		name: 'Comida',
		icon: 'material-symbols--restaurant',
		pairs: [
			{ citizen: 'Pizza', impostor: ['Empanada', 'Calzone', 'Focaccia'] },
			{ citizen: 'Sushi', impostor: ['Ceviche', 'Sashimi', 'Poke'] },
			{ citizen: 'Hamburguesa', impostor: ['Sándwich', 'Hot dog', 'Wrap'] },
			{ citizen: 'Helado', impostor: ['Sorbete', 'Paleta', 'Frozen yogurt'] },
			{ citizen: 'Café', impostor: ['Té', 'Mate', 'Chocolate caliente'] },
			{ citizen: 'Paella', impostor: ['Risotto', 'Arroz frito', 'Jambalaya'] },
			{ citizen: 'Tacos', impostor: ['Burritos', 'Quesadillas', 'Enchiladas'] },
			{ citizen: 'Croissant', impostor: ['Pan de leche', 'Bagel', 'Brioche'] },
			{ citizen: 'Chocolate', impostor: ['Cacao', 'Brownie', 'Trufa'] },
			{ citizen: 'Pasta', impostor: ['Fideos', 'Ramen', 'Tallarines'] },
		],
	},
	{
		name: 'Profesiones',
		icon: 'material-symbols--work',
		pairs: [
			{ citizen: 'Médico', impostor: ['Enfermero', 'Dentista', 'Veterinario'] },
			{ citizen: 'Abogado', impostor: ['Juez', 'Notario', 'Fiscal'] },
			{ citizen: 'Bombero', impostor: ['Paramédico', 'Rescatista', 'Socorrista'] },
			{ citizen: 'Piloto', impostor: ['Capitán', 'Copiloto', 'Navegante'] },
			{ citizen: 'Chef', impostor: ['Pastelero', 'Panadero', 'Bartender'] },
			{ citizen: 'Policía', impostor: ['Detective', 'Guardia', 'Agente secreto'] },
			{ citizen: 'Arquitecto', impostor: ['Ingeniero', 'Diseñador', 'Constructor'] },
			{ citizen: 'Fotógrafo', impostor: ['Camarógrafo', 'Director', 'Editor de video'] },
			{ citizen: 'Profesor', impostor: ['Tutor', 'Entrenador', 'Mentor'] },
			{ citizen: 'Astronauta', impostor: ['Piloto', 'Científico espacial', 'Explorador'] },
		],
	},
	{
		name: 'Animales',
		icon: 'material-symbols--pets',
		pairs: [
			{ citizen: 'Perro', impostor: ['Lobo', 'Zorro', 'Coyote'] },
			{ citizen: 'Gato', impostor: ['Pantera', 'Lince', 'Puma'] },
			{ citizen: 'Águila', impostor: ['Halcón', 'Cóndor', 'Buitre'] },
			{ citizen: 'Delfín', impostor: ['Tiburón', 'Ballena', 'Orca'] },
			{ citizen: 'Elefante', impostor: ['Rinoceronte', 'Hipopótamo', 'Mamut'] },
			{ citizen: 'Caballo', impostor: ['Cebra', 'Burro', 'Mula'] },
			{ citizen: 'León', impostor: ['Tigre', 'Leopardo', 'Guepardo'] },
			{ citizen: 'Conejo', impostor: ['Liebre', 'Hámster', 'Cobaya'] },
			{ citizen: 'Rana', impostor: ['Sapo', 'Salamandra', 'Tritón'] },
			{ citizen: 'Mono', impostor: ['Gorila', 'Chimpancé', 'Orangután'] },
		],
	},
	{
		name: 'Deportes',
		icon: 'material-symbols--sports-soccer',
		pairs: [
			{ citizen: 'Fútbol', impostor: ['Rugby', 'Fútbol americano', 'Hockey'] },
			{ citizen: 'Baloncesto', impostor: ['Voleibol', 'Handball', 'Waterpolo'] },
			{ citizen: 'Tenis', impostor: ['Bádminton', 'Ping pong', 'Squash'] },
			{ citizen: 'Natación', impostor: ['Buceo', 'Surf', 'Kayak'] },
			{ citizen: 'Boxeo', impostor: ['Karate', 'Judo', 'MMA'] },
			{ citizen: 'Ciclismo', impostor: ['Patinaje', 'Skateboard', 'Scooter'] },
			{ citizen: 'Golf', impostor: ['Críquet', 'Polo', 'Croquet'] },
			{ citizen: 'Surf', impostor: ['Windsurf', 'Bodyboard', 'Kitesurf'] },
		],
	},
	{
		name: 'Objetos',
		icon: 'material-symbols--category',
		pairs: [
			{ citizen: 'Guitarra', impostor: ['Ukelele', 'Bajo', 'Mandolina'] },
			{ citizen: 'Televisor', impostor: ['Monitor', 'Proyector', 'Tablet'] },
			{ citizen: 'Reloj', impostor: ['Cronómetro', 'Temporizador', 'Reloj de arena'] },
			{ citizen: 'Espejo', impostor: ['Ventana', 'Lente', 'Cristal'] },
			{ citizen: 'Libro', impostor: ['Revista', 'Periódico', 'Cómic'] },
			{ citizen: 'Silla', impostor: ['Sofá', 'Banco', 'Taburete'] },
			{ citizen: 'Llave', impostor: ['Candado', 'Cerradura', 'Tarjeta de acceso'] },
			{ citizen: 'Paraguas', impostor: ['Sombrilla', 'Impermeable', 'Chubasquero'] },
		],
	},
];

export function getRandomPair(category?: string): { category: WordCategory; pair: WordPair; selectedImpostor: string } {
	const cats = category
		? WORD_CATEGORIES.filter((c) => c.name === category)
		: WORD_CATEGORIES;
	const cat = cats[Math.floor(Math.random() * cats.length)];
	const pair = cat.pairs[Math.floor(Math.random() * cat.pairs.length)];
	const selectedImpostor = pair.impostor[Math.floor(Math.random() * pair.impostor.length)];
	return { category: cat, pair, selectedImpostor };
}
