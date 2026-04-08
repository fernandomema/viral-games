/**
 * Impostor Game Engine — Pure TypeScript, no framework deps.
 * Can be imported in Discord Activities SDK, Node.js, or browser.
 *
 * Usage:
 *   const engine = createImpostorGame();
 *   engine.addPlayer('Alice');
 *   engine.startGame();
 *   const role = engine.revealRole(engine.getState().players[0].id);
 */

import type { GameState, GameConfig, Player, PlayerRole, GamePhase } from './types.js';
import { DEFAULT_CONFIG } from './types.js';
import { getRandomPair } from './words.js';

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

export interface ImpostorEngine {
	getState(): GameState;
	addPlayer(name: string): Player;
	removePlayer(playerId: string): void;
	setConfig(config: Partial<GameConfig>): void;
	startGame(category?: string): void;
	revealRole(playerId: string): PlayerRole;
	nextReveal(): void;
	startTimer(): void;
	tick(): number;
	vote(voterId: string, targetId: string): void;
	finishVoting(): { eliminatedId: string | null; wasImpostor: boolean; impostorIds: string[] };
	eliminatePlayer(playerId: string): void;
	getResults(): {
		impostors: Player[];
		citizens: Player[];
		secretWord: string;
		impostorWord: string;
	};
	reset(): void;
	setPhase(phase: GamePhase): void;
}

export function createImpostorGame(initialConfig?: Partial<GameConfig>): ImpostorEngine {
	let state: GameState = {
		phase: 'lobby',
		players: [],
		roles: [],
		config: { ...DEFAULT_CONFIG, ...initialConfig },
		secretWord: '',
		impostorWord: '',
		currentRevealIndex: 0,
		timerRemaining: 0,
		votes: {},
	};

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

			const { pair, selectedImpostor } = getRandomPair(category);
			state.secretWord = pair.citizen;
			state.impostorWord = state.config.giveImpostorHint ? selectedImpostor : '';

			// Shuffle players and assign roles
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
			state.timerRemaining = state.config.timerSeconds;
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
				state.phase = 'playing';
			}
		},

		startTimer() {
			state.timerRemaining = state.config.timerSeconds;
			state.phase = 'playing';
		},

		tick(): number {
			if (state.timerRemaining > 0) {
				state.timerRemaining--;
			}
			if (state.timerRemaining === 0) {
				state.phase = 'voting';
			}
			return state.timerRemaining;
		},

		vote(voterId: string, targetId: string) {
			state.votes = { ...state.votes, [voterId]: targetId };
		},

		finishVoting() {
			const impostorIds = state.roles
				.filter((r) => r.role === 'impostor')
				.map((r) => r.playerId);

			// Count votes (impostor votes don't count)
			const counts: Record<string, number> = {};
			for (const [voterId, targetId] of Object.entries(state.votes)) {
				if (impostorIds.includes(voterId)) continue;
				counts[targetId] = (counts[targetId] || 0) + 1;
			}

			// Find max votes
			let maxVotes = 0;
			let eliminatedId: string | null = null;
			for (const [id, count] of Object.entries(counts)) {
				if (count > maxVotes) {
					maxVotes = count;
					eliminatedId = id;
				}
			}

			const wasImpostor = eliminatedId ? impostorIds.includes(eliminatedId) : false;

			if (eliminatedId) {
				state.players = state.players.map((p) =>
					p.id === eliminatedId ? { ...p, eliminated: true } : p
				);
			}

			state.phase = 'results';
			return { eliminatedId, wasImpostor, impostorIds };
		},

		eliminatePlayer(playerId: string) {
			state.players = state.players.map((p) =>
				p.id === playerId ? { ...p, eliminated: true } : p
			);
		},

		getResults() {
			const impostors = state.players.filter((p) =>
				state.roles.find((r) => r.playerId === p.id && r.role === 'impostor')
			);
			const citizens = state.players.filter((p) =>
				state.roles.find((r) => r.playerId === p.id && r.role === 'citizen')
			);
			return {
				impostors,
				citizens,
				secretWord: state.secretWord,
				impostorWord: state.impostorWord,
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
				timerRemaining: 0,
				votes: {},
			};
		},

		setPhase(phase: GamePhase) {
			state.phase = phase;
		},
	};
}
