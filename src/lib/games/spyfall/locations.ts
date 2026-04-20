/**
 * Location banks for Spyfall (Impostor Ubicación).
 * Uses the same WordPair/WordCategory interfaces as impostor for engine compatibility.
 */

import type { WordPair, WordCategory } from '../impostor/words.js';

const LOCATIONS_ES: WordCategory[] = [
	{
		name: 'Todos',
		icon: 'material-symbols--public',
		pairs: [
			{ citizen: 'Hospital', impostor: ['Clínica', 'Consultorio'] },
			{ citizen: 'Aeropuerto', impostor: ['Estación de tren', 'Terminal'] },
			{ citizen: 'Playa', impostor: ['Piscina', 'Lago'] },
			{ citizen: 'Casino', impostor: ['Sala de juegos', 'Bingo'] },
			{ citizen: 'Circo', impostor: ['Feria', 'Parque de diversiones'] },
			{ citizen: 'Banco', impostor: ['Oficina de correos', 'Notaría'] },
			{ citizen: 'Escuela', impostor: ['Universidad', 'Guardería'] },
			{ citizen: 'Supermercado', impostor: ['Mercado', 'Tienda'] },
			{ citizen: 'Iglesia', impostor: ['Templo', 'Catedral'] },
			{ citizen: 'Spa', impostor: ['Sauna', 'Baño turco'] },
			{ citizen: 'Estación espacial', impostor: ['Laboratorio', 'Observatorio'] },
			{ citizen: 'Submarino', impostor: ['Barco', 'Lancha'] },
			{ citizen: 'Zoológico', impostor: ['Acuario', 'Safari'] },
			{ citizen: 'Comisaría', impostor: ['Juzgado', 'Cárcel'] },
			{ citizen: 'Cementerio', impostor: ['Iglesia', 'Mausoleo'] },
			{ citizen: 'Biblioteca', impostor: ['Librería', 'Archivo'] },
			{ citizen: 'Estadio de fútbol', impostor: ['Cancha', 'Pista de atletismo'] },
			{ citizen: 'Hotel', impostor: ['Hostal', 'Resort'] },
			{ citizen: 'Restaurante', impostor: ['Cafetería', 'Bar'] },
			{ citizen: 'Museo', impostor: ['Galería', 'Centro cultural'] },
			{ citizen: 'Crucero', impostor: ['Ferry', 'Yate'] },
			{ citizen: 'Base militar', impostor: ['Cuartel', 'Bunker'] },
			{ citizen: 'Set de película', impostor: ['Teatro', 'Estudio de TV'] },
			{ citizen: 'Avión', impostor: ['Helicóptero', 'Globo aerostático'] },
			{ citizen: 'Tren', impostor: ['Metro', 'Tranvía'] },
			{ citizen: 'Embajada', impostor: ['Consulado', 'Oficina de gobierno'] },
			{ citizen: 'Pizzería', impostor: ['Hamburguesería', 'Food truck'] },
			{ citizen: 'Barbería', impostor: ['Peluquería', 'Salón de belleza'] },
			{ citizen: 'Parque de diversiones', impostor: ['Feria', 'Circo'] },
			{ citizen: 'Gimnasio', impostor: ['Dojo', 'Pista de patinaje'] },
			{ citizen: 'Laboratorio', impostor: ['Farmacia', 'Hospital'] },
			{ citizen: 'Cine', impostor: ['Teatro', 'Sala de conciertos'] },
			{ citizen: 'Discoteca', impostor: ['Bar', 'Karaoke'] },
			{ citizen: 'Boda', impostor: ['Quinceañera', 'Fiesta de cumpleaños'] },
			{ citizen: 'Funeral', impostor: ['Velorio', 'Misa'] },
			{ citizen: 'Campamento', impostor: ['Cabaña', 'Refugio'] },
			{ citizen: 'Polo Norte', impostor: ['Antártida', 'Siberia'] },
			{ citizen: 'Desierto', impostor: ['Sabana', 'Estepa'] },
			{ citizen: 'Colegio de magia', impostor: ['Castillo', 'Torre'] },
			{ citizen: 'Pirámide', impostor: ['Templo maya', 'Ruinas'] },
		],
	},
];

