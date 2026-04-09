/**
 * Room management — wraps game engines for multiplayer Discord Activities.
 * Supports multiple game types (impostor, impostor-draw, impostor-datos).
 */

import { createImpostorGame, type ImpostorEngine } from '../src/lib/games/impostor/engine.js';
import { createImpostorDrawGame, type ImpostorDrawEngine } from '../src/lib/games/impostor-draw/engine.js';
import { createImpostorDatosGame, type ImpostorDatosEngine } from '../src/lib/games/impostor-datos/engine.js';
import type { WebSocket } from 'ws';

export type GameId = 'impostor' | 'impostor-draw' | 'impostor-datos';
export type GameEngine = ImpostorEngine | ImpostorDrawEngine | ImpostorDatosEngine;

function createEngine(gameId: GameId): GameEngine {
	switch (gameId) {
		case 'impostor': return createImpostorGame();
		case 'impostor-draw': return createImpostorDrawGame();
		case 'impostor-datos': return createImpostorDatosGame();
		default: throw new Error(`Juego desconocido: ${gameId}`);
	}
}

export interface RoomPlayer {
	discordUserId: string;
	userName: string;
	avatar: string | null;
	enginePlayerId: string;
	ws: WebSocket;
}

export interface Room {
	id: string;
	gameId: GameId;
	engine: GameEngine;
	players: RoomPlayer[];
	hostDiscordUserId: string;
	timerInterval: ReturnType<typeof setInterval> | null;
}

const rooms = new Map<string, Room>();

export function getOrCreateRoom(roomId: string, hostDiscordUserId: string, gameId: GameId): Room {
	let room = rooms.get(roomId);
	if (!room) {
		room = {
			id: roomId,
			gameId,
			engine: createEngine(gameId),
			players: [],
			hostDiscordUserId,
			timerInterval: null,
		};
		rooms.set(roomId, room);
	}
	return room;
}

export function getRoom(roomId: string): Room | undefined {
	return rooms.get(roomId);
}

export function deleteRoom(roomId: string) {
	const room = rooms.get(roomId);
	if (room?.timerInterval) clearInterval(room.timerInterval);
	rooms.delete(roomId);
}

export function joinRoom(room: Room, discordUserId: string, userName: string, avatar: string | null, ws: WebSocket): RoomPlayer {
	// Check if already in room (reconnect)
	const existing = room.players.find(p => p.discordUserId === discordUserId);
	if (existing) {
		existing.ws = ws;
		if (avatar) existing.avatar = avatar;
		return existing;
	}

	// Only allow joining during lobby
	const state = room.engine.getState();
	if (state.phase !== 'lobby') {
		throw new Error('La partida ya ha comenzado');
	}

	const enginePlayer = room.engine.addPlayer(userName);
	const rp: RoomPlayer = {
		discordUserId,
		userName,
		avatar,
		enginePlayerId: enginePlayer.id,
		ws,
	};
	room.players.push(rp);
	return rp;
}

export function leaveRoom(room: Room, discordUserId: string) {
	const idx = room.players.findIndex(p => p.discordUserId === discordUserId);
	if (idx === -1) return;

	const rp = room.players[idx];
	const state = room.engine.getState();
	if (state.phase === 'lobby') {
		room.engine.removePlayer(rp.enginePlayerId);
	}
	room.players.splice(idx, 1);

	// If room is empty, delete it
	if (room.players.length === 0) {
		deleteRoom(room.id);
		return;
	}

	// If host left, assign new host
	if (room.hostDiscordUserId === discordUserId) {
		room.hostDiscordUserId = room.players[0].discordUserId;
	}
}

/** Build a personalized state snapshot for a specific player */
export function getPlayerView(room: Room, discordUserId: string) {
	const state = room.engine.getState();
	const rp = room.players.find(p => p.discordUserId === discordUserId);

	const activePhases = ['reveal', 'playing', 'drawing', 'voting', 'results'];
	let myRole: any = null;
	if (rp && activePhases.includes(state.phase)) {
		try {
			myRole = room.engine.revealRole(rp.enginePlayerId);
		} catch { /* player not found — race condition */ }
	}

	// Strip roles from state to prevent cheating (only send own role)
	// Augment players with Discord avatar info
	const playersWithAvatars = state.players.map((p: any) => {
		const rp2 = room.players.find(r => r.enginePlayerId === p.id);
		return {
			...p,
			discordUserId: rp2?.discordUserId ?? null,
			avatar: rp2?.avatar ?? null,
		};
	});

	const sanitized = {
		...state,
		players: playersWithAvatars,
		roles: [], // never leak roles to clients
	};

	// In results phase, reveal who the impostors were
	let impostorNames: string[] | undefined;
	let impostorWon: boolean | undefined;
	if (state.phase === 'results') {
		const results = room.engine.getResults();
		impostorNames = results.impostors.map((p: any) => p.name);
		// Impostor wins if the eliminated player was NOT an impostor
		const eliminatedPlayer = state.players.find((p: any) => p.eliminated);
		const impostorIds = state.roles.filter((r: any) => r.role === 'impostor').map((r: any) => r.playerId);
		impostorWon = eliminatedPlayer ? !impostorIds.includes(eliminatedPlayer.id) : true;
	}

	return {
		type: 'state' as const,
		state: sanitized,
		myRole,
		hostDiscordUserId: room.hostDiscordUserId,
		roomId: room.id,
		gameId: room.gameId,
		impostorNames,
		impostorWon,
	};
}

/** Broadcast personalized state to all connected players */
export function broadcastState(room: Room) {
	for (const rp of room.players) {
		if (rp.ws.readyState === rp.ws.OPEN) {
			const view = getPlayerView(room, rp.discordUserId);
			rp.ws.send(JSON.stringify(view));
		}
	}
}

/** Start the timer server-side (adapts to game type) */
export function startTimer(room: Room) {
	if (room.timerInterval) clearInterval(room.timerInterval);

	if (room.gameId === 'impostor-draw') {
		// Draw mode: turn-based drawing with per-turn timer
		const drawEngine = room.engine as ImpostorDrawEngine;
		drawEngine.setPhase('drawing');
		room.timerInterval = setInterval(() => {
			const remaining = drawEngine.tickTurn();
			broadcastState(room);
			if (remaining <= 0) {
				const { done } = drawEngine.finishTurn();
				broadcastState(room);
				if (done && room.timerInterval) {
					clearInterval(room.timerInterval);
					room.timerInterval = null;
				}
			}
		}, 1000);
	} else {
		// Impostor / Datos: discussion timer
		const engine = room.engine as ImpostorEngine | ImpostorDatosEngine;
		engine.setPhase('playing');
		room.timerInterval = setInterval(() => {
			const remaining = engine.tick();
			broadcastState(room);
			if (remaining <= 0 && room.timerInterval) {
				clearInterval(room.timerInterval);
				room.timerInterval = null;
			}
		}, 1000);
	}
}
