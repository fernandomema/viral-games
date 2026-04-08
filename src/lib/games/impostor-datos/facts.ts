/**
 * Fun fact banks for Impostor Datos — framework-agnostic.
 * Each category has a pool of real facts and a pool of fake facts.
 * Each citizen gets a unique real fact; the impostor gets a fake one.
 */

export interface FactCategory {
	name: string;
	icon: string;
	realFacts: string[];
	fakeFacts: string[];
}

export const FACT_CATEGORIES: FactCategory[] = [
	{
		name: 'Ciencia',
		icon: 'material-symbols--science',
		realFacts: [
			'La Torre Eiffel puede ser 15 cm más alta durante el verano por la expansión térmica.',
			'Los dientes humanos son la única parte del cuerpo que no puede curarse por sí misma.',
			'El agua caliente se congela más rápido que el agua fría; se llama efecto Mpemba.',
			'Un rayo es cinco veces más caliente que la superficie del Sol.',
			'Las bananas son ligeramente radiactivas por su contenido de potasio-40.',
			'El ADN humano comparte un 60% de genes con las bananas.',
			'Una cucharadita de estrella de neutrones pesaría unos 6 mil millones de toneladas.',
			'Los pulpos tienen tres corazones y sangre azul.',
			'La miel no caduca; se ha encontrado miel comestible en tumbas egipcias de 3000 años.',
			'Venus es el único planeta del sistema solar que gira en sentido contrario a los demás.',
			'La luz del Sol tarda 8 minutos y 20 segundos en llegar a la Tierra.',
			'Saturno flotaría si existiera un océano lo suficientemente grande.',
		],
		fakeFacts: [
			'La Torre Eiffel fue construida originalmente como una antena de radio militar.',
			'Los dientes humanos siguen creciendo lentamente durante toda la vida.',
			'El agua destilada no se puede congelar a presión normal.',
			'Un rayo solo puede caer en zonas con alta humedad relativa.',
			'Las bananas cambian de color al madurar porque absorben radiación UV.',
			'El ADN humano tiene exactamente 30 cromosomas.',
			'Una estrella de neutrones emite luz visible que puede verse desde la Tierra a simple vista.',
			'Los pulpos pueden sobrevivir fuera del agua hasta 48 horas.',
			'Venus es el planeta más cercano al Sol de todo el sistema solar.',
		],
	},
	{
		name: 'Historia',
		icon: 'material-symbols--history-edu',
		realFacts: [
			'Cleopatra vivió más cerca en el tiempo de la llegada a la Luna que de la construcción de las pirámides.',
			'Oxford es más antigua que el Imperio Azteca.',
			'En la antigua Roma se usaba orina como enjuague bucal por su contenido de amoníaco.',
			'Los vikingos usaban huesos de animales para hacer patines de hielo.',
			'La Gran Muralla China no es visible a simple vista desde el espacio.',
			'Napoleón no era especialmente bajo; medía 1.70 m, promedio para su época.',
			'La Guerra de los Cien Años duró en realidad 116 años.',
			'Albert Einstein nunca reprobó matemáticas en la escuela.',
			'El Coliseo romano podía llenarse de agua para simular batallas navales.',
			'Los antiguos egipcios usaban moho como antibiótico mucho antes de la penicilina.',
			'La Declaración de Independencia de EE.UU. se firmó en papel de cáñamo.',
			'En el siglo XVIII se pusieron de moda las pelucas porque el rey Luis XIII era calvo.',
		],
		fakeFacts: [
			'Cleopatra fue la primera faraona mujer en gobernar Egipto.',
			'Oxford fue fundada por los romanos en el siglo I d.C.',
			'En la antigua Roma estaba prohibido por ley estornudar en público.',
			'Los vikingos navegaban exclusivamente usando las estrellas como guía.',
			'La Gran Muralla China fue construida en un solo siglo por un solo emperador.',
			'Napoleón ganó todas las batallas que dirigió personalmente.',
			'La Guerra de los Cien Años fue peleada entre España y Portugal.',
			'Los samuráis tenían prohibido aprender a leer y escribir.',
			'Albert Einstein inventó la bombilla eléctrica antes que Edison.',
		],
	},
	{
		name: 'Naturaleza',
		icon: 'material-symbols--park',
		realFacts: [
			'Las vacas tienen mejores amigas y se estresan cuando las separan.',
			'Los flamencos nacen blancos y se vuelven rosados por su dieta de camarones.',
			'Un grupo de flamencos se llama "flamboyance".',
			'Las nutrias marinas se toman de las manos al dormir para no separarse.',
			'Los koalas duermen hasta 22 horas al día.',
			'Las hormigas pueden levantar 50 veces su propio peso.',
			'Los delfines duermen con un ojo abierto.',
			'Las abejas pueden reconocer rostros humanos.',
			'Los elefantes son los únicos animales que no pueden saltar.',
			'Los gatos tienen más huesos que los humanos: 230 vs 206.',
			'Los perezosos pueden contener la respiración hasta 40 minutos bajo el agua.',
			'Las mariposas pueden saborear con sus patas.',
		],
		fakeFacts: [
			'Las vacas pueden nadar hasta 10 kilómetros sin descansar.',
			'Los flamencos pueden volar a más de 300 km/h cuando migran.',
			'Un grupo de flamencos siempre tiene un número par de miembros.',
			'Las nutrias marinas pueden contener la respiración hasta 30 minutos.',
			'Los koalas son inmunes a todos los venenos naturales de Australia.',
			'Las hormigas solo pueden vivir en colonias de exactamente 10,000 miembros.',
			'Los delfines pueden comunicarse con ballenas de cualquier especie.',
			'Las abejas solo producen miel durante la noche.',
			'Los elefantes tienen una memoria que dura solo 24 horas.',
		],
	},
	{
		name: 'Cuerpo Humano',
		icon: 'material-symbols--person',
		realFacts: [
			'El estómago produce un nuevo revestimiento cada 3-4 días para no digerirse a sí mismo.',
			'Los humanos comparten un 99.9% de ADN entre sí.',
			'Tu nariz puede recordar 50,000 olores diferentes.',
			'El hueso más fuerte del cuerpo humano es el fémur.',
			'El cuerpo humano produce suficiente calor en 30 minutos para hervir medio litro de agua.',
			'Los bebés nacen con 300 huesos, pero los adultos solo tienen 206.',
			'La lengua humana tiene una huella única, como las huellas dactilares.',
			'El cerebro humano usa un 20% de la energía total del cuerpo.',
			'Parpadeas aproximadamente 20,000 veces al día.',
			'La piel es el órgano más grande del cuerpo humano.',
			'El ojo humano puede distinguir aproximadamente 10 millones de colores.',
			'Tu cuerpo tiene más bacterias que células humanas.',
		],
		fakeFacts: [
			'El estómago humano puede expandirse hasta 100 veces su tamaño original.',
			'Cada persona humana tiene un número único de cromosomas.',
			'Tu nariz deja de funcionar completamente mientras duermes.',
			'El hueso más pequeño del cuerpo humano está en el dedo meñique.',
			'El cuerpo humano puede generar electricidad suficiente para cargar un celular.',
			'Los bebés nacen sin rótulas y las desarrollan a los 10 años.',
			'La lengua humana es el músculo más fuerte del cuerpo.',
			'El cerebro humano deja de desarrollarse a los 5 años de edad.',
			'La piel humana se renueva completamente cada 24 horas.',
		],
	},
	{
		name: 'Tecnología',
		icon: 'material-symbols--computer',
		realFacts: [
			'El primer mensaje de texto (SMS) se envió en 1992 y decía "Merry Christmas".',
			'Google fue originalmente llamado "BackRub".',
			'El primer disco duro (1956) pesaba más de una tonelada y almacenaba solo 5 MB.',
			'Más del 90% del dinero del mundo existe solo en formato digital.',
			'El creador del Game Boy también creó el D-Pad de Nintendo.',
			'QWERTY se diseñó para ralentizar la escritura y evitar que se trabaran las máquinas.',
			'El WiFi no significa "Wireless Fidelity"; es solo un nombre comercial.',
			'Amazon originalmente solo vendía libros.',
			'El primer videojuego de la historia fue "Tennis for Two" en 1958.',
			'Hay más dispositivos conectados a Internet que personas en el mundo.',
			'El primer ordenador pesaba más de 27 toneladas y ocupaba una habitación entera.',
			'El código fuente original de la World Wide Web fue escrito en un NeXT de Steve Jobs.',
		],
		fakeFacts: [
			'El primer mensaje de texto fue enviado por accidente por un programador.',
			'Google fue fundado en un garaje de Japón.',
			'El primer disco duro fue inventado para uso exclusivo militar.',
			'El dinero digital fue inventado antes que las tarjetas de crédito.',
			'El Game Boy fue originalmente diseñado para ser un dispositivo médico.',
			'QWERTY fue diseñado por un médico para mejorar la ergonomía.',
			'El WiFi fue inventado en Australia en los años 70.',
			'Amazon fue la primera tienda online del mundo.',
			'El primer videojuego fue creado por la NASA para entrenar astronautas.',
		],
	},
	{
		name: 'Geografía',
		icon: 'material-symbols--public',
		realFacts: [
			'Rusia tiene 11 zonas horarias diferentes.',
			'Canadá tiene más lagos que el resto de países del mundo juntos.',
			'Australia es más ancha que la Luna en diámetro.',
			'Hay un lugar en la Tierra donde chocan el Atlántico y el Pacífico sin mezclarse.',
			'El punto más profundo del océano es la Fosa de las Marianas con casi 11 km.',
			'Islandia no tiene ejército y nunca lo ha tenido.',
			'El Sahara no es el desierto más grande; lo es la Antártida.',
			'Mongolia es el país con menor densidad de población del mundo.',
			'En Finlandia hay más saunas que coches.',
			'El río Amazonas no tiene ningún puente que lo cruce.',
			'Más de la mitad de la costa del mundo pertenece a solo 10 países.',
			'Lesoto, San Marino y el Vaticano están completamente rodeados por un solo país.',
		],
		fakeFacts: [
			'Rusia tiene la misma cantidad de zonas horarias que Estados Unidos.',
			'Canadá es el país más frío del mundo en promedio anual.',
			'Australia tiene más desierto que el Sahara.',
			'El océano Pacífico es más salado que el Atlántico en todas partes.',
			'La Fosa de las Marianas fue descubierta por un submarino español.',
			'Islandia es el país con más volcanes activos del mundo.',
			'El Sahara crece aproximadamente 1 km cada día.',
			'Mongolia tiene la capital a mayor altitud del mundo.',
			'En Finlandia está prohibido por ley no saber nadar.',
		],
	},
];

function shuffleArray<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

/**
 * Get N unique real facts and 1 fake fact for a round.
 * @param citizenCount number of citizens that need a unique real fact
 * @param category optional category filter
 */
export function getFactsForRound(citizenCount: number, category?: string): { realFacts: string[]; fakeFact: string } {
	let cats = FACT_CATEGORIES;
	if (category) {
		const filtered = cats.filter((c) => c.name === category);
		if (filtered.length > 0) cats = filtered;
	}

	// Collect all real facts and all fake facts from selected categories
	const allReal: string[] = [];
	const allFake: string[] = [];
	for (const cat of cats) {
		allReal.push(...cat.realFacts);
		allFake.push(...cat.fakeFacts);
	}

	// Pick N unique real facts
	const shuffledReal = shuffleArray(allReal);
	const realFacts = shuffledReal.slice(0, Math.min(citizenCount, shuffledReal.length));

	// Pick 1 random fake fact
	const fakeFact = allFake[Math.floor(Math.random() * allFake.length)];

	return { realFacts, fakeFact };
}
