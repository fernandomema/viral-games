/**
 * Basta (Stop) Game Engine — Pure TypeScript, no framework deps.
 *
 * Flow: lobby → playing → voting → scores → (repeat or results)
 *
 * Usage:
 *   const engine = createBastaGame();
 *   engine.addPlayer('Alice');
 *   engine.startGame();
 */

import type {
	GameState,
	GameConfig,
	Player,
	PlayerAnswers,
	AnswerVote,
	RoundScore,
	GamePhase,
} from './types.js';
import { DEFAULT_CONFIG } from './types.js';
import { pickRandomCategories, pickRandomLetter } from './categories.js';

function generateId(): string {
	return Math.random().toString(36).substring(2, 10);
}

export interface BastaEngine {
	getState(): GameState;
	addPlayer(name: string): Player;
	removePlayer(playerId: string): void;
	setConfig(config: Partial<GameConfig>): void;
	startGame(): void;
	/** Submit answers for a player */
	submitAnswers(playerId: string, answers: Record<string, string>): void;
	/** A player presses STOP — ends the round for everyone */
	stopRound(playerId: string): void;
	/** Tick the timer (called every second). Returns remaining seconds. */
	tick(): number;
	/** Submit a vote on someone's answer */
	submitVote(voterId: string, targetPlayerId: string, category: string, valid: boolean): void;
	/** Check if all votes are in */
	allVotesIn(): boolean;
	/** Calculate scores for the current round, move to scores phase */
	finishVoting(): RoundScore[];
	/** Move to next round or final results */
	nextRound(): void;
	/** Get final winners (players with highest total score) */
	getWinners(): Player[];
	reset(): void;
	setPhase(phase: GamePhase): void;
}

export function createBastaGame(initialConfig?: Partial<GameConfig>): BastaEngine {
	let state: GameState = {
		phase: 'lobby',
		players: [],
		config: { ...DEFAULT_CONFIG, ...initialConfig },
		currentRound: 0,
		currentLetter: '',
		categories: [],
		timerRemaining: 0,
		answers: [],
		stoppedBy: null,
		votes: [],
		roundScores: [],
		totalScores: {},
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
			state.totalScores[player.id] = 0;
			return player;
		},

		removePlayer(playerId: string) {
			state.players = state.players.filter((p) => p.id !== playerId);
			const { [playerId]: _, ...rest } = state.totalScores;
			state.totalScores = rest;
		},

		setConfig(config: Partial<GameConfig>) {
			state.config = { ...state.config, ...config };
		},

		startGame() {
			if (state.players.length < 2) {
				throw new Error('Se necesitan al menos 2 jugadores');
			}

			state.currentRound = 1;
			state.totalScores = {};
			for (const p of state.players) {
				state.totalScores[p.id] = 0;
			}

			// Pick categories and letter for round 1
			const cats = pickRandomCategories(5);
			state.categories = cats.map((c) => c.name);
			state.currentLetter = pickRandomLetter();
			state.timerRemaining = state.config.timerSeconds;
			state.answers = [];
			state.stoppedBy = null;
			state.votes = [];
			state.roundScores = [];
			state.phase = 'playing';
		},

		submitAnswers(playerId: string, answers: Record<string, string>) {
			// Replace if already submitted
			state.answers = state.answers.filter((a) => a.playerId !== playerId);
			state.answers = [...state.answers, { playerId, answers }];
		},

		stopRound(playerId: string) {
			if (state.phase !== 'playing') return;
			state.stoppedBy = playerId;
			state.phase = 'voting';
		},

		tick(): number {
			if (state.timerRemaining > 0) {
				state.timerRemaining--;
			}
			if (state.timerRemaining === 0 && state.phase === 'playing') {
				state.phase = 'voting';
			}
			return state.timerRemaining;
		},

		submitVote(voterId: string, targetPlayerId: string, category: string, valid: boolean) {
			// Remove existing vote for same target+category from this voter
			state.votes = state.votes.filter(
				(v) => !(v.voterId === voterId && v.targetPlayerId === targetPlayerId && v.category === category)
			);
			state.votes = [...state.votes, { voterId, targetPlayerId, category, valid }];
		},

		allVotesIn(): boolean {
			const playerIds = state.players.map((p) => p.id);
			// Each player must vote on every other player's answers for each category
			for (const voter of playerIds) {
				for (const target of playerIds) {
					if (voter === target) continue;
					const targetAnswers = state.answers.find((a) => a.playerId === target);
					if (!targetAnswers) continue;
					for (const cat of state.categories) {
						const answer = targetAnswers.answers[cat];
						if (!answer || answer.trim() === '') continue; // empty answers don't need votes
						const hasVote = state.votes.some(
							(v) => v.voterId === voter && v.targetPlayerId === target && v.category === cat
						);
						if (!hasVote) return false;
					}
				}
			}
			return true;
		},

		finishVoting(): RoundScore[] {
			const scores: RoundScore[] = [];

			for (const player of state.players) {
				const playerAnswers = state.answers.find((a) => a.playerId === player.id);
				const breakdown: Record<string, number> = {};
				let total = 0;

				for (const cat of state.categories) {
					const answer = playerAnswers?.answers[cat]?.trim() ?? '';
					if (!answer) {
						breakdown[cat] = 0;
						continue;
					}

					// Check if answer starts with the correct letter
					if (answer.toUpperCase()[0] !== state.currentLetter) {
						breakdown[cat] = 0;
						continue;
					}

					// Count valid votes for this answer
					const votesForThis = state.votes.filter(
						(v) => v.targetPlayerId === player.id && v.category === cat
					);
					const validCount = votesForThis.filter((v) => v.valid).length;
					const totalVoters = votesForThis.length;

					// Majority rules: if more than half approve, it's valid
					if (totalVoters > 0 && validCount > totalVoters / 2) {
						// Check if any other player has the same answer
						const duplicate = state.answers.some(
							(a) =>
								a.playerId !== player.id &&
								a.answers[cat]?.trim().toUpperCase() === answer.toUpperCase()
						);
						breakdown[cat] = duplicate ? 50 : 100;
					} else {
						breakdown[cat] = 0;
					}

					total += breakdown[cat];
				}

				scores.push({ playerId: player.id, points: total, breakdown });
				state.totalScores[player.id] = (state.totalScores[player.id] ?? 0) + total;
			}

			state.roundScores = scores;
			state.phase = 'scores';
			return scores;
		},

		nextRound() {
			if (state.currentRound >= state.config.totalRounds) {
				state.phase = 'results';
				return;
			}

			state.currentRound++;
			const cats = pickRandomCategories(5);
			state.categories = cats.map((c) => c.name);
			state.currentLetter = pickRandomLetter();
			state.timerRemaining = state.config.timerSeconds;
			state.answers = [];
			state.stoppedBy = null;
			state.votes = [];
			state.roundScores = [];
			state.phase = 'playing';
		},

		getWinners(): Player[] {
			let maxScore = 0;
			for (const score of Object.values(state.totalScores)) {
				if (score > maxScore) maxScore = score;
			}
			return state.players.filter((p) => (state.totalScores[p.id] ?? 0) === maxScore);
		},

		reset() {
			state = {
				phase: 'lobby',
				players: state.players.map((p) => ({ ...p, eliminated: false })),
				config: state.config,
				currentRound: 0,
				currentLetter: '',
				categories: [],
				timerRemaining: 0,
				answers: [],
				stoppedBy: null,
				votes: [],
				roundScores: [],
				totalScores: {},
			};
		},

		setPhase(phase: GamePhase) {
			state.phase = phase;
		},
	};
}
