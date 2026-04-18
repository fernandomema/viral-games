/**
 * Room management — wraps game engines for multiplayer Discord Activities.
 * Supports multiple game types (impostor, impostor-draw, impostor-datos, basta).
 */

import { createImpostorGame, type ImpostorEngine } from '../src/lib/games/impostor/engine.js';
import { createImpostorDrawGame, type ImpostorDrawEngine } from '../src/lib/games/impostor-draw/engine.js';
import { createImpostorDatosGame, type ImpostorDatosEngine } from '../src/lib/games/impostor-datos/engine.js';
import { createBastaGame, type BastaEngine } from '../src/lib/games/basta/engine.js';
import type { WebSocket } from 'ws';

export type GameId = 'impostor' | 'impostor-draw' | 'impostor-datos' | 'basta';
export type GameEngine = ImpostorEngine | ImpostorDrawEngine | ImpostorDatosEngine | BastaEngine;

function createEngine(gameId: GameId): GameEngine {
	switch (gameId) {
		case 'impostor': return createImpostorGame();
		case 'impostor-draw': return createImpostorDrawGame();
		case 'impostor-datos': return createImpostorDatosGame();
		case 'basta': return createBastaGame();
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
	isPublic: boolean;
}

const rooms = new Map<string, Room>();

export function getOrCreateRoom(roomId: string, hostDiscordUserId: string, gameId: GameId, isPublic: boolean = false): Room {
	let room = rooms.get(roomId);
	if (!room) {
		room = {
			id: roomId,
			gameId,
			engine: createEngine(gameId),
			players: [],
			hostDiscordUserId,
			timerInterval: null,
			isPublic,
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

	// Augment players with Discord avatar info
	const playersWithAvatars = state.players.map((p: any) => {
		const rp2 = room.players.find(r => r.enginePlayerId === p.id);
		return {
			...p,
			discordUserId: rp2?.discordUserId ?? null,
			avatar: rp2?.avatar ?? null,
		};
	});

	// Basta game — no roles, different state shape
	if (room.gameId === 'basta') {
		const bastaEngine = room.engine as BastaEngine;
		const bastaState = bastaEngine.getState();

		let winners: string[] | undefined;
		if (bastaState.phase === 'results') {
			winners = bastaEngine.getWinners().map(p => p.name);
		}

		return {
			type: 'state' as const,
			state: {
				...bastaState,
				players: playersWithAvatars,
			},
			myRole: rp ? { playerId: rp.enginePlayerId } : null,
			hostDiscordUserId: room.hostDiscordUserId,
			roomId: room.id,
			gameId: room.gameId,
			winners,
		};
	}

	// Impostor games — role-based
	const activePhases = ['reveal', 'playing', 'drawing', 'voting', 'results'];
	let myRole: any = null;
	if (rp && activePhases.includes(state.phase)) {
		try {
			(room.engine as ImpostorEngine).revealRole;
			myRole = (room.engine as any).revealRole(rp.enginePlayerId);
		} catch { /* player not found — race condition */ }
	}

	const sanitized = {
		...state,
		players: playersWithAvatars,
		roles: [], // never leak roles to clients
	};

	// In results phase, reveal who the impostors were
	let impostorNames: string[] | undefined;
	let impostorWon: boolean | undefined;
	if (state.phase === 'results') {
		const results = (room.engine as any).getResults();
		impostorNames = results.impostors.map((p: any) => p.name);
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

/** List public web rooms that are joinable (lobby phase, web-* prefix) */
export function listWebRooms(): { code: string; gameId: GameId; playerCount: number; hostName: string; players: string[] }[] {
	const result: { code: string; gameId: GameId; playerCount: number; hostName: string; players: string[] }[] = [];
	for (const [id, room] of rooms) {
		if (!id.startsWith('web-')) continue;
		if (!room.isPublic) continue;
		const state = room.engine.getState();
		if (state.phase !== 'lobby') continue;
		// Extract code from "web-basta-XXXX" format
		const parts = id.split('-');
		const code = parts[parts.length - 1];
		const host = room.players.find(p => p.discordUserId === room.hostDiscordUserId);
		result.push({
			code,
			gameId: room.gameId,
			playerCount: room.players.length,
			hostName: host?.userName ?? '?',
			players: room.players.map(p => p.userName),
		});
	}
	return result;
}

/** Start the timer server-side (adapts to game type) */
export function startTimer(room: Room) {
	if (room.timerInterval) clearInterval(room.timerInterval);

	if (room.gameId === 'basta') {
		// Basta: playing timer, can be stopped by any player
		const bastaEngine = room.engine as BastaEngine;
		room.timerInterval = setInterval(() => {
			const remaining = bastaEngine.tick();
			broadcastState(room);
			if (remaining <= 0 && room.timerInterval) {
				clearInterval(room.timerInterval);
				room.timerInterval = null;
			}
		}, 1000);
	} else if (room.gameId === 'impostor-draw') {
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
