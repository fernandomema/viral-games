/**
 * Impostor Dibujo Edition — Engine
 * Same impostor logic + turn-based drawing mechanic.
 * Each player draws one stroke per turn, pass the phone.
 */

import type { GameState, GameConfig, Player, PlayerRole, GamePhase, Stroke } from './types.js';
import { DEFAULT_CONFIG } from './types.js';
import { getRandomDrawPair } from './words.js';

function generateId(): string {
	return Math.random().toString(36).substring(2, 10);
}

function shuffleArray<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

export interface ImpostorDrawEngine {
	getState(): GameState;
	addPlayer(name: string): Player;
	removePlayer(playerId: string): void;
	setConfig(config: Partial<GameConfig>): void;
	startGame(category?: string): void;
	revealRole(playerId: string): PlayerRole;
	nextReveal(): void;
	// Drawing
	getCurrentDrawer(): Player | null;
	addStroke(stroke: Omit<Stroke, 'playerId'>): void;
	finishTurn(): { done: boolean };
	resetTurnTimer(): void;
	tickTurn(): number;
	// Voting
	vote(voterId: string, targetId: string): void;
	finishVoting(): { eliminatedId: string | null; wasImpostor: boolean; impostorIds: string[] };
	getResults(): {
		impostors: Player[];
		citizens: Player[];
		secretWord: string;
		impostorWord: string;
		strokes: Stroke[];
	};
	reset(): void;
	setPhase(phase: GamePhase): void;
}

export function createImpostorDrawGame(initialConfig?: Partial<GameConfig>): ImpostorDrawEngine {
	let state: GameState = {
		phase: 'lobby',
		players: [],
		roles: [],
		config: { ...DEFAULT_CONFIG, ...initialConfig },
		secretWord: '',
		impostorWord: '',
		currentRevealIndex: 0,
		strokes: [],
		currentDrawerIndex: 0,
		currentRound: 1,
		turnTimerRemaining: 0,
		votes: {},
	};

	function alivePlayers(): Player[] {
		return state.players.filter((p) => !p.eliminated);
	}

	return {
		getState() {
			return { ...state };
		},

		addPlayer(name: string): Player {
			const player: Player = {
				id: generateId(),
				name: name.trim(),
				eliminated: false,
			};
			state.players = [...state.players, player];
			return player;
		},

		removePlayer(playerId: string) {
			state.players = state.players.filter((p) => p.id !== playerId);
		},

		setConfig(config: Partial<GameConfig>) {
			state.config = { ...state.config, ...config };
		},

		startGame(category?: string) {
			if (state.players.length < 3) {
				throw new Error('Se necesitan al menos 3 jugadores');
			}

			const { pair, selectedImpostor } = getRandomDrawPair(category);
			state.secretWord = pair.citizen;
			state.impostorWord = state.config.giveImpostorHint ? selectedImpostor : '';

			const shuffled = shuffleArray(state.players);
			const impostorCount = Math.min(state.config.impostorCount, state.players.length - 1);
			const impostorIds = new Set(shuffled.slice(0, impostorCount).map((p) => p.id));

			state.roles = state.players.map((p) => ({
				playerId: p.id,
				role: impostorIds.has(p.id) ? 'impostor' : 'citizen',
				word: impostorIds.has(p.id)
					? (state.config.giveImpostorHint ? selectedImpostor : '???')
					: pair.citizen,
			}));

			state.currentRevealIndex = 0;
			state.strokes = [];
			state.currentDrawerIndex = 0;
			state.currentRound = 1;
			state.turnTimerRemaining = state.config.timerPerTurn;
			state.votes = {};
			state.phase = 'reveal';
		},

		revealRole(playerId: string): PlayerRole {
			const role = state.roles.find((r) => r.playerId === playerId);
			if (!role) throw new Error('Jugador no encontrado');
			return role;
		},

		nextReveal() {
			state.currentRevealIndex++;
			if (state.currentRevealIndex >= state.players.length) {
				state.phase = 'drawing';
				state.currentDrawerIndex = 0;
				state.currentRound = 1;
				state.turnTimerRemaining = state.config.timerPerTurn;
			}
		},

		getCurrentDrawer(): Player | null {
			const alive = alivePlayers();
			if (alive.length === 0) return null;
			return alive[state.currentDrawerIndex % alive.length] || null;
		},

		addStroke(stroke: Omit<Stroke, 'playerId'>) {
			const drawer = this.getCurrentDrawer();
			if (!drawer) return;
			state.strokes = [...state.strokes, { ...stroke, playerId: drawer.id }];
		},

		finishTurn(): { done: boolean } {
			const alive = alivePlayers();
			const nextIndex = state.currentDrawerIndex + 1;

			if (nextIndex >= alive.length) {
				// End of round
				if (state.currentRound >= state.config.rounds) {
					// All rounds done → voting
					state.phase = 'voting';
					return { done: true };
				}
				state.currentRound++;
				state.currentDrawerIndex = 0;
			} else {
				state.currentDrawerIndex = nextIndex;
			}
			state.turnTimerRemaining = state.config.timerPerTurn;
			return { done: false };
		},

		resetTurnTimer() {
			state.turnTimerRemaining = state.config.timerPerTurn;
		},

		tickTurn(): number {
			if (state.turnTimerRemaining > 0) {
				state.turnTimerRemaining--;
			}
			return state.turnTimerRemaining;
		},

		vote(voterId: string, targetId: string) {
			state.votes = { ...state.votes, [voterId]: targetId };
		},

		finishVoting() {
			const counts: Record<string, number> = {};
			for (const targetId of Object.values(state.votes)) {
				counts[targetId] = (counts[targetId] || 0) + 1;
			}

			let maxVotes = 0;
			let eliminatedId: string | null = null;
			for (const [id, count] of Object.entries(counts)) {
				if (count > maxVotes) {
					maxVotes = count;
					eliminatedId = id;
				}
			}

			const impostorIds = state.roles
				.filter((r) => r.role === 'impostor')
				.map((r) => r.playerId);

			const wasImpostor = eliminatedId ? impostorIds.includes(eliminatedId) : false;

			if (eliminatedId) {
				state.players = state.players.map((p) =>
					p.id === eliminatedId ? { ...p, eliminated: true } : p
				);
			}

			state.phase = 'results';
			return { eliminatedId, wasImpostor, impostorIds };
		},

		getResults() {
			const impostorIds = new Set(
				state.roles.filter((r) => r.role === 'impostor').map((r) => r.playerId)
			);
			return {
				impostors: state.players.filter((p) => impostorIds.has(p.id)),
				citizens: state.players.filter((p) => !impostorIds.has(p.id)),
				secretWord: state.secretWord,
				impostorWord: state.impostorWord,
				strokes: state.strokes,
			};
		},

		reset() {
			state = {
				phase: 'lobby',
				players: state.players.map((p) => ({ ...p, eliminated: false })),
				roles: [],
				config: state.config,
				secretWord: '',
				impostorWord: '',
				currentRevealIndex: 0,
				strokes: [],
				currentDrawerIndex: 0,
				currentRound: 1,
				turnTimerRemaining: 0,
				votes: {},
			};
		},

		setPhase(phase: GamePhase) {
			state.phase = phase;
		},
	};
}
