<script lang="ts">
	import { DiscordSDK } from '@discord/embedded-app-sdk';
	import type { GameDef } from '$lib/games/registry';
	import { WORD_CATEGORIES } from '$lib/games/impostor';
	import { DRAW_CATEGORIES } from '$lib/games/impostor-draw';
	import { FACT_CATEGORIES } from '$lib/games/impostor-datos';
	import { haptic, hapticTap } from '$lib/haptics';
	import ShopModal from '$lib/shop/ShopModal.svelte';
	import { initShop, getActiveBackground, getActivePlayerFrame, getActiveVoteEffect } from '$lib/shop';

	let { data } = $props();
	let game: GameDef = $derived(data.game);

	// Categories based on game type
	let categories = $derived(
		game.type === 'word' ? WORD_CATEGORIES :
		game.type === 'draw' ? DRAW_CATEGORIES :
		FACT_CATEGORIES
	);

	// ── State ─────────────────────────────────────────────────────
	let phase = $state<'connecting' | 'authenticating' | 'lobby' | 'playing' | 'voting' | 'results' | 'error'>('connecting');
	let errorMsg = $state('');
	let gameState = $state<any>(null);
	let myRole = $state<any>(null);
	let hostDiscordUserId = $state<string | null>(null);
	let myDiscordUserId = $state<string | null>(null);
	let myUserName = $state<string | null>(null);
	let votingTarget = $state<string | null>(null);
	let selectedCategory = $state<string | undefined>(undefined);
	let configImpostors = $state(1);
	let impostorNames = $state<string[]>([]);
	let impostorWon = $state(false);

	// Config: word + fact use timerSeconds, draw uses timerPerTurn + rounds
	let configTimer = $state(300);
	let configHint = $state(true);
	let configTurnTimer = $state(15);
	let configRounds = $state(2);

	// Shop
	let shopOpen = $state(false);
	let activeBg = $derived(getActiveBackground());
	let activeFrame = $derived(getActivePlayerFrame());
	let activeVoteEffect = $derived(getActiveVoteEffect());

	let ws: WebSocket | null = null;

	const isHost = $derived(myDiscordUserId === hostDiscordUserId);
	const alivePlayers = $derived(gameState?.players.filter((p: any) => !p.eliminated) ?? []);
	const maxImpostors = $derived(Math.max(1, Math.floor((gameState?.players.length || 3) / 3)));
	const myVoteSubmitted = $derived(
		myRole && gameState ? gameState.votes[myRole.playerId] !== undefined : false
	);

	// Role display helpers — impostor-datos uses "fact" instead of "word"
	const myRoleWord = $derived(myRole ? (myRole.word ?? myRole.fact ?? '') : '');

	// ── Discord SDK setup ─────────────────────────────────────────
	const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;

	async function init() {
		try {
			const discordSdk = new DiscordSDK(clientId);
			await discordSdk.ready();

			phase = 'authenticating';

			const { code } = await discordSdk.commands.authorize({
				client_id: clientId,
				response_type: 'code',
				state: '',
				prompt: 'none',
				scope: ['identify'],
			});

			const tokenRes = await fetch('/.proxy/api/token', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code }),
			});
			const tokenData = await tokenRes.json();
			if (!tokenData.access_token) throw new Error(`Token exchange failed: ${JSON.stringify(tokenData)}`);
			const { access_token } = tokenData;

			const auth = await discordSdk.commands.authenticate({ access_token });
			if (!auth) throw new Error('Autenticación fallida');

			myDiscordUserId = auth.user.id;
			myUserName = auth.user.global_name || auth.user.username;

			// Init shop with Discord SDK for IAP
			initShop(discordSdk);

			const roomId = `${discordSdk.channelId || discordSdk.instanceId}-${game.id}`;
			connectWebSocket(roomId);
		} catch (err: any) {
			console.error('Discord init error:', err);
			errorMsg = err.message || 'Error conectando con Discord';
			phase = 'error';
		}
	}

	function connectWebSocket(roomId: string) {
		const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
		const wsUrl = `${protocol}//${location.host}/.proxy/ws`;

		ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			ws!.send(JSON.stringify({
				type: 'join',
				roomId,
				discordUserId: myDiscordUserId,
				userName: myUserName,
				gameId: game.id,
			}));
		};

		ws.onmessage = (event) => {
			const msg = JSON.parse(event.data);
			if (msg.type === 'state') {
				const prevPhase = gameState?.phase;
				gameState = msg.state;
				myRole = msg.myRole;
				hostDiscordUserId = msg.hostDiscordUserId;
				impostorNames = msg.impostorNames ?? [];
				impostorWon = msg.impostorWon ?? false;

				if (gameState) {
					if (gameState.phase === 'lobby') {
						phase = 'lobby';
						votingTarget = null;
					}
					else if (gameState.phase === 'playing' || gameState.phase === 'reveal' || gameState.phase === 'drawing') {
						phase = 'playing';
						votingTarget = null;
					}
					else if (gameState.phase === 'voting') {
						phase = 'voting';
						if (prevPhase !== 'voting') haptic('nudge');
					}
					else if (gameState.phase === 'results') {
						phase = 'results';
						if (prevPhase !== 'results') haptic('success');
					}
				}
			} else if (msg.type === 'error') {
				errorMsg = msg.message;
			}
		};

		ws.onclose = () => {};
	}

	// ── Actions ───────────────────────────────────────────────────
	function send(msg: any) {
		if (ws?.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(msg));
		}
	}

	function startGame() {
		// Send config adapted to game type
		if (game.type === 'draw') {
			send({
				type: 'config',
				config: { impostorCount: configImpostors, timerPerTurn: configTurnTimer, rounds: configRounds, giveImpostorHint: configHint },
			});
		} else if (game.type === 'fact') {
			send({
				type: 'config',
				config: { impostorCount: configImpostors, timerSeconds: configTimer },
			});
		} else {
			send({
				type: 'config',
				config: { impostorCount: configImpostors, timerSeconds: configTimer, giveImpostorHint: configHint },
			});
		}
		send({ type: 'start', category: selectedCategory });
		haptic('success');
	}

	function castVote(targetId: string) {
		votingTarget = targetId;
		send({ type: 'vote', targetId });
		hapticTap();
	}

	function skipToVoting() {
		send({ type: 'skipToVoting' });
		haptic('nudge');
	}

	function playAgain() {
		votingTarget = null;
		impostorNames = [];
		impostorWon = false;
		send({ type: 'playAgain' });
		haptic('success');
	}

	function formatTime(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	}

	$effect(() => { init(); });

	$effect(() => {
		const fontLinks = [
			'/.proxy/google-fonts/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&display=swap',
		];
		for (const href of fontLinks) {
			if (!document.querySelector(`link[href="${href}"]`)) {
				const link = document.createElement('link');
				link.rel = 'stylesheet';
				link.href = href;
				document.head.appendChild(link);
			}
		}
	});
