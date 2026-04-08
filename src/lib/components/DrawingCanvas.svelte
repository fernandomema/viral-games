<script lang="ts">
	import type { Stroke } from '$lib/games/impostor-draw';

	interface Props {
		strokes: Stroke[];
		enabled: boolean;
		color?: string;
		lineWidth?: number;
		onStrokeComplete?: (points: { x: number; y: number }[]) => void;
	}

	let { strokes, enabled, color = '#CA98FF', lineWidth = 4, onStrokeComplete }: Props = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	let isDrawing = $state(false);
	let currentPoints: { x: number; y: number }[] = $state([]);

	function getPos(e: MouseEvent | TouchEvent): { x: number; y: number } | null {
		if (!canvas) return null;
		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;

		if ('touches' in e) {
			if (e.touches.length === 0) return null;
			return {
				x: (e.touches[0].clientX - rect.left) * scaleX,
				y: (e.touches[0].clientY - rect.top) * scaleY,
			};
		}
		return {
			x: (e.clientX - rect.left) * scaleX,
			y: (e.clientY - rect.top) * scaleY,
		};
	}

	function startDraw(e: MouseEvent | TouchEvent) {
		if (!enabled) return;
		e.preventDefault();
		isDrawing = true;
		const pos = getPos(e);
		if (pos) currentPoints = [pos];
	}

	function moveDraw(e: MouseEvent | TouchEvent) {
		if (!isDrawing || !enabled) return;
		e.preventDefault();
		const pos = getPos(e);
		if (pos) {
			currentPoints = [...currentPoints, pos];
			drawLive();
		}
	}

	function endDraw(e: MouseEvent | TouchEvent) {
		if (!isDrawing) return;
		e.preventDefault();
		isDrawing = false;
		if (currentPoints.length > 1) {
			onStrokeComplete?.(currentPoints);
		}
		currentPoints = [];
	}

	function drawLive() {
		redraw();
		// Draw current in-progress stroke
		if (!canvas || currentPoints.length < 2) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.strokeStyle = color;
		ctx.lineWidth = lineWidth;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.beginPath();
		ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
		for (let i = 1; i < currentPoints.length; i++) {
			ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
		}
		ctx.stroke();
	}

	function redraw() {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (const stroke of strokes) {
			if (stroke.points.length < 2) continue;
			ctx.strokeStyle = stroke.color;
			ctx.lineWidth = stroke.width;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.beginPath();
			ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
			for (let i = 1; i < stroke.points.length; i++) {
				ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
			}
			ctx.stroke();
		}
	}

	$effect(() => {
		// Redraw whenever strokes change
		strokes;
		redraw();
	});
</script>

<div class="relative w-full aspect-square max-w-[500px] mx-auto">
	<canvas
		bind:this={canvas}
		width="500"
		height="500"
		class="w-full h-full rounded-2xl bg-surface-container-lowest border-2 {enabled ? 'border-primary/40' : 'border-outline-variant/20'} {enabled ? 'touch-none' : 'pointer-events-none'}"
		onmousedown={startDraw}
		onmousemove={moveDraw}
		onmouseup={endDraw}
		onmouseleave={endDraw}
		ontouchstart={startDraw}
		ontouchmove={moveDraw}
		ontouchend={endDraw}
		ontouchcancel={endDraw}
	></canvas>
</div>
