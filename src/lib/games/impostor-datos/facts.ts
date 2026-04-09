/**
 * Fun fact banks for Impostor Datos — framework-agnostic.
 * Each category has a pool of real facts and a pool of fake facts.
 * Each citizen gets a unique real fact; the impostor gets a fake one.
 * Supports ES and EN locales.
 */



export interface FactCategory {
	name: string;
	icon: string;
	realFacts: string[];
	fakeFacts: string[];
}

const FACT_CATEGORIES_ES: FactCategory[] = [
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

const FACT_CATEGORIES_EN: FactCategory[] = [
	{
		name: 'Science',
		icon: 'material-symbols--science',
		realFacts: [
			'The Eiffel Tower can be 15 cm taller during summer due to thermal expansion.',
			'Human teeth are the only part of the body that cannot heal themselves.',
			'Hot water freezes faster than cold water; it\'s called the Mpemba effect.',
			'A lightning bolt is five times hotter than the surface of the Sun.',
			'Bananas are slightly radioactive due to their potassium-40 content.',
			'Human DNA shares 60% of its genes with bananas.',
			'A teaspoon of neutron star would weigh about 6 billion tons.',
			'Octopuses have three hearts and blue blood.',
			'Honey never spoils; edible honey has been found in 3,000-year-old Egyptian tombs.',
			'Venus is the only planet in the solar system that rotates in the opposite direction.',
			'Sunlight takes 8 minutes and 20 seconds to reach Earth.',
			'Saturn would float if there were an ocean large enough.',
		],
		fakeFacts: [
			'The Eiffel Tower was originally built as a military radio antenna.',
			'Human teeth continue to grow slowly throughout life.',
			'Distilled water cannot freeze under normal pressure.',
			'Lightning can only strike in areas with high relative humidity.',
			'Bananas change color when ripening because they absorb UV radiation.',
			'Human DNA has exactly 30 chromosomes.',
			'A neutron star emits visible light that can be seen from Earth with the naked eye.',
			'Octopuses can survive out of water for up to 48 hours.',
			'Venus is the closest planet to the Sun in the entire solar system.',
		],
	},
	{
		name: 'History',
		icon: 'material-symbols--history-edu',
		realFacts: [
			'Cleopatra lived closer in time to the Moon landing than to the building of the pyramids.',
			'Oxford University is older than the Aztec Empire.',
			'In ancient Rome, urine was used as mouthwash due to its ammonia content.',
			'Vikings used animal bones to make ice skates.',
			'The Great Wall of China is not visible to the naked eye from space.',
			'Napoleon wasn\'t particularly short; he was 5\'7", average for his time.',
			'The Hundred Years\' War actually lasted 116 years.',
			'Albert Einstein never failed math in school.',
			'The Roman Colosseum could be flooded with water to simulate naval battles.',
			'Ancient Egyptians used mold as an antibiotic long before penicillin.',
			'The U.S. Declaration of Independence was signed on hemp paper.',
			'In the 18th century, wigs became fashionable because King Louis XIII was bald.',
		],
		fakeFacts: [
			'Cleopatra was the first female pharaoh to rule Egypt.',
			'Oxford was founded by the Romans in the 1st century AD.',
			'In ancient Rome, it was illegal to sneeze in public.',
			'Vikings navigated exclusively using the stars as their guide.',
			'The Great Wall of China was built in a single century by one emperor.',
			'Napoleon won every battle he personally commanded.',
			'The Hundred Years\' War was fought between Spain and Portugal.',
			'Samurai were forbidden from learning to read and write.',
			'Albert Einstein invented the electric light bulb before Edison.',
		],
	},
	{
		name: 'Nature',
		icon: 'material-symbols--park',
		realFacts: [
			'Cows have best friends and get stressed when separated from them.',
			'Flamingos are born white and turn pink because of their shrimp diet.',
			'A group of flamingos is called a "flamboyance."',
			'Sea otters hold hands while sleeping so they don\'t drift apart.',
			'Koalas sleep up to 22 hours a day.',
			'Ants can lift 50 times their own body weight.',
			'Dolphins sleep with one eye open.',
			'Bees can recognize human faces.',
			'Elephants are the only animals that can\'t jump.',
			'Cats have more bones than humans: 230 vs 206.',
			'Sloths can hold their breath for up to 40 minutes underwater.',
			'Butterflies can taste with their feet.',
		],
		fakeFacts: [
			'Cows can swim up to 10 kilometers without resting.',
			'Flamingos can fly at over 300 km/h when migrating.',
			'A group of flamingos always has an even number of members.',
			'Sea otters can hold their breath for up to 30 minutes.',
			'Koalas are immune to all natural poisons in Australia.',
			'Ants can only live in colonies of exactly 10,000 members.',
			'Dolphins can communicate with whales of any species.',
			'Bees only produce honey during the night.',
			'Elephants have a memory that lasts only 24 hours.',
		],
	},
	{
		name: 'Human Body',
		icon: 'material-symbols--person',
		realFacts: [
			'The stomach produces a new lining every 3-4 days to avoid digesting itself.',
			'Humans share 99.9% of their DNA with each other.',
			'Your nose can remember 50,000 different scents.',
			'The strongest bone in the human body is the femur.',
			'The human body produces enough heat in 30 minutes to boil half a liter of water.',
			'Babies are born with 300 bones, but adults only have 206.',
			'The human tongue has a unique print, like fingerprints.',
			'The human brain uses 20% of the body\'s total energy.',
			'You blink approximately 20,000 times a day.',
			'Skin is the largest organ of the human body.',
			'The human eye can distinguish approximately 10 million colors.',
			'Your body has more bacteria than human cells.',
		],
		fakeFacts: [
			'The human stomach can expand up to 100 times its original size.',
			'Every human has a unique number of chromosomes.',
			'Your nose stops working completely while you sleep.',
			'The smallest bone in the human body is in the little finger.',
			'The human body can generate enough electricity to charge a phone.',
			'Babies are born without kneecaps and develop them at age 10.',
			'The human tongue is the strongest muscle in the body.',
			'The human brain stops developing at age 5.',
			'Human skin renews itself completely every 24 hours.',
		],
	},
	{
		name: 'Technology',
		icon: 'material-symbols--computer',
		realFacts: [
			'The first text message (SMS) was sent in 1992 and said "Merry Christmas."',
			'Google was originally called "BackRub."',
			'The first hard drive (1956) weighed over a ton and stored only 5 MB.',
			'More than 90% of the world\'s money exists only in digital format.',
			'The creator of the Game Boy also created the Nintendo D-Pad.',
			'QWERTY was designed to slow down typing to prevent keys from jamming.',
			'WiFi doesn\'t stand for "Wireless Fidelity"; it\'s just a brand name.',
			'Amazon originally only sold books.',
			'The first video game ever was "Tennis for Two" in 1958.',
			'There are more devices connected to the Internet than people in the world.',
			'The first computer weighed over 27 tons and filled an entire room.',
			'The original source code for the World Wide Web was written on a NeXT by Steve Jobs.',
		],
		fakeFacts: [
			'The first text message was sent by accident by a programmer.',
			'Google was founded in a garage in Japan.',
			'The first hard drive was invented for exclusive military use.',
			'Digital money was invented before credit cards.',
			'The Game Boy was originally designed to be a medical device.',
			'QWERTY was designed by a doctor to improve ergonomics.',
			'WiFi was invented in Australia in the 1970s.',
			'Amazon was the first online store in the world.',
			'The first video game was created by NASA to train astronauts.',
		],
	},
	{
		name: 'Geography',
		icon: 'material-symbols--public',
		realFacts: [
			'Russia has 11 different time zones.',
			'Canada has more lakes than the rest of the world\'s countries combined.',
			'Australia is wider than the Moon in diameter.',
			'There\'s a place on Earth where the Atlantic and Pacific oceans meet without mixing.',
			'The deepest point in the ocean is the Mariana Trench at nearly 11 km deep.',
			'Iceland has no military and never has had one.',
			'The Sahara is not the largest desert; Antarctica is.',
			'Mongolia is the country with the lowest population density in the world.',
			'Finland has more saunas than cars.',
			'The Amazon River has no bridges crossing it.',
			'More than half of the world\'s coastline belongs to just 10 countries.',
			'Lesotho, San Marino, and Vatican City are completely surrounded by a single country.',
		],
		fakeFacts: [
			'Russia has the same number of time zones as the United States.',
			'Canada is the coldest country in the world on annual average.',
			'Australia has more desert than the Sahara.',
			'The Pacific Ocean is saltier than the Atlantic everywhere.',
			'The Mariana Trench was discovered by a Spanish submarine.',
			'Iceland is the country with the most active volcanoes in the world.',
			'The Sahara grows approximately 1 km every day.',
			'Mongolia has the highest-altitude capital city in the world.',
			'In Finland, it is illegal by law not to know how to swim.',
		],
	},
];

const FACT_DATA: Record<string, FactCategory[]> = {
	es: FACT_CATEGORIES_ES,
	en: FACT_CATEGORIES_EN,
};

export function getFactCategories(locale: string = 'es'): FactCategory[] {
	return FACT_DATA[locale] ?? FACT_CATEGORIES_ES;
}

/** @deprecated Use getFactCategories() for locale-aware categories */
export const FACT_CATEGORIES = FACT_CATEGORIES_ES;

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
export function getFactsForRound(citizenCount: number, category?: string, locale: string = 'es'): { realFacts: string[]; fakeFact: string } {
	let cats = getFactCategories(locale);
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