const LOCATIONS_EN: WordCategory[] = [
	{
		name: 'All',
		icon: 'material-symbols--public',
		pairs: [
			{ citizen: 'Hospital', impostor: ['Clinic', 'Doctor\'s office'] },
			{ citizen: 'Airport', impostor: ['Train station', 'Bus terminal'] },
			{ citizen: 'Beach', impostor: ['Pool', 'Lake'] },
			{ citizen: 'Casino', impostor: ['Arcade', 'Bingo hall'] },
			{ citizen: 'Circus', impostor: ['Fair', 'Amusement park'] },
			{ citizen: 'Bank', impostor: ['Post office', 'Notary'] },
			{ citizen: 'School', impostor: ['University', 'Daycare'] },
			{ citizen: 'Supermarket', impostor: ['Market', 'Corner store'] },
			{ citizen: 'Church', impostor: ['Temple', 'Cathedral'] },
			{ citizen: 'Spa', impostor: ['Sauna', 'Turkish bath'] },
			{ citizen: 'Space Station', impostor: ['Laboratory', 'Observatory'] },
			{ citizen: 'Submarine', impostor: ['Ship', 'Boat'] },
			{ citizen: 'Zoo', impostor: ['Aquarium', 'Safari'] },
			{ citizen: 'Police Station', impostor: ['Courthouse', 'Prison'] },
			{ citizen: 'Cemetery', impostor: ['Church', 'Mausoleum'] },
			{ citizen: 'Library', impostor: ['Bookstore', 'Archive'] },
			{ citizen: 'Soccer Stadium', impostor: ['Court', 'Track'] },
			{ citizen: 'Hotel', impostor: ['Hostel', 'Resort'] },
			{ citizen: 'Restaurant', impostor: ['Café', 'Bar'] },
			{ citizen: 'Museum', impostor: ['Gallery', 'Cultural center'] },
			{ citizen: 'Cruise Ship', impostor: ['Ferry', 'Yacht'] },
			{ citizen: 'Military Base', impostor: ['Barracks', 'Bunker'] },
			{ citizen: 'Movie Set', impostor: ['Theater', 'TV studio'] },
			{ citizen: 'Airplane', impostor: ['Helicopter', 'Hot air balloon'] },
			{ citizen: 'Train', impostor: ['Subway', 'Tram'] },
			{ citizen: 'Embassy', impostor: ['Consulate', 'Government office'] },
			{ citizen: 'Pizzeria', impostor: ['Burger joint', 'Food truck'] },
			{ citizen: 'Barbershop', impostor: ['Hair salon', 'Beauty salon'] },
			{ citizen: 'Amusement Park', impostor: ['Fair', 'Circus'] },
			{ citizen: 'Gym', impostor: ['Dojo', 'Ice rink'] },
			{ citizen: 'Laboratory', impostor: ['Pharmacy', 'Hospital'] },
			{ citizen: 'Movie Theater', impostor: ['Theater', 'Concert hall'] },
			{ citizen: 'Nightclub', impostor: ['Bar', 'Karaoke'] },
			{ citizen: 'Wedding', impostor: ['Quinceañera', 'Birthday party'] },
			{ citizen: 'Funeral', impostor: ['Wake', 'Mass'] },
			{ citizen: 'Campsite', impostor: ['Cabin', 'Shelter'] },
			{ citizen: 'North Pole', impostor: ['Antarctica', 'Siberia'] },
			{ citizen: 'Desert', impostor: ['Savanna', 'Steppe'] },
			{ citizen: 'Magic School', impostor: ['Castle', 'Tower'] },
			{ citizen: 'Pyramid', impostor: ['Mayan temple', 'Ruins'] },
		],
	},
];

export function getSpyfallCategories(locale: string): WordCategory[] {
	return locale === 'en' ? LOCATIONS_EN : LOCATIONS_ES;
}

export function getSpyfallRandomPair(locale: string, _category?: string): { pair: WordPair; selectedImpostor: string } {
	const cats = locale === 'en' ? LOCATIONS_EN : LOCATIONS_ES;
	const allPairs = cats.flatMap((c) => c.pairs);
	const pair = allPairs[Math.floor(Math.random() * allPairs.length)];
	const selectedImpostor = pair.impostor[Math.floor(Math.random() * pair.impostor.length)];
	return { pair, selectedImpostor };
}