</script>

<div class="h-dvh text-on-background p-3 flex flex-col overflow-hidden relative"
		 style="background: {activeBg.css};">
	{#if activeBg.overlayCSS}
		<div class="absolute inset-0 pointer-events-none" style="background: {activeBg.overlayCSS};"></div>
	{/if}
	<div class="relative flex flex-col flex-1 overflow-hidden">

	<!-- Connecting / Authenticating -->
	{#if phase === 'connecting' || phase === 'authenticating'}
		<div class="flex-1 flex flex-col items-center justify-center gap-3">
			<span class="iconify material-symbols--sports-esports text-5xl text-primary animate-pulse"></span>
			<p class="text-on-surface-variant">
				{phase === 'connecting' ? 'Conectando con Discord...' : 'Autenticando...'}
			</p>
		</div>

	<!-- Error -->
	{:else if phase === 'error'}
		<div class="flex-1 flex flex-col items-center justify-center gap-3">
			<span class="iconify material-symbols--error text-5xl text-error"></span>
			<p class="text-error text-center">{errorMsg}</p>
		</div>

	<!-- Lobby -->
	{:else if phase === 'lobby' && gameState}
		<div class="flex flex-col gap-3 max-w-md mx-auto w-full flex-1 overflow-hidden">
			<!-- Compact header -->
			<div class="flex items-center justify-between py-1">
				<div class="flex-1"></div>
				<div class="text-center">
					<h1 class="text-xl font-bold font-headline tracking-tight inline-flex items-center gap-2">
						<span class="iconify {game.headerIcon} text-2xl text-secondary"></span>
						<span class="text-on-surface">{@html game.cardTitleHtml}</span>
					</h1>
					<p class="text-on-surface-variant text-xs">{gameState.players.length} jugadores</p>
				</div>
				<div class="flex-1 flex justify-end">
					<button onclick={() => { shopOpen = true; hapticTap(); }}
						class="w-8 h-8 rounded-full bg-surface-container-high/60 flex items-center justify-center text-primary hover:bg-surface-container-highest transition-colors">
						<span class="iconify material-symbols--storefront text-lg"></span>
					</button>
				</div>
			</div>

			<!-- Player list -->
			<div class="bg-surface-container rounded-xl p-3 min-h-0 overflow-y-auto shrink">
				<div class="flex flex-wrap gap-1.5">
					{#each gameState.players as player}
						<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high/50 text-sm">
							<span class="iconify material-symbols--person text-primary text-sm"></span>
							<span class="text-on-surface font-medium">{player.name}</span>
						</span>
					{/each}
				</div>
			</div>

			<!-- Config (host only) -->
			{#if isHost}
				<div class="bg-surface-container rounded-xl p-3 flex flex-col gap-3 min-h-0 overflow-y-auto">
					<!-- Category pills -->
					<div>
						<span class="text-xs text-on-surface-variant font-medium mb-1.5 block uppercase tracking-wider">Categoría</span>
						<div class="flex flex-wrap gap-1.5">
							{#each categories as cat}
								<button
									onclick={() => { selectedCategory = selectedCategory === cat.name ? undefined : cat.name; hapticTap(); }}
									class="px-2.5 py-1 rounded-full text-xs font-medium transition-all {selectedCategory === cat.name ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'}"
								>
									<span class="iconify {cat.icon} text-xs align-middle mr-0.5"></span>
									{cat.name}
								</button>
							{/each}
						</div>
					</div>

					<!-- Impostors + Timer row -->
					<div class="flex items-center gap-4">
						<div class="flex items-center gap-2 flex-1">
							<span class="text-xs text-on-surface-variant font-medium">Impostores</span>
							<div class="flex items-center gap-1.5 ml-auto">
								<button onclick={() => { configImpostors = Math.max(1, configImpostors - 1); hapticTap(); }} class="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant text-xs hover:bg-surface-container-high">−</button>
								<span class="text-primary font-bold w-4 text-center text-sm">{configImpostors}</span>
								<button onclick={() => { configImpostors = Math.min(maxImpostors, configImpostors + 1); hapticTap(); }} class="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant text-xs hover:bg-surface-container-high">+</button>
							</div>
						</div>
						<div class="w-px h-6 bg-outline-variant/20"></div>
						{#if game.type === 'draw'}
							<div class="flex items-center gap-2 flex-1">
								<span class="text-xs text-on-surface-variant font-medium">Turno</span>
								<span class="text-primary font-bold text-sm ml-auto">{configTurnTimer}s</span>
							</div>
						{:else}
							<div class="flex items-center gap-2 flex-1">
								<span class="text-xs text-on-surface-variant font-medium">Timer</span>
								<span class="text-primary font-bold text-sm ml-auto">{formatTime(configTimer)}</span>
							</div>
						{/if}
					</div>

					{#if game.type === 'draw'}
						<input type="range" min={5} max={30} step={5} bind:value={configTurnTimer}
							class="w-full accent-primary h-1" />
						<div class="flex items-center gap-4">
							<div class="flex items-center gap-2 flex-1">
								<span class="text-xs text-on-surface-variant font-medium">Rondas</span>
								<div class="flex items-center gap-1.5 ml-auto">
									<button onclick={() => { configRounds = Math.max(1, configRounds - 1); hapticTap(); }} class="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant text-xs hover:bg-surface-container-high">−</button>
									<span class="text-primary font-bold w-4 text-center text-sm">{configRounds}</span>
									<button onclick={() => { configRounds = Math.min(5, configRounds + 1); hapticTap(); }} class="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant text-xs hover:bg-surface-container-high">+</button>
								</div>
							</div>
						</div>
					{:else}
						<input type="range" min={60} max={600} step={30} bind:value={configTimer}
							class="w-full accent-primary h-1" />
					{/if}

					<!-- Hint toggle (word + draw only) -->
					{#if game.type !== 'fact'}
						<label class="flex items-center justify-between cursor-pointer">
							<span class="text-xs text-on-surface-variant font-medium">Pista al impostor</span>
							<input type="checkbox" bind:checked={configHint} class="accent-primary" />
						</label>
					{/if}
				</div>

				<!-- Start button -->
				<button
					onclick={startGame}
					disabled={gameState.players.length < 3}
					class="w-full py-2.5 rounded-xl font-bold font-headline transition-all shrink-0
						{gameState.players.length >= 3
							? 'bg-primary text-on-primary hover:brightness-110 active:scale-[0.98]'
							: 'bg-surface-container-highest text-on-surface-variant/50 cursor-not-allowed'}"
				>
					{gameState.players.length < 3
						? `Faltan ${3 - gameState.players.length} jugadores`
						: '¡Empezar!'}
				</button>
			{:else}
				<div class="flex-1 flex flex-col items-center justify-center">
					<span class="iconify material-symbols--hourglass-top text-2xl text-on-surface-variant/50 mb-1"></span>
					<p class="text-on-surface-variant text-sm">Esperando al host...</p>
				</div>
			{/if}
		</div>

	<!-- Playing (word/fact: discussion, draw: drawing turns) -->
	{:else if phase === 'playing' && gameState && myRole}
		<div class="flex-1 flex flex-col items-center justify-center gap-4 max-w-md mx-auto w-full">
			<!-- Timer -->
			{#if game.type === 'draw'}
				{@const tRemaining = gameState.turnTimerRemaining ?? 0}
				{@const drawer = gameState.players[gameState.currentDrawerIndex ?? 0]}
				<div class="text-center">
					<p class="text-on-surface-variant text-xs">Ronda {gameState.currentRound ?? 1} — Turno de</p>
					<p class="text-primary font-bold text-lg font-headline">{drawer?.name ?? '...'}</p>
					<p class="text-3xl font-bold font-headline tracking-tighter {tRemaining <= 5 ? 'text-error animate-pulse' : 'text-primary'}">
						{tRemaining}s
					</p>
				</div>
			{:else}
				<p class="text-5xl font-bold font-headline tracking-tighter {gameState.timerRemaining <= 30 ? 'text-error animate-pulse' : 'text-primary'}">
					{formatTime(gameState.timerRemaining)}
				</p>
			{/if}

			<!-- Your role card -->
			<div class="w-full bg-surface-container rounded-xl p-4 text-center">
				{#if myRole.role === 'impostor'}
					<span class="iconify material-symbols--person-alert text-3xl text-error"></span>
					<p class="text-error font-bold text-lg font-headline">¡Eres el IMPOSTOR!</p>
					{#if myRoleWord && myRoleWord !== '???' && myRoleWord !== ''}
						<p class="text-on-surface-variant text-sm">Pista: <span class="text-error font-bold">{myRoleWord}</span></p>
					{:else}
						<p class="text-on-surface-variant text-xs">Sin pista — improvisa</p>
					{/if}
				{:else}
					<span class="iconify material-symbols--shield-person text-3xl text-secondary"></span>
					<p class="text-secondary font-bold text-lg font-headline">{game.citizenLabel}</p>
					{#if game.type === 'fact'}
						<p class="text-on-surface-variant text-sm">Tu dato: <span class="text-secondary font-bold">{myRoleWord}</span></p>
					{:else}
						<p class="text-on-surface-variant text-sm">Tu palabra: <span class="text-secondary font-bold">{myRoleWord}</span></p>
					{/if}
				{/if}
			</div>

			<!-- Instructions -->
			<p class="text-on-surface-variant text-xs text-center px-4">
				{#if game.type === 'fact'}
					{myRole.role === 'impostor'
						? 'Lee tu dato falso como si fuera verdad. No dejes que te descubran.'
						: 'Comparte tu dato real. Observa quién podría tener el dato falso.'}
				{:else if game.type === 'draw'}
					{myRole.role === 'impostor'
						? 'Dibuja algo que parezca la palabra sin conocerla.'
						: 'Dibuja la palabra secreta. Observa quién dibuja algo extraño.'}
				{:else}
					{myRole.role === 'impostor'
						? 'Describe la palabra sin que descubran que no la conoces.'
						: 'Describe tu palabra con cuidado — el impostor te escucha.'}
				{/if}
			</p>

			{#if isHost}
				<button onclick={skipToVoting}
					class="px-5 py-1.5 rounded-lg bg-surface-container-highest text-on-surface-variant text-sm font-medium hover:bg-surface-container-high transition-all active:scale-95">
					Saltar a votación
				</button>
			{/if}
		</div>

	<!-- Voting -->
	{:else if phase === 'voting' && gameState}
		<div class="flex-1 flex flex-col gap-3 max-w-md mx-auto w-full">
			<div class="text-center py-1">
				<span class="iconify material-symbols--how-to-vote text-3xl text-primary"></span>
				<h2 class="text-xl font-bold font-headline">{game.votingTitle}</h2>
				<p class="text-on-surface-variant text-xs">
					{myVoteSubmitted ? 'Voto registrado' : game.votingSubtitle}
				</p>
			</div>

			<div class="flex flex-col gap-1.5 overflow-y-auto min-h-0 flex-1">
				{#each alivePlayers as player}
					{@const isMe = myRole?.playerId === player.id}
					{@const isSelected = votingTarget === player.id}
					{#if !isMe}
						<button
							onclick={() => { if (!myVoteSubmitted) castVote(player.id); }}
							disabled={myVoteSubmitted}
							class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all
								{isSelected
									? 'bg-primary text-on-primary ring-2 ring-primary/50'
									: myVoteSubmitted
										? 'bg-surface-container text-on-surface-variant/50 cursor-not-allowed'
										: 'bg-surface-container text-on-surface hover:bg-surface-container-high active:scale-[0.98]'}"
						>
							<span class="iconify {isSelected ? 'material-symbols--check-circle' : 'material-symbols--person'} text-lg"></span>
							<span class="font-medium text-sm">{player.name}</span>
							{#if isSelected && activeVoteEffect.emoji}
								<span class="ml-auto text-base">{activeVoteEffect.emoji}</span>
							{/if}
						</button>
					{/if}
				{/each}
			</div>

			{#if myVoteSubmitted}
				<div class="bg-surface-container rounded-lg p-2.5 text-center shrink-0">
					<span class="iconify material-symbols--pending text-xl text-primary"></span>
					<p class="text-on-surface-variant text-xs">Esperando a los demás...</p>
				</div>
			{/if}
		</div>

	<!-- Results -->
	{:else if phase === 'results' && gameState && myRole}
		{@const isImpostor = myRole.role === 'impostor'}
		{@const impostorCaught = !impostorWon}
		<div class="flex-1 flex flex-col items-center justify-center gap-3 max-w-md mx-auto w-full">
			<!-- Result header -->
			<div class="text-center">
				{#if isImpostor}
					<span class="iconify {impostorCaught ? 'material-symbols--sentiment-very-dissatisfied' : 'material-symbols--celebration'} text-5xl {impostorCaught ? 'text-error' : 'text-secondary'}"></span>
					<h2 class="text-xl font-bold font-headline">
						{impostorCaught ? '¡Te descubrieron!' : '¡Escapaste!'}
					</h2>
				{:else}
					<span class="iconify {impostorCaught ? 'material-symbols--celebration' : 'material-symbols--sentiment-very-dissatisfied'} text-5xl {impostorCaught ? 'text-secondary' : 'text-error'}"></span>
					<h2 class="text-xl font-bold font-headline">
						{impostorCaught ? '¡Impostor atrapado!' : '¡El impostor escapó!'}
					</h2>
				{/if}
			</div>

			<!-- Info cards -->
			<div class="w-full grid grid-cols-2 gap-2">
				{#if impostorNames.length > 0}
					<div class="bg-surface-container rounded-xl p-3 text-center">
						<p class="text-on-surface-variant text-[10px] uppercase tracking-wider">{impostorNames.length === 1 ? 'Impostor' : 'Impostores'}</p>
						<p class="text-error font-bold text-sm">{impostorNames.join(', ')}</p>
					</div>
				{/if}

				{#each gameState.players.filter((p: any) => p.eliminated) as eliminated}
					<div class="bg-surface-container rounded-xl p-3 text-center">
						<p class="text-on-surface-variant text-[10px] uppercase tracking-wider">Eliminado</p>
						<p class="text-on-surface font-bold text-sm">{eliminated.name}</p>
					</div>
				{/each}

				{#if game.type === 'fact'}
					<!-- Fact game: show real fact + fake fact -->
					{#if gameState.realFact}
						<div class="bg-surface-container rounded-xl p-3 text-center">
							<p class="text-on-surface-variant text-[10px] uppercase tracking-wider">Dato real</p>
							<p class="text-secondary font-bold text-xs">{gameState.realFact}</p>
						</div>
					{/if}
					{#if gameState.fakeFact}
						<div class="bg-surface-container rounded-xl p-3 text-center">
							<p class="text-on-surface-variant text-[10px] uppercase tracking-wider">Dato falso</p>
							<p class="text-error font-bold text-xs">{gameState.fakeFact}</p>
						</div>
					{/if}
				{:else}
					<!-- Word/Draw: show secret word + impostor hint -->
					<div class="bg-surface-container rounded-xl p-3 text-center">
						<p class="text-on-surface-variant text-[10px] uppercase tracking-wider">Palabra</p>
						<p class="text-secondary font-bold text-sm">{gameState.secretWord}</p>
					</div>
					{#if gameState.impostorWord}
						<div class="bg-surface-container rounded-xl p-3 text-center">
							<p class="text-on-surface-variant text-[10px] uppercase tracking-wider">Pista impostor</p>
							<p class="text-error font-bold text-sm">{gameState.impostorWord}</p>
						</div>
					{/if}
				{/if}
			</div>

			{#if isHost}
				<button onclick={playAgain}
					class="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold font-headline hover:brightness-110 active:scale-[0.98] transition-all">
					Jugar otra vez
				</button>
			{:else}
				<p class="text-on-surface-variant text-xs">Esperando al host...</p>
			{/if}
		</div>
	{/if}
	</div><!-- /relative wrapper -->
</div>

<ShopModal bind:open={shopOpen} />
