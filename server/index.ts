/**
 * Discord Activity server — Express + WebSocket.
 * Handles OAuth2 token exchange, real-time game state, and static file serving in production.
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, type WebSocket } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
	getOrCreateRoom,
	getRoom,
	joinRoom,
	leaveRoom,
	broadcastState,
	startTimer,
	listWebRooms,
} from './rooms.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

// ── OAuth2 token exchange ─────────────────────────────────────
app.post('/api/token', async (req, res) => {
	const { code } = req.body;
	if (!code) {
		res.status(400).json({ error: 'Missing code' });
		return;
	}

	const clientId = process.env.VITE_DISCORD_CLIENT_ID;
	const clientSecret = process.env.DISCORD_CLIENT_SECRET;

	if (!clientId || !clientSecret) {
		res.status(500).json({ error: 'Missing Discord credentials in env' });
		return;
	}

	try {
		const response = await fetch('https://discord.com/api/oauth2/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				client_id: clientId,
				client_secret: clientSecret,
				grant_type: 'authorization_code',
				code,
			}),
		});

		const data = await response.json();
		console.log('[Token] Discord response status:', response.status);
		if (!data.access_token) {
			console.error('[Token] Discord error:', data);
			res.status(400).json({ error: 'Token exchange failed', details: data });
			return;
		}
		res.json({ access_token: data.access_token });
	} catch (err) {
		console.error('Token exchange failed:', err);
		res.status(500).json({ error: 'Token exchange failed' });
	}
});

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
	res.json({ ok: true });
});

// ── Web rooms listing ─────────────────────────────────────────
app.get('/api/web/rooms', (_req, res) => {
	res.json({ rooms: listWebRooms() });
});

// ── Entitlements (server-side verification) ───────────────────
app.get('/api/entitlements/:userId', async (req, res) => {
	const { userId } = req.params;
	const clientId = process.env.VITE_DISCORD_CLIENT_ID;
	const clientSecret = process.env.DISCORD_CLIENT_SECRET;

	if (!clientId || !clientSecret) {
		res.status(500).json({ error: 'Missing Discord credentials' });
		return;
	}

	try {
		const response = await fetch(
			`https://discord.com/api/v10/applications/${clientId}/entitlements?user_id=${encodeURIComponent(userId)}&exclude_ended=true`,
			{
				headers: {
					Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
				},
			}
		);

		if (!response.ok) {
			console.error('[Entitlements] Discord API error:', response.status);
			res.status(response.status).json({ error: 'Discord API error' });
			return;
		}

		const entitlements = await response.json();
		res.json({ entitlements });
	} catch (err) {
		console.error('[Entitlements] Failed:', err);
		res.status(500).json({ error: 'Failed to fetch entitlements' });
	}
});

// ── HTTP + WebSocket server ───────────────────────────────────
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

interface ClientState {
	discordUserId?: string;
	userName?: string;
	roomId?: string;
}

wss.on('connection', (ws: WebSocket) => {
	const client: ClientState = {};

	ws.on('message', (raw) => {
		let msg: any;
		try {
			msg = JSON.parse(raw.toString());
		} catch {
			ws.send(JSON.stringify({ type: 'error', message: 'JSON inválido' }));
			return;
		}

		try {
			handleMessage(ws, client, msg);
		} catch (err: any) {
			ws.send(JSON.stringify({ type: 'error', message: err.message || 'Error desconocido' }));
		}
	});

	ws.on('close', () => {
		if (client.roomId && client.discordUserId) {
			const room = getRoom(client.roomId);
			if (room) {
				leaveRoom(room, client.discordUserId);
				broadcastState(room);
			}
		}
	});
});

function handleMessage(ws: WebSocket, client: ClientState, msg: any) {
	switch (msg.type) {
		case 'join': {
			const { roomId, discordUserId, userName, gameId, avatar, isPublic } = msg;
			if (!roomId || !discordUserId || !userName || !gameId) {
				throw new Error('Faltan campos: roomId, discordUserId, userName, gameId');
			}

			client.discordUserId = discordUserId;
			client.userName = userName;
			client.roomId = roomId;

			const room = getOrCreateRoom(roomId, discordUserId, gameId, !!isPublic);
			joinRoom(room, discordUserId, userName, avatar ?? null, ws);
			broadcastState(room);
			break;
		}

		case 'config': {
			const room = getRoom(client.roomId!);
			if (!room || room.hostDiscordUserId !== client.discordUserId) {
				throw new Error('Solo el host puede cambiar la config');
			}
			room.engine.setConfig(msg.config);
			broadcastState(room);
			break;
		}

		case 'start': {
			const room = getRoom(client.roomId!);
			if (!room || room.hostDiscordUserId !== client.discordUserId) {
				throw new Error('Solo el host puede iniciar la partida');
			}
			if (room.gameId === 'basta') {
				room.engine.startGame();
			} else {
				(room.engine as any).startGame(msg.category);
			}
			// In Discord mode, skip reveal phase — startTimer sets the right phase
			startTimer(room);
			broadcastState(room);
			break;
		}

		case 'vote': {
			const room = getRoom(client.roomId!);
			if (!room) throw new Error('Room no encontrada');
			if (room.gameId === 'basta') throw new Error('Usa bastaVote para basta');

			const rp = room.players.find(p => p.discordUserId === client.discordUserId);
			if (!rp) throw new Error('No estás en la room');

			(room.engine as any).vote(rp.enginePlayerId, msg.targetId);
			broadcastState(room);

			// Auto-finish if all non-eliminated players have voted
			const state = room.engine.getState();
			const alive = state.players.filter((p: any) => !p.eliminated);
			const voteCount = Object.keys((state as any).votes).length;
			if (voteCount >= alive.length) {
				(room.engine as any).finishVoting();
				broadcastState(room);
			}
			break;
		}

		// ── Basta-specific messages ───────────────────────────────
		case 'bastaSubmitAnswers': {
			const room = getRoom(client.roomId!);
			if (!room || room.gameId !== 'basta') throw new Error('No es un juego de basta');

			const rp = room.players.find(p => p.discordUserId === client.discordUserId);
			if (!rp) throw new Error('No estás en la room');

			const bastaEngine = room.engine as import('../src/lib/games/basta/engine.js').BastaEngine;
			bastaEngine.submitAnswers(rp.enginePlayerId, msg.answers);
			broadcastState(room);
			break;
		}

		case 'bastaStop': {
			const room = getRoom(client.roomId!);
			if (!room || room.gameId !== 'basta') throw new Error('No es un juego de basta');

			const rp = room.players.find(p => p.discordUserId === client.discordUserId);
			if (!rp) throw new Error('No estás en la room');

			const bastaEngine2 = room.engine as import('../src/lib/games/basta/engine.js').BastaEngine;
			bastaEngine2.stopRound(rp.enginePlayerId);
			if (room.timerInterval) {
				clearInterval(room.timerInterval);
				room.timerInterval = null;
			}
			broadcastState(room);
			break;
		}

		case 'bastaVote': {
			const room = getRoom(client.roomId!);
			if (!room || room.gameId !== 'basta') throw new Error('No es un juego de basta');

			const rp = room.players.find(p => p.discordUserId === client.discordUserId);
			if (!rp) throw new Error('No estás en la room');

			const bastaEngine3 = room.engine as import('../src/lib/games/basta/engine.js').BastaEngine;
			bastaEngine3.submitVote(rp.enginePlayerId, msg.targetPlayerId, msg.category, msg.valid);
			broadcastState(room);

			// Auto-finish voting when all votes are in
			if (bastaEngine3.allVotesIn()) {
				bastaEngine3.finishVoting();
				broadcastState(room);
			}
			break;
		}

		case 'bastaNextRound': {
			const room = getRoom(client.roomId!);
			if (!room || room.gameId !== 'basta') throw new Error('No es un juego de basta');
			if (room.hostDiscordUserId !== client.discordUserId) {
				throw new Error('Solo el host puede avanzar de ronda');
			}

			const bastaEngine4 = room.engine as import('../src/lib/games/basta/engine.js').BastaEngine;
			bastaEngine4.nextRound();
			const newState = bastaEngine4.getState();
			if (newState.phase === 'playing') {
				startTimer(room);
			}
			broadcastState(room);
			break;
		}

		case 'skipToVoting': {
			const room = getRoom(client.roomId!);
			if (!room || room.hostDiscordUserId !== client.discordUserId) {
				throw new Error('Solo el host puede saltar a votación');
			}
			if (room.timerInterval) {
				clearInterval(room.timerInterval);
				room.timerInterval = null;
			}
			room.engine.setPhase('voting');
			broadcastState(room);
			break;
		}

		case 'playAgain': {
			const room = getRoom(client.roomId!);
			if (!room || room.hostDiscordUserId !== client.discordUserId) {
				throw new Error('Solo el host puede reiniciar');
			}
			room.engine.reset();
			broadcastState(room);
			break;
		}

		default:
			throw new Error(`Tipo de mensaje desconocido: ${msg.type}`);
	}
}

const PORT = parseInt(process.env.PORT || '3001', 10);

// In production, serve the SvelteKit static build
import { existsSync } from 'fs';
const buildPath = join(__dirname, '..', 'build');
if (existsSync(join(buildPath, 'index.html'))) {
	app.use(express.static(buildPath));
	// SPA fallback — serve index.html for all non-API/non-file routes
	app.get('{*path}', (_req, res) => {
		res.sendFile(join(buildPath, 'index.html'));
	});
}

server.listen(PORT, () => {
	console.log(`🎮 Discord Activity server running on http://localhost:${PORT}`);
});
