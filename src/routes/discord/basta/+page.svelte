<script lang="ts">
	import { DiscordSDK } from '@discord/embedded-app-sdk';
	import GameSwitcher from '$lib/components/GameSwitcher.svelte';
	import type { GameDef } from '$lib/games/registry';
	import { haptic, hapticTap } from '$lib/haptics';
	import ShopModal from '$lib/shop/ShopModal.svelte';
	import { initShop, getActiveBackground } from '$lib/shop';
	import { t, detectLocale } from '$lib/i18n';

	let { data } = $props();
	let game: GameDef = $derived(data.game);

	// ── State ─────────────────────────────────────────────────────
	let phase = $state<'connecting' | 'authenticating' | 'lobby' | 'playing' | 'voting' | 'scores' | 'results' | 'error'>('connecting');
	let errorMsg = $state('');
	let gameState = $state<any>(null);
	let myPlayerId = $state<string | null>(null);
	let hostDiscordUserId = $state<string | null>(null);
	let myDiscordUserId = $state<string | null>(null);
	let myUserName = $state<string | null>(null);
	let winners = $state<string[]>([]);
	let myAvatarHash = $state<string | null>(null);
	let speakingUsers = $state(new Set<string>());

	// Config
	let configTimer = $state(60);
	let configRounds = $state(3);

	// Playing phase: local answers
	let myAnswers = $state<Record<string, string>>({});
	let answersSubmitted = $state(false);

	// Voting phase: track my votes
	let myVotes = $state<Record<string, Record<string, boolean>>>({});
	// { targetPlayerId: { category: valid } }

	// Shop
	let shopOpen = $state(false);
	let activeBg = $derived(getActiveBackground());

	let ws: WebSocket | null = null;

	const isHost = $derived(myDiscordUserId === hostDiscordUserId);

	// ── Discord SDK setup ─────────────────────────────────────────
	const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;

	async function init() {
		try {
			const discordSdk = new DiscordSDK(clientId);
			await discordSdk.ready();

			try {
				const { locale } = await discordSdk.commands.userSettingsGetLocale();
				detectLocale(locale);
			} catch {
				detectLocale();
			}

			phase = 'authenticating';

			const { code } = await discordSdk.commands.authorize({
				client_id: clientId,
				response_type: 'code',
				state: '',
				prompt: 'none',
				scope: ['identify', 'rpc.voice.read'],
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
			if (!auth) throw new Error(t('discord.authFailed'));

			myDiscordUserId = auth.user.id;
			myUserName = auth.user.global_name || auth.user.username;
			myAvatarHash = auth.user.avatar ?? null;

			// Subscribe to voice speaking events
			const channelId = discordSdk.channelId;
			if (channelId) {
				try {
					await discordSdk.subscribe('SPEAKING_START', (data: any) => {
						speakingUsers = new Set([...speakingUsers, data.user_id]);
					}, { channel_id: channelId });
					await discordSdk.subscribe('SPEAKING_STOP', (data: any) => {
						const next = new Set(speakingUsers);
						next.delete(data.user_id);
						speakingUsers = next;
					}, { channel_id: channelId });
				} catch { /* voice may not be available */ }
			}

			initShop(discordSdk);

			const roomId = `${discordSdk.channelId || discordSdk.instanceId}-basta`;
			connectWebSocket(roomId);
		} catch (err: any) {
			console.error('Discord init error:', err);
			errorMsg = err.message || t('discord.connectError');
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
				avatar: myAvatarHash,
				gameId: 'basta',
			}));
		};

		ws.onmessage = (event) => {
			const msg = JSON.parse(event.data);
			if (msg.type === 'state') {
				const prevPhase = gameState?.phase;
				gameState = msg.state;
				myPlayerId = msg.myRole?.playerId ?? null;
				hostDiscordUserId = msg.hostDiscordUserId;
				winners = msg.winners ?? [];

				if (gameState) {
					if (gameState.phase === 'lobby') {
						phase = 'lobby';
						answersSubmitted = false;
						myAnswers = {};
						myVotes = {};
					} else if (gameState.phase === 'playing') {
						if (prevPhase !== 'playing') {
							// New round started
							answersSubmitted = false;
							myAnswers = {};
							myVotes = {};
						}
						phase = 'playing';
					} else if (gameState.phase === 'voting') {
						phase = 'voting';
						if (prevPhase !== 'voting') haptic('nudge');
					} else if (gameState.phase === 'scores') {
						phase = 'scores';
					} else if (gameState.phase === 'results') {
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
		send({ type: 'config', config: { timerSeconds: configTimer, totalRounds: configRounds } });
		send({ type: 'start' });
		haptic('success');
	}

	function submitMyAnswers() {
		send({ type: 'bastaSubmitAnswers', answers: myAnswers });
		answersSubmitted = true;
		hapticTap();
	}

	function pressStop() {
		send({ type: 'bastaStop' });
		haptic('nudge');
	}

	function submitVote(targetPlayerId: string, category: string, valid: boolean) {
		if (!myVotes[targetPlayerId]) myVotes[targetPlayerId] = {};
		myVotes[targetPlayerId][category] = valid;
		myVotes = { ...myVotes }; // trigger reactivity
		send({ type: 'bastaVote', targetPlayerId, category, valid });
		hapticTap();
	}

	function nextRound() {
		send({ type: 'bastaNextRound' });
		haptic('success');
	}

	function playAgain() {
		send({ type: 'playAgain' });
		haptic('success');
	}

	function formatTime(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	}

	function avatarUrl(discordUserId: string | null, avatarHash: string | null, size = 64): string | null {
		if (!discordUserId || !avatarHash) return null;
		return `https://cdn.discordapp.com/avatars/${discordUserId}/${avatarHash}.webp?size=${size}`;
	}

	function isSpeaking(discordUserId: string | null): boolean {
		if (!discordUserId) return false;
		return speakingUsers.has(discordUserId);
	}

	function getPlayerName(playerId: string): string {
		return gameState?.players.find((p: any) => p.id === playerId)?.name ?? '?';
	}

	function getPlayerAnswer(playerId: string, category: string): string {
		const pa = gameState?.answers?.find((a: any) => a.playerId === playerId);
		return pa?.answers?.[category]?.trim() ?? '';
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
			<span class="iconify material-symbols--edit-note text-5xl text-amber-500 animate-pulse"></span>
			<p class="text-on-surface-variant">
				{phase === 'connecting' ? t('discord.connecting') : t('discord.authenticating')}
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
			<!-- Header -->
			<div class="flex items-center justify-between py-1">
				<div class="flex-1"></div>
				<div class="text-center">
					<h1 class="text-xl font-bold font-headline tracking-tight inline-flex items-center gap-2">
						<span class="iconify material-symbols--edit-note text-2xl text-amber-500"></span>
						<span class="text-transparent bg-clip-text bg-linear-to-r from-amber-500 to-amber-300">¡BASTA!</span>
					</h1>
					<p class="text-on-surface-variant text-xs">{t('discord.playersCount', { count: gameState.players.length })}</p>
				</div>
				<div class="flex-1 flex justify-end gap-1.5">
					<GameSwitcher currentGame={game} buildHref={(g) => `/discord/${g.id}${new URL(window.location.href).search}`} />
					<button onclick={() => { shopOpen = true; hapticTap(); }}
						class="w-8 h-8 rounded-full bg-surface-container-high/60 flex items-center justify-center text-amber-500 hover:bg-surface-container-highest transition-colors">
						<span class="iconify material-symbols--storefront text-lg"></span>
					</button>
				</div>
			</div>

			<!-- Player list -->
			<div class="bg-surface-container rounded-xl p-3 min-h-0 overflow-y-auto shrink">
				<div class="flex flex-wrap gap-1.5">
					{#each gameState.players as player}
						{@const avatarSrc = avatarUrl(player.discordUserId, player.avatar)}
						{@const speaking = isSpeaking(player.discordUserId)}
						<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high/50 text-sm transition-all {speaking ? 'ring-2 ring-green-400 ring-offset-1 ring-offset-surface-container' : ''}">
							{#if avatarSrc}
								<img src={avatarSrc} alt="" class="w-5 h-5 rounded-full object-cover" />
							{:else}
								<span class="iconify material-symbols--person text-amber-500 text-sm"></span>
							{/if}
							<span class="text-on-surface font-medium">{player.name}</span>
						</span>
					{/each}
				</div>
			</div>

			<!-- Config (host only) -->
			{#if isHost}
				<div class="bg-surface-container rounded-xl p-3 flex flex-col gap-3 min-h-0 overflow-y-auto">
					<!-- Timer -->
					<div class="flex items-center gap-4">
						<div class="flex items-center gap-2 flex-1">
							<span class="text-xs text-on-surface-variant font-medium">{t('basta.timer')}</span>
							<span class="text-amber-500 font-bold text-sm ml-auto">{formatTime(configTimer)}</span>
						</div>
						<div class="w-px h-6 bg-outline-variant/20"></div>
						<div class="flex items-center gap-2 flex-1">
							<span class="text-xs text-on-surface-variant font-medium">{t('basta.rounds')}</span>
							<div class="flex items-center gap-1.5 ml-auto">
								<button onclick={() => { configRounds = Math.max(1, configRounds - 1); hapticTap(); }} class="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant text-xs hover:bg-surface-container-high">−</button>
								<span class="text-amber-500 font-bold w-4 text-center text-sm">{configRounds}</span>
								<button onclick={() => { configRounds = Math.min(10, configRounds + 1); hapticTap(); }} class="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant text-xs hover:bg-surface-container-high">+</button>
							</div>
						</div>
					</div>

					<input type="range" min={30} max={120} step={10} bind:value={configTimer}
						class="w-full accent-amber-500 h-1" />
				</div>

				<!-- Start button -->
				<button
					onclick={startGame}
					disabled={gameState.players.length < 2}
					class="w-full py-2.5 rounded-xl font-bold font-headline transition-all shrink-0
						{gameState.players.length >= 2
							? 'bg-amber-500 text-black hover:brightness-110 active:scale-[0.98]'
							: 'bg-surface-container-highest text-on-surface-variant/50 cursor-not-allowed'}"
				>
					{gameState.players.length < 2
					? t('basta.minPlayers')
					: t('discord.letsGo')}
				</button>
			{:else}
				<div class="flex-1 flex flex-col items-center justify-center">
					<span class="iconify material-symbols--hourglass-top text-2xl text-on-surface-variant/50 mb-1"></span>
					<p class="text-on-surface-variant text-sm">{t('discord.waitingHost')}</p>
				</div>
			{/if}
		</div>

	<!-- Playing: fill in answers -->
	{:else if phase === 'playing' && gameState}
		<div class="flex flex-col gap-3 max-w-md mx-auto w-full flex-1 overflow-hidden">
			<!-- Header: letter + timer + round -->
			<div class="flex items-center justify-between py-1">
				<p class="text-xs text-on-surface-variant">{t('basta.round', { current: gameState.currentRound, total: gameState.config.totalRounds })}</p>
				<div class="flex items-center gap-2">
					<span class="text-2xl font-bold font-headline {gameState.timerRemaining <= 10 ? 'text-error animate-pulse' : 'text-amber-500'}">
						{formatTime(gameState.timerRemaining)}
					</span>
				</div>
			</div>

			<!-- Big letter display -->
			<div class="bg-surface-container rounded-xl p-4 text-center">
				<p class="text-xs text-on-surface-variant uppercase tracking-wider mb-1">{t('basta.letter')}</p>
				<p class="text-6xl font-bold font-headline text-amber-500">{gameState.currentLetter}</p>
			</div>

			<!-- Category inputs -->
			<div class="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0">
				{#each gameState.categories as category}
					<div class="bg-surface-container rounded-lg p-2.5 flex items-center gap-2">
						<span class="text-xs text-on-surface-variant font-medium w-20 shrink-0 truncate">{category}</span>
						<input
							type="text"
							placeholder="{gameState.currentLetter}..."
							bind:value={myAnswers[category]}
							disabled={answersSubmitted}
							class="flex-1 bg-surface-container-highest rounded-lg px-2.5 py-1.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 focus:ring-amber-500/50 disabled:opacity-50"
						/>
						{#if answersSubmitted}
							<span class="iconify material-symbols--check-circle text-green-500 text-lg"></span>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Submit / Stop buttons -->
			<div class="flex gap-2 shrink-0">
				{#if !answersSubmitted}
					<button
						onclick={submitMyAnswers}
						class="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-bold font-headline hover:brightness-110 active:scale-[0.98] transition-all"
					>
						{t('basta.answered')}
					</button>
				{:else}
					<div class="flex-1 py-2.5 rounded-xl bg-surface-container text-on-surface-variant text-center text-sm font-medium flex items-center justify-center gap-1.5">
						<span class="iconify material-symbols--check-circle text-green-500"></span>
						{t('basta.waiting')}
					</div>
				{/if}
				<button
					onclick={pressStop}
					class="px-6 py-2.5 rounded-xl bg-error text-on-error font-bold font-headline hover:brightness-110 active:scale-[0.98] transition-all"
				>
					{t('basta.stop')}
				</button>
			</div>
		</div>

	<!-- Voting: validate other players' answers -->
	{:else if phase === 'voting' && gameState}
		<div class="flex flex-col gap-3 max-w-md mx-auto w-full flex-1 overflow-hidden">
			<div class="text-center py-1">
				<span class="iconify material-symbols--how-to-vote text-3xl text-amber-500"></span>
				<h2 class="text-lg font-bold font-headline">{t('basta.validateAnswers')}</h2>
				<p class="text-xs text-on-surface-variant">{t('basta.round', { current: gameState.currentRound, total: gameState.config.totalRounds })}</p>
			</div>

			<!-- Letter reminder -->
			<div class="bg-surface-container rounded-lg p-2 text-center">
				<span class="text-xs text-on-surface-variant">{t('basta.letter')}:</span>
				<span class="text-amber-500 font-bold text-lg ml-1">{gameState.currentLetter}</span>
			</div>

			<!-- Scrollable answers for each player -->
			<div class="flex-1 overflow-y-auto flex flex-col gap-3 min-h-0">
				{#each gameState.players.filter((p: any) => p.id !== myPlayerId) as player}
					{@const avatarSrc = avatarUrl(player.discordUserId, player.avatar)}
					<div class="bg-surface-container rounded-xl p-3">
						<div class="flex items-center gap-2 mb-2">
							{#if avatarSrc}
								<img src={avatarSrc} alt="" class="w-5 h-5 rounded-full object-cover" />
							{:else}
								<span class="iconify material-symbols--person text-amber-500"></span>
							{/if}
							<span class="font-medium text-sm text-on-surface">{player.name}</span>
						</div>

						{#each gameState.categories as category}
							{@const answer = getPlayerAnswer(player.id, category)}
							{@const voted = myVotes[player.id]?.[category] !== undefined}
							{@const isValid = myVotes[player.id]?.[category]}
							<div class="flex items-center gap-2 py-1.5 border-b border-outline-variant/10 last:border-0">
								<span class="text-xs text-on-surface-variant w-16 shrink-0 truncate">{category}</span>
								<span class="flex-1 text-sm font-medium {answer ? 'text-on-surface' : 'text-on-surface-variant/40 italic'}">
									{answer || t('basta.empty')}
								</span>
								{#if answer}
									<div class="flex gap-1">
										<button
											onclick={() => submitVote(player.id, category, true)}
											class="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all
												{voted && isValid ? 'bg-green-500 text-white' : 'bg-surface-container-highest text-on-surface-variant hover:bg-green-500/20'}"
										>
											✓
										</button>
										<button
											onclick={() => submitVote(player.id, category, false)}
											class="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all
												{voted && !isValid ? 'bg-error text-on-error' : 'bg-surface-container-highest text-on-surface-variant hover:bg-error/20'}"
										>
											✗
										</button>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/each}
			</div>
		</div>

	<!-- Scores: round results -->
	{:else if phase === 'scores' && gameState}
		<div class="flex flex-col gap-3 max-w-md mx-auto w-full flex-1 overflow-hidden">
			<div class="text-center py-1">
				<span class="iconify material-symbols--scoreboard text-3xl text-amber-500"></span>
				<h2 class="text-lg font-bold font-headline">{t('basta.roundScores')}</h2>
				<p class="text-xs text-on-surface-variant">{t('basta.round', { current: gameState.currentRound, total: gameState.config.totalRounds })}</p>
			</div>

			<div class="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0">
				{#each [...(gameState.roundScores ?? [])].sort((a, b) => b.points - a.points) as score}
					{@const player = gameState.players.find((p: any) => p.id === score.playerId)}
					{@const avatarSrc = player ? avatarUrl(player.discordUserId, player.avatar) : null}
					<div class="bg-surface-container rounded-xl p-3">
						<div class="flex items-center justify-between mb-2">
							<div class="flex items-center gap-2">
								{#if avatarSrc}
									<img src={avatarSrc} alt="" class="w-5 h-5 rounded-full object-cover" />
								{:else}
									<span class="iconify material-symbols--person text-amber-500"></span>
								{/if}
								<span class="font-medium text-sm">{player?.name ?? '?'}</span>
							</div>
							<span class="text-amber-500 font-bold text-lg font-headline">{score.points} {t('basta.points')}</span>
						</div>
						<div class="flex flex-wrap gap-1">
							{#each gameState.categories as category}
								{@const pts = score.breakdown?.[category] ?? 0}
								<span class="px-2 py-0.5 rounded-full text-[10px] font-medium
									{pts === 100 ? 'bg-green-500/20 text-green-500' : pts === 50 ? 'bg-amber-500/20 text-amber-500' : 'bg-surface-container-highest text-on-surface-variant/50'}">
									{category}: {pts}
								</span>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			<!-- Total scores -->
			<div class="bg-surface-container rounded-xl p-3 shrink-0">
				<p class="text-xs text-on-surface-variant font-medium mb-1.5 uppercase tracking-wider">{t('basta.totalScores')}</p>
				<div class="flex flex-wrap gap-2">
					{#each [...gameState.players].sort((a, b) => (gameState.totalScores[b.id] ?? 0) - (gameState.totalScores[a.id] ?? 0)) as player}
						<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high/50 text-sm">
							<span class="text-on-surface font-medium">{player.name}</span>
							<span class="text-amber-500 font-bold">{gameState.totalScores[player.id] ?? 0}</span>
						</span>
					{/each}
				</div>
			</div>

			{#if isHost}
				<button onclick={nextRound}
					class="w-full py-2.5 rounded-xl bg-amber-500 text-black font-bold font-headline hover:brightness-110 active:scale-[0.98] transition-all shrink-0">
					{gameState.currentRound >= gameState.config.totalRounds ? t('basta.finalResults') : t('basta.nextRound')}
				</button>
			{:else}
				<p class="text-on-surface-variant text-xs text-center">{t('discord.waitingHost')}</p>
			{/if}
		</div>

	<!-- Final Results -->
	{:else if phase === 'results' && gameState}
		<div class="flex-1 flex flex-col items-center justify-center gap-4 max-w-md mx-auto w-full">
			<div class="text-center">
				<span class="iconify material-symbols--trophy text-5xl text-amber-500"></span>
				<h2 class="text-2xl font-bold font-headline mt-2">
					{winners.length > 1 ? t('basta.winners') : t('basta.winner')}
				</h2>
				<p class="text-amber-500 font-bold text-xl font-headline mt-1">
					{winners.join(', ')}
				</p>
				{#if winners.length > 1}
					<p class="text-on-surface-variant text-xs mt-0.5">{t('basta.tie')}</p>
				{/if}
			</div>

			<!-- Final scoreboard -->
			<div class="w-full bg-surface-container rounded-xl p-3">
				<p class="text-xs text-on-surface-variant font-medium mb-2 uppercase tracking-wider">{t('basta.totalScores')}</p>
				<div class="flex flex-col gap-1.5">
					{#each [...gameState.players].sort((a, b) => (gameState.totalScores[b.id] ?? 0) - (gameState.totalScores[a.id] ?? 0)) as player, i}
						{@const avatarSrc = avatarUrl(player.discordUserId, player.avatar)}
						{@const score = gameState.totalScores[player.id] ?? 0}
						<div class="flex items-center gap-2 px-2 py-1.5 rounded-lg {i === 0 ? 'bg-amber-500/10' : ''}">
							<span class="text-on-surface-variant font-bold text-sm w-5 text-center">{i + 1}</span>
							{#if avatarSrc}
								<img src={avatarSrc} alt="" class="w-6 h-6 rounded-full object-cover" />
							{:else}
								<span class="iconify material-symbols--person text-amber-500"></span>
							{/if}
							<span class="flex-1 text-sm font-medium text-on-surface">{player.name}</span>
							<span class="text-amber-500 font-bold font-headline">{score} {t('basta.points')}</span>
						</div>
					{/each}
				</div>
			</div>

			{#if isHost}
				<button onclick={playAgain}
					class="w-full py-2.5 rounded-xl bg-amber-500 text-black font-bold font-headline hover:brightness-110 active:scale-[0.98] transition-all">
					{t('discord.playAgain')}
				</button>
			{:else}
				<p class="text-on-surface-variant text-xs">{t('discord.waitingHost')}</p>
			{/if}
		</div>
	{/if}
	</div>
</div>

<ShopModal bind:open={shopOpen} />
