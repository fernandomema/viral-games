/**
 * Word banks for El Impostor — framework-agnostic.
 * Each category has pairs: [citizenWord, impostorWord]
 * Supports ES and EN locales.
 */

import { getLocale } from '$lib/i18n';

export interface WordPair {
	citizen: string;
	impostor: string[];
}

export interface WordCategory {
	name: string;
	icon: string;
	pairs: WordPair[];
}

const WORD_CATEGORIES_ES: WordCategory[] = [
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

const WORD_CATEGORIES_EN: WordCategory[] = [
	{
		name: 'Places',
		icon: 'material-symbols--location-on',
		pairs: [
			{ citizen: 'Library', impostor: ['Bookstore', 'Archive', 'Reading room'] },
			{ citizen: 'Hospital', impostor: ['Clinic', 'Doctor\'s office', 'Infirmary'] },
			{ citizen: 'Beach', impostor: ['Pool', 'Lake', 'River'] },
			{ citizen: 'Cinema', impostor: ['Theater', 'Concert hall', 'Auditorium'] },
			{ citizen: 'Airport', impostor: ['Train station', 'Bus terminal', 'Seaport'] },
			{ citizen: 'Gym', impostor: ['Park', 'Court', 'Stadium'] },
			{ citizen: 'Museum', impostor: ['Gallery', 'Exhibition', 'Cultural center'] },
			{ citizen: 'Restaurant', impostor: ['Café', 'Bar', 'Diner'] },
			{ citizen: 'Church', impostor: ['Temple', 'Cathedral', 'Mosque'] },
			{ citizen: 'Supermarket', impostor: ['Market', 'Shop', 'Warehouse'] },
			{ citizen: 'School', impostor: ['University', 'Institute', 'Academy'] },
			{ citizen: 'Zoo', impostor: ['Aquarium', 'Nature reserve', 'Safari'] },
		],
	},
	{
		name: 'Food',
		icon: 'material-symbols--restaurant',
		pairs: [
			{ citizen: 'Pizza', impostor: ['Empanada', 'Calzone', 'Focaccia'] },
			{ citizen: 'Sushi', impostor: ['Ceviche', 'Sashimi', 'Poke'] },
			{ citizen: 'Burger', impostor: ['Sandwich', 'Hot dog', 'Wrap'] },
			{ citizen: 'Ice cream', impostor: ['Sorbet', 'Popsicle', 'Frozen yogurt'] },
			{ citizen: 'Coffee', impostor: ['Tea', 'Matcha', 'Hot chocolate'] },
			{ citizen: 'Paella', impostor: ['Risotto', 'Fried rice', 'Jambalaya'] },
			{ citizen: 'Tacos', impostor: ['Burritos', 'Quesadillas', 'Enchiladas'] },
			{ citizen: 'Croissant', impostor: ['Milk bread', 'Bagel', 'Brioche'] },
			{ citizen: 'Chocolate', impostor: ['Cocoa', 'Brownie', 'Truffle'] },
			{ citizen: 'Pasta', impostor: ['Noodles', 'Ramen', 'Udon'] },
		],
	},
	{
		name: 'Professions',
		icon: 'material-symbols--work',
		pairs: [
			{ citizen: 'Doctor', impostor: ['Nurse', 'Dentist', 'Veterinarian'] },
			{ citizen: 'Lawyer', impostor: ['Judge', 'Notary', 'Prosecutor'] },
			{ citizen: 'Firefighter', impostor: ['Paramedic', 'Rescuer', 'Lifeguard'] },
			{ citizen: 'Pilot', impostor: ['Captain', 'Co-pilot', 'Navigator'] },
			{ citizen: 'Chef', impostor: ['Baker', 'Pastry chef', 'Bartender'] },
			{ citizen: 'Police', impostor: ['Detective', 'Guard', 'Secret agent'] },
			{ citizen: 'Architect', impostor: ['Engineer', 'Designer', 'Builder'] },
			{ citizen: 'Photographer', impostor: ['Cameraman', 'Director', 'Video editor'] },
			{ citizen: 'Teacher', impostor: ['Tutor', 'Coach', 'Mentor'] },
			{ citizen: 'Astronaut', impostor: ['Pilot', 'Space scientist', 'Explorer'] },
		],
	},
	{
		name: 'Animals',
		icon: 'material-symbols--pets',
		pairs: [
			{ citizen: 'Dog', impostor: ['Wolf', 'Fox', 'Coyote'] },
			{ citizen: 'Cat', impostor: ['Panther', 'Lynx', 'Puma'] },
			{ citizen: 'Eagle', impostor: ['Hawk', 'Condor', 'Vulture'] },
			{ citizen: 'Dolphin', impostor: ['Shark', 'Whale', 'Orca'] },
			{ citizen: 'Elephant', impostor: ['Rhino', 'Hippo', 'Mammoth'] },
			{ citizen: 'Horse', impostor: ['Zebra', 'Donkey', 'Mule'] },
			{ citizen: 'Lion', impostor: ['Tiger', 'Leopard', 'Cheetah'] },
			{ citizen: 'Rabbit', impostor: ['Hare', 'Hamster', 'Guinea pig'] },
			{ citizen: 'Frog', impostor: ['Toad', 'Salamander', 'Newt'] },
			{ citizen: 'Monkey', impostor: ['Gorilla', 'Chimpanzee', 'Orangutan'] },
		],
	},
	{
		name: 'Sports',
		icon: 'material-symbols--sports-soccer',
		pairs: [
			{ citizen: 'Soccer', impostor: ['Rugby', 'American football', 'Hockey'] },
			{ citizen: 'Basketball', impostor: ['Volleyball', 'Handball', 'Water polo'] },
			{ citizen: 'Tennis', impostor: ['Badminton', 'Ping pong', 'Squash'] },
			{ citizen: 'Swimming', impostor: ['Diving', 'Surfing', 'Kayaking'] },
			{ citizen: 'Boxing', impostor: ['Karate', 'Judo', 'MMA'] },
			{ citizen: 'Cycling', impostor: ['Skating', 'Skateboarding', 'Scootering'] },
			{ citizen: 'Golf', impostor: ['Cricket', 'Polo', 'Croquet'] },
			{ citizen: 'Surfing', impostor: ['Windsurfing', 'Bodyboarding', 'Kitesurfing'] },
		],
	},
	{
		name: 'Objects',
		icon: 'material-symbols--category',
		pairs: [
			{ citizen: 'Guitar', impostor: ['Ukulele', 'Bass', 'Mandolin'] },
			{ citizen: 'Television', impostor: ['Monitor', 'Projector', 'Tablet'] },
			{ citizen: 'Watch', impostor: ['Stopwatch', 'Timer', 'Hourglass'] },
			{ citizen: 'Mirror', impostor: ['Window', 'Lens', 'Crystal'] },
			{ citizen: 'Book', impostor: ['Magazine', 'Newspaper', 'Comic'] },
			{ citizen: 'Chair', impostor: ['Sofa', 'Bench', 'Stool'] },
			{ citizen: 'Key', impostor: ['Padlock', 'Lock', 'Access card'] },
			{ citizen: 'Umbrella', impostor: ['Parasol', 'Raincoat', 'Poncho'] },
		],
	},
];

const WORD_DATA: Record<string, WordCategory[]> = {
	es: WORD_CATEGORIES_ES,
	en: WORD_CATEGORIES_EN,
};

export function getWordCategories(): WordCategory[] {
	return WORD_DATA[getLocale()] ?? WORD_CATEGORIES_ES;
}

/** @deprecated Use getWordCategories() for locale-aware categories */
export const WORD_CATEGORIES = WORD_CATEGORIES_ES;

export function getRandomPair(category?: string): { category: WordCategory; pair: WordPair; selectedImpostor: string } {
	const allCats = getWordCategories();
	const cats = category
		? allCats.filter((c) => c.name === category)
		: allCats;
	const cat = cats.length > 0 ? cats[Math.floor(Math.random() * cats.length)] : allCats[Math.floor(Math.random() * allCats.length)];
	const pair = cat.pairs[Math.floor(Math.random() * cat.pairs.length)];
	const selectedImpostor = pair.impostor[Math.floor(Math.random() * pair.impostor.length)];
	return { category: cat, pair, selectedImpostor };
}
