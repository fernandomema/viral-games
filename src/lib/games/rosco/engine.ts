/**
 * Rosco Veloz engine — manages game state, answers, passing, timer.
 * Pure TS, no framework deps. Reusable for local + online modes.
 */

import { ROSCO_LETTERS, DEFAULT_ROSCO_CONFIG, type RoscoConfig, type RoscoState, type RoscoPhase, type PlayerRosco, type LetterStatus, type RoscoClue } from './types';
import { getRandomClueSet } from './words';

export interface RoscoPlayer {
	id: string;
	name: string;
}

let nextPlayerId = 1;

export function createRoscoGame(locale: string = 'es') {
	let config: RoscoConfig = { ...DEFAULT_ROSCO_CONFIG };
	let players: RoscoPlayer[] = [];
	let clues: RoscoClue[] = [];
	let playerRoscos: Record<string, PlayerRosco> = {};
	let phase: RoscoPhase = 'lobby';
	let timerRemaining = config.timerSeconds;

	function addPlayer(name: string): { id: string; name: string } {
		const id = `p${nextPlayerId++}`;
		players.push({ id, name });
		return { id, name };
	}

	function removePlayer(id: string) {
		players = players.filter(p => p.id !== id);
		delete playerRoscos[id];
	}

	function setConfig(c: Partial<RoscoConfig>) {
		config = { ...config, ...c };
	}

	function startGame() {
		const { clues: set } = getRandomClueSet(locale);
		clues = set;
		timerRemaining = config.timerSeconds;
		playerRoscos = {};

		for (const p of players) {
			const statuses: Record<string, LetterStatus> = {};
			for (const letter of ROSCO_LETTERS) {
				statuses[letter] = 'pending';
			}
			playerRoscos[p.id] = {
				playerId: p.id,
				name: p.name,
				statuses,
				currentLetterIdx: 0,
				correctCount: 0,
				incorrectCount: 0,
				finished: false,
			};
		}
		phase = 'playing';
	}

	function getNextPending(rosco: PlayerRosco): number | null {
		const start = rosco.currentLetterIdx;
		for (let i = 1; i <= ROSCO_LETTERS.length; i++) {
			const idx = (start + i) % ROSCO_LETTERS.length;
			const status = rosco.statuses[ROSCO_LETTERS[idx]];
			if (status === 'pending' || status === 'passed') {
				return idx;
			}
		}
		return null;
	}

	function advancePlayer(rosco: PlayerRosco) {
		const next = getNextPending(rosco);
		if (next === null) {
			rosco.finished = true;
		} else {
			rosco.currentLetterIdx = next;
		}
		checkAllFinished();
	}

	function answer(playerId: string, userAnswer: string): boolean {
		if (phase !== 'playing') return false;
		const rosco = playerRoscos[playerId];
		if (!rosco || rosco.finished) return false;

		const letter = ROSCO_LETTERS[rosco.currentLetterIdx];
		const clue = clues.find(c => c.letter === letter);
		if (!clue) return false;

		const normalized = userAnswer.trim().toUpperCase()
			.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
		const expected = clue.answer.toUpperCase()
			.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

		if (normalized === expected) {
			rosco.statuses[letter] = 'correct';
			rosco.correctCount++;
			advancePlayer(rosco);
			return true;
		} else {
			rosco.statuses[letter] = 'incorrect';
			rosco.incorrectCount++;
			advancePlayer(rosco);
			return false;
		}
	}

	function pass(playerId: string) {
		if (phase !== 'playing') return;
		const rosco = playerRoscos[playerId];
		if (!rosco || rosco.finished) return;

		const letter = ROSCO_LETTERS[rosco.currentLetterIdx];
		rosco.statuses[letter] = 'passed';
		advancePlayer(rosco);
	}

	function tick() {
		if (phase !== 'playing') return;
		timerRemaining--;
		if (timerRemaining <= 0) {
			timerRemaining = 0;
			phase = 'results';
		}
	}

	function checkAllFinished() {
		if (phase !== 'playing') return;
		const allDone = players.every(p => playerRoscos[p.id]?.finished);
		if (allDone) {
			phase = 'results';
		}
	}

	function getState(): RoscoState {
		return {
			phase,
			players: players.map(p => ({ id: p.id, name: p.name })),
			clues,
			playerRoscos: { ...playerRoscos },
			timerRemaining,
			config,
		};
	}

	function setPhase(p: RoscoPhase) {
		phase = p;
	}

	function reset() {
		phase = 'lobby';
		clues = [];
		playerRoscos = {};
		timerRemaining = config.timerSeconds;
	}

	function getWinners(): RoscoPlayer[] {
		const sorted = [...players]
			.map(p => ({ ...p, correct: playerRoscos[p.id]?.correctCount ?? 0 }))
			.sort((a, b) => b.correct - a.correct);
		if (sorted.length === 0) return [];
		const max = sorted[0].correct;
		return sorted.filter(s => s.correct === max);
	}

	return {
		addPlayer,
		removePlayer,
		setConfig,
		startGame,
		answer,
		pass,
		tick,
		getState,
		setPhase,
		reset,
		getWinners,
	};
}

export type RoscoEngine = ReturnType<typeof createRoscoGame>;
