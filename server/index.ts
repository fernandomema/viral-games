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
			const { roomId, discordUserId, userName, gameId } = msg;
			if (!roomId || !discordUserId || !userName || !gameId) {
				throw new Error('Faltan campos: roomId, discordUserId, userName, gameId');
			}

			client.discordUserId = discordUserId;
			client.userName = userName;
			client.roomId = roomId;

			const room = getOrCreateRoom(roomId, discordUserId, gameId);
			joinRoom(room, discordUserId, userName, ws);
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
			room.engine.startGame(msg.category);
			// In Discord mode, skip reveal phase — startTimer sets the right phase
			startTimer(room);
			broadcastState(room);
			break;
		}

		case 'vote': {
			const room = getRoom(client.roomId!);
			if (!room) throw new Error('Room no encontrada');

			const rp = room.players.find(p => p.discordUserId === client.discordUserId);
			if (!rp) throw new Error('No estás en la room');

			room.engine.vote(rp.enginePlayerId, msg.targetId);
			broadcastState(room);

			// Auto-finish if all non-eliminated players have voted
			const state = room.engine.getState();
			const alive = state.players.filter(p => !p.eliminated);
			const voteCount = Object.keys(state.votes).length;
			if (voteCount >= alive.length) {
				room.engine.finishVoting();
				broadcastState(room);
			}
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
