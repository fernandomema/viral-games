/**
 * 5-letter word banks for Wordle Battle.
 * Words in Spanish and English.
 */

const WORDS_ES: string[] = [
	'PERRO', 'GATOS', 'MUNDO', 'PLAYA', 'CIELO', 'FUEGO', 'AGUA+', // replace AGUA+ 
	'MOUSE', 'PLATA', 'VERDE', 'NEGRO', 'DULCE', 'JUGAR', 'ABRIR',
	'CAMPO', 'MONTE', 'TIGRE', 'PUNTA', 'FRESA', 'CARNE', 'RUEDA',
	'NOCHE', 'LIBRE', 'COMER', 'FUERZ', 'DANZA', 'LECHE', 'PECHO',
	'MUJER', 'BAILE', 'FIESTA', // 6 letters? No, FIESTA is 6
	'HUEVO', 'BUSCA', 'DISCO', 'RELOJ', 'CALOR', 'CARGA', 'JUSTO',
	'CORTE', 'PODER', 'TOMAR', 'MANGO', 'MEDIA', 'PARED', 'REINA',
	'SELVA', 'TORRE', 'CALDO', 'GOLPE', 'SABOR', 'TECHO', 'MUELA',
	'ARROZ', 'CERCA', 'VOLAR', 'SALSA', 'FORMA', 'BARCO', 'CENAR',
	'TUMBA', 'SIGLO', 'RITMO', 'BRUJA', 'PRIMO', 'RATON', 'MAGIA',
	'CURVA', 'FINAL', 'SILLA', 'MESA+', // replace
	'CREMA', 'POLVO', 'SALON', 'DOLAR', 'TRIGO', 'ACERO', 'ALTOS',
	'BROMA', 'COFRE', 'DUCHA', 'ETAPA', 'FRUTA', 'GLOBO', 'HIELO',
	'JABON', 'LEONA', 'MUNDO', 'NORMA', 'OPERA', 'PIANO', 'QUESO',
	'RANGO', 'SUELO', 'TANGO', 'LLAMA', 'VAPOR', 'YERBA', 'ZANJA',
].filter(w => w.length === 5);

const WORDS_EN: string[] = [
	'APPLE', 'BREAD', 'CHAIR', 'DANCE', 'EAGLE', 'FLAME', 'GRAPE',
	'HOUSE', 'IMAGE', 'JOKER', 'KNIFE', 'LEMON', 'MAGIC', 'NIGHT',
	'OCEAN', 'PLANT', 'QUEEN', 'RIVER', 'SMOKE', 'TIGER', 'ULTRA',
	'VIVID', 'WORLD', 'YOUTH', 'ZEBRA', 'BEACH', 'CLOUD', 'DREAM',
	'EARTH', 'FLOOD', 'GREEN', 'HEART', 'IVORY', 'JEWEL', 'KNEEL',
	'LIGHT', 'MONEY', 'NERVE', 'OLIVE', 'PEARL', 'QUEST', 'ROUND',
	'STONE', 'TRAIN', 'UNITY', 'VALVE', 'WHEAT', 'BOXER', 'CRANE',
	'DUSTY', 'ELBOW', 'FROST', 'GHOST', 'HAPPY', 'INPUT', 'JUDGE',
	'KAYAK', 'LUNAR', 'MOUNT', 'NOBLE', 'OMEGA', 'PIXEL', 'QUOTA',
	'ROBOT', 'SOLAR', 'TOWER', 'URBAN', 'VAULT', 'WITCH', 'YOUNG',
	'ALBUM', 'BLOOM', 'CORAL', 'DELTA', 'EXILE', 'FIBER', 'GRAIN',
	'HONEY', 'IRONY', 'JUICE', 'KNACK', 'LOTUS', 'MEDIA', 'NEXUS',
	'OASIS', 'PROUD', 'QUIET', 'REACH', 'SWIRL', 'THORN', 'UMBRA',
];

export function getRandomWord(locale: string): string {
	const bank = locale === 'en' ? WORDS_EN : WORDS_ES;
	return bank[Math.floor(Math.random() * bank.length)];
}

export function isValidWord(word: string): boolean {
	// For simplicity, accept any 5-letter alphabetical string
	return /^[A-ZÁÉÍÓÚÑÜ]{5}$/i.test(word);
}
