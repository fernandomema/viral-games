/**
 * "Quién es más probable" engine — Pure TypeScript, no framework deps.
 */

import type { GameState, GameConfig, Player, GamePhase } from './types.js';
import { DEFAULT_CONFIG } from './types.js';
import { getRandomQuestion } from './questions.js';

function generateId(): string {
	return Math.random().toString(36).substring(2, 10);
}

export interface ProbableEngine {
	getState(): GameState;
	addPlayer(name: string): Player;
	removePlayer(playerId: string): void;
	setConfig(config: Partial<GameConfig>): void;
	startGame(locale?: string): void;
	nextQuestion(locale?: string): boolean; // false if no more questions
	vote(voterId: string, targetId: string): void;
	finishVoting(): { targetId: string; targetName: string; count: number } | null;
	getFinalResults(): Player[];
	reset(): void;
	setPhase(phase: GamePhase): void;
}

export function createProbableGame(initialConfig?: Partial<GameConfig>): ProbableEngine {
	let state: GameState = {
		phase: 'lobby',
		players: [],
		config: { ...DEFAULT_CONFIG, ...initialConfig },
		currentRound: 0,
		currentQuestion: '',
		votes: {},
		roundResult: null,
		usedQuestions: new Set(),
	};

	return {
		getState() {
			return { ...state, usedQuestions: new Set(state.usedQuestions) };
		},

		addPlayer(name: string): Player {
			const player: Player = { id: generateId(), name: name.trim(), score: 0 };
			state.players = [...state.players, player];
			return player;
		},

		removePlayer(playerId: string) {
			state.players = state.players.filter((p) => p.id !== playerId);
		},

		setConfig(config: Partial<GameConfig>) {
			state.config = { ...state.config, ...config };
		},

		startGame(locale: string = 'es') {
			if (state.players.length < 2) throw new Error('Se necesitan al menos 2 jugadores');
			state.currentRound = 0;
			state.usedQuestions = new Set();
			state.players = state.players.map((p) => ({ ...p, score: 0 }));
			// Pick first question
			const q = getRandomQuestion(locale, state.usedQuestions);
			if (!q) throw new Error('No hay preguntas disponibles');
			state.usedQuestions.add(q.index);
			state.currentQuestion = q.question;
			state.currentRound = 1;
			state.votes = {};
			state.roundResult = null;
			state.phase = 'question';
		},

		nextQuestion(locale: string = 'es'): boolean {
			if (state.currentRound >= state.config.totalRounds) {
				state.phase = 'final';
				return false;
			}
			const q = getRandomQuestion(locale, state.usedQuestions);
			if (!q) {
				state.phase = 'final';
				return false;
			}
			state.usedQuestions.add(q.index);
			state.currentQuestion = q.question;
			state.currentRound++;
			state.votes = {};
			state.roundResult = null;
			state.phase = 'question';
			return true;
		},

		vote(voterId: string, targetId: string) {
			state.votes = { ...state.votes, [voterId]: targetId };
		},

		finishVoting() {
			const counts: Record<string, number> = {};
			for (const targetId of Object.values(state.votes)) {
				counts[targetId] = (counts[targetId] || 0) + 1;
			}

			let maxCount = 0;
			let winnerId: string | null = null;
			for (const [id, count] of Object.entries(counts)) {
				if (count > maxCount) {
					maxCount = count;
					winnerId = id;
				}
			}

			if (winnerId) {
				state.players = state.players.map((p) =>
					p.id === winnerId ? { ...p, score: p.score + 1 } : p
				);
				const winner = state.players.find((p) => p.id === winnerId)!;
				state.roundResult = { targetId: winnerId, targetName: winner.name, count: maxCount };
			} else {
				state.roundResult = null;
			}

			state.phase = 'results';
			return state.roundResult;
		},

		getFinalResults(): Player[] {
			return [...state.players].sort((a, b) => b.score - a.score);
		},

		reset() {
			state.phase = 'lobby';
			state.currentRound = 0;
			state.currentQuestion = '';
			state.votes = {};
			state.roundResult = null;
			state.usedQuestions = new Set();
			state.players = state.players.map((p) => ({ ...p, score: 0 }));
		},

		setPhase(phase: GamePhase) {
			state.phase = phase;
		},
	};
}

export type { ProbableEngine as default };
