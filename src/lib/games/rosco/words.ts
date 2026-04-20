/**
 * Rosco Veloz — clue sets for each letter of the Spanish alphabet.
 * Each set has 27 clues (A–Z + Ñ).
 * `contains: true` means "Contiene la X", otherwise "Empieza por X".
 */

import type { RoscoClue, RoscoLetter } from './types';

interface RawClue {
	clue: string;
	answer: string;
	contains?: boolean;
}

type ClueSet = Record<RoscoLetter, RawClue>;

const SETS_ES: ClueSet[] = [
	// ── Set 1: General — Fácil ─────────────────────────────────
	{
		A: { clue: 'Fruto del olivo, utilizado para hacer aceite', answer: 'ACEITUNA' },
		B: { clue: 'Mamífero marino, el animal más grande del océano', answer: 'BALLENA' },
		C: { clue: 'Órgano vital que bombea la sangre por el cuerpo', answer: 'CORAZÓN' },
		D: { clue: 'Animal prehistórico que se extinguió hace millones de años', answer: 'DINOSAURIO' },
		E: { clue: 'Animal terrestre más grande, con trompa y grandes orejas', answer: 'ELEFANTE' },
		F: { clue: 'Fenómeno que produce calor y luz al quemar algo', answer: 'FUEGO' },
		G: { clue: 'Lentes que se ponen sobre los ojos para ver mejor', answer: 'GAFAS' },
		H: { clue: 'Postre frío y cremoso que se come en verano', answer: 'HELADO' },
		I: { clue: 'Porción de tierra rodeada de agua por todas partes', answer: 'ISLA' },
		J: { clue: 'Arte marcial de origen japonés, deporte olímpico', answer: 'JUDO' },
		K: { clue: 'Unidad de peso equivalente a mil gramos', answer: 'KILOGRAMO', contains: true },
		L: { clue: 'Satélite natural de la Tierra que brilla por la noche', answer: 'LUNA' },
		M: { clue: 'Sustancia dulce y dorada producida por las abejas', answer: 'MIEL' },
		N: { clue: 'Precipitación blanca que cae del cielo en invierno', answer: 'NIEVE' },
		Ñ: { clue: 'Lo contrario de grande', answer: 'PEQUEÑO', contains: true },
		O: { clue: 'Estación del año que sigue al verano', answer: 'OTOÑO' },
		P: { clue: 'Alimento básico hecho con harina y horneado', answer: 'PAN' },
		Q: { clue: 'Alimento sólido elaborado con leche cuajada', answer: 'QUESO' },
		R: { clue: 'Instrumento que se usa para medir el tiempo', answer: 'RELOJ' },
		S: { clue: 'Astro rey que nos da luz y calor durante el día', answer: 'SOL' },
		T: { clue: 'Reptil con caparazón que se mueve lentamente', answer: 'TORTUGA' },
		U: { clue: 'Fruta que crece en racimos y se usa para hacer vino', answer: 'UVA' },
		V: { clue: 'Instrumento de cuerda que se toca con un arco', answer: 'VIOLÍN' },
		W: { clue: 'Fruta verde por dentro y marrón por fuera, de origen tropical', answer: 'KIWI', contains: true },
		X: { clue: 'Gas vital que respiramos para poder vivir', answer: 'OXÍGENO', contains: true },
		Y: { clue: 'Parte amarilla del huevo', answer: 'YEMA' },
		Z: { clue: 'Calzado deportivo ligero para correr', answer: 'ZAPATILLA' },
	},
	// ── Set 2: General — Medio ─────────────────────────────────
	{
		A: { clue: 'Medio de transporte que vuela por el cielo', answer: 'AVIÓN' },
		B: { clue: 'Fruta tropical alargada de color amarillo', answer: 'BANANA' },
		C: { clue: 'Bebida caliente y oscura hecha con granos tostados', answer: 'CAFÉ' },
		D: { clue: 'Juego de mesa con fichas rectangulares y puntos', answer: 'DOMINÓ' },
		E: { clue: 'Arma blanca larga usada por caballeros medievales', answer: 'ESPADA' },
		F: { clue: 'Fruta roja, pequeña, dulce y con semillas por fuera', answer: 'FRESA' },
		G: { clue: 'Prenda de vestir que cubre y protege las manos', answer: 'GUANTE' },
		H: { clue: 'Persona que realiza actos de valentía extraordinaria', answer: 'HÉROE' },
		I: { clue: 'Que no se puede ver a simple vista', answer: 'INVISIBLE' },
		J: { clue: 'Persona de poca edad, entre niño y adulto', answer: 'JOVEN' },
		K: { clue: 'Embarcación estrecha impulsada con remo doble', answer: 'KAYAK' },
		L: { clue: 'Ave tropical colorida que puede imitar palabras humanas', answer: 'LORO' },
		M: { clue: 'Gran masa de agua salada, más pequeña que un océano', answer: 'MAR' },
		N: { clue: 'Obra literaria extensa de ficción narrativa', answer: 'NOVELA' },
		Ñ: { clue: 'Compañero de trabajo o estudio', answer: 'COMPAÑERO', contains: true },
		O: { clue: 'Punto cardinal por donde sale el sol', answer: 'ORIENTE' },
		P: { clue: 'Gema esférica que se forma dentro de una ostra', answer: 'PERLA' },
		Q: { clue: 'Estado de inmovilidad y ausencia de movimiento', answer: 'QUIETUD' },
		R: { clue: 'Flor con espinas y pétalos suaves, símbolo del amor', answer: 'ROSA' },
		S: { clue: 'Reptil sin patas que se desplaza arrastrándose', answer: 'SERPIENTE' },
		T: { clue: 'Aparato electrónico para comunicarse a distancia', answer: 'TELÉFONO' },
		U: { clue: 'Ser mítico con forma de caballo y un cuerno en la frente', answer: 'UNICORNIO' },
		V: { clue: 'Estación más calurosa del año', answer: 'VERANO' },
		W: { clue: 'Pan relleno de ingredientes, comida rápida', answer: 'SÁNDWICH', contains: true },
		X: { clue: 'Prueba o evaluación que se hace en la escuela', answer: 'EXAMEN', contains: true },
		Y: { clue: 'Material blanco de construcción que se endurece al secar', answer: 'YESO' },
		Z: { clue: 'Sonido que hacen las abejas al volar', answer: 'ZUMBIDO' },
	},
	// ── Set 3: Mixto — Medio ───────────────────────────────────
	{
		A: { clue: 'Ciencia que estudia los astros, planetas y galaxias', answer: 'ASTRONOMÍA' },
		B: { clue: 'Embarcación pequeña impulsada a remos', answer: 'BOTE' },
		C: { clue: 'Aparato con lente que sirve para tomar fotografías', answer: 'CÁMARA' },
		D: { clue: 'Cada una de las cinco extremidades de la mano', answer: 'DEDO' },
		E: { clue: 'Lugar donde los niños van a estudiar y aprender', answer: 'ESCUELA' },
		F: { clue: 'Instrumento musical de viento, tubular y con agujeros', answer: 'FLAUTA' },
		G: { clue: 'Animal doméstico que maúlla y ronronea', answer: 'GATO' },
		H: { clue: 'Fruto dulce de la higuera, seco o fresco', answer: 'HIGO' },
		I: { clue: 'Estación fría del año, con días cortos y noches largas', answer: 'INVIERNO' },
		J: { clue: 'Planta trepadora de huerto con vainas verdes comestibles', answer: 'JUDÍA' },
		K: { clue: 'Entretenimiento de cantar con música pregrabada y pantalla', answer: 'KARAOKE' },
		L: { clue: 'Aparato portátil que emite un haz de luz', answer: 'LINTERNA' },
		M: { clue: 'Insecto pequeño que pica y produce un zumbido molesto', answer: 'MOSQUITO' },
		N: { clue: 'Electrodoméstico que enfría y conserva los alimentos', answer: 'NEVERA' },
		Ñ: { clue: 'País europeo cuya capital es Madrid', answer: 'ESPAÑA', contains: true },
		O: { clue: 'Movimiento del mar que llega a la orilla de la playa', answer: 'OLA' },
		P: { clue: 'País sudamericano donde se encuentra Machu Picchu', answer: 'PERÚ' },
		Q: { clue: 'Número equivalente a cinco centenas', answer: 'QUINIENTOS' },
		R: { clue: 'Corriente natural de agua dulce que desemboca en el mar', answer: 'RÍO' },
		S: { clue: 'Capital de Corea del Sur', answer: 'SEÚL' },
		T: { clue: 'Instrumento musical de percusión con forma cilíndrica', answer: 'TAMBOR' },
		U: { clue: 'Institución de educación superior donde se obtienen títulos', answer: 'UNIVERSIDAD' },
		V: { clue: 'Abertura en la pared por donde entran la luz y el aire', answer: 'VENTANA' },
		W: { clue: 'Unidad de medida de fuerza en física, nombrada por un científico inglés', answer: 'NEWTON', contains: true },
		X: { clue: 'Logro o resultado positivo de una acción', answer: 'ÉXITO', contains: true },
		Y: { clue: 'Alimento lácteo fermentado, cremoso, que se come con frutas', answer: 'YOGUR' },
		Z: { clue: 'Jugo natural que se obtiene al exprimir frutas', answer: 'ZUMO' },
	},
	// ── Set 4: Cultura y Naturaleza ────────────────────────────
	{
		A: { clue: 'Instrumento de cuerda pulsada con forma triangular', answer: 'ARPA' },
		B: { clue: 'Prenda de ropa interior que cubre el torso', answer: 'BRASIER' },
		C: { clue: 'Continente helado en el polo sur de la Tierra', answer: 'CONTINENTE' },
		D: { clue: 'Moneda estadounidense, la más usada del mundo', answer: 'DÓLAR' },
		E: { clue: 'Deporte que se practica deslizándose sobre nieve con tablas en los pies', answer: 'ESQUÍ' },
		F: { clue: 'Fuente natural de agua caliente que brota de la tierra', answer: 'FUMAROLA' },
		G: { clue: 'Masa de hielo que se desplaza lentamente por valles', answer: 'GLACIAR' },
		H: { clue: 'Bandera de un país o equipo, izada en un mástil', answer: 'HIMNO' },
		I: { clue: 'Máquina que permite obtener copias en papel de un documento', answer: 'IMPRESORA' },
		J: { clue: 'Animal con cuello muy largo que vive en la sabana africana', answer: 'JIRAFA' },
		K: { clue: 'Animal marsupial australiano que salta con sus patas traseras', answer: 'KOALA' },
		L: { clue: 'Felino grande con melena que vive en la sabana', answer: 'LEÓN' },
		M: { clue: 'Color formado al mezclar rojo y azul', answer: 'MORADO' },
		N: { clue: 'Gas que compone casi el 80% de la atmósfera terrestre', answer: 'NITRÓGENO' },
		Ñ: { clue: 'Persona que cuida niños como profesión', answer: 'NIÑERA', contains: true },
		O: { clue: 'Sentimiento de satisfacción por los logros propios', answer: 'ORGULLO' },
		P: { clue: 'Deporte acuático en el que se nada en una piscina', answer: 'PISCINA' },
		Q: { clue: 'Reacción del cuerpo humano al exponerse al sol', answer: 'QUEMADURA' },
		R: { clue: 'Órgano del cuerpo que filtra la sangre y produce orina', answer: 'RIÑÓN' },
		S: { clue: 'Movimiento de la Tierra que puede causar destrucción', answer: 'SISMO' },
		T: { clue: 'Fenómeno atmosférico con lluvia intensa, truenos y rayos', answer: 'TORMENTA' },
		U: { clue: 'Dedo más grueso de la mano, opuesto a los demás', answer: 'PULGAR' },
		V: { clue: 'Medio de transporte con dos ruedas impulsado por pedales', answer: 'VELOCÍPEDO' },
		W: { clue: 'Red global de información accesible por internet', answer: 'WEB' },
		X: { clue: 'Instrumento musical de percusión con láminas de madera', answer: 'XILÓFONO' },
		Y: { clue: 'Terreno extenso sin árboles, con vegetación baja', answer: 'YERMA' },
		Z: { clue: 'Animal con rayas blancas y negras de la sabana africana', answer: 'CEBRA' },
	},
];

function buildClueSet(raw: ClueSet): RoscoClue[] {
	return Object.entries(raw).map(([letter, { clue, answer, contains }]) => ({
		letter: letter as RoscoLetter,
		clue,
		answer: answer.toUpperCase(),
		contains: contains ?? false,
	}));
}

const compiledSets = SETS_ES.map(buildClueSet);

/**
 * Returns a random clue set. If `exclude` is provided, avoids that index.
 */
export function getRandomClueSet(locale: string = 'es', exclude?: number): { clues: RoscoClue[]; setIndex: number } {
	// Only Spanish sets for now
	let idx: number;
	if (exclude !== undefined && compiledSets.length > 1) {
		do {
			idx = Math.floor(Math.random() * compiledSets.length);
		} while (idx === exclude);
	} else {
		idx = Math.floor(Math.random() * compiledSets.length);
	}
	return { clues: compiledSets[idx], setIndex: idx };
}

export function getTotalSets(): number {
	return compiledSets.length;
}
