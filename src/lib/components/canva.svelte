<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { ToolType, selectedTool } from '$lib/stores/toolStore';

	import Palette from './color/palette.svelte';
	import Modal from '$lib/components/modal.svelte';
	import Toolbar from '$lib/components/toolbar/toolbar.svelte';
	import Tool from './toolbar/ToolClass';
	import { event } from '$lib/stores/eventStore';
	import Chat from './chat/chat.svelte';
	import ZoomCounter from './metric/zoomCounter.svelte';
	import CoordViewer from './metric/coordViewer.svelte';
	import P5Manager from '$lib/p5/P5Manager';
	import type { CanvaPreviewData } from './types';

	interface Props {
		canva: CanvaPreviewData;
		viewOnly: boolean;
		marginBottom: number;
	}

	let { canva, viewOnly = true, marginBottom = 0 }: Props = $props();

	let cursor = $state('');
	let id = 'canvas-container';
	let rootContainer: HTMLDivElement;
	let container: HTMLElement;
	let p5Manager: P5Manager | undefined = $state(undefined);
	let triggerUpdateColorPalette = $state<(newColors: [string]) => void>(() => {});
	let paletteColors: string[] = $state([]);

	let currentToolType: typeof Tool = $state(Tool);
	let currentTool: Tool | undefined;
	let cursorUnsub: () => void;

	const unsubscribeTool = selectedTool.subscribe((newTool: Tool | undefined) => {
		if (cursorUnsub) cursorUnsub();
		if (newTool == undefined) return;
		const type = newTool.getType();
		if (type == null) return;
		currentToolType = type;
		currentTool = newTool;
		cursorUnsub = currentTool.cursorW.subscribe((newCursor: string) => {
			cursor = newCursor;
		});
	});

	const unsubscribeEvent = event.subscribe((newEvent) => {
		if (newEvent == 'clearCanva') {
			// You might need to implement a reload/reset mechanism in P5Manager
		}
	});

	onMount(() => {
		const preventTouchZoom = (event: TouchEvent) => {
			if (!rootContainer.contains(event.target as Node)) {
				return;
			}

			if (event.touches.length >= 2) {
				event.preventDefault();
			}
		};

		const preventGestureZoom = (event: Event) => {
			if (!rootContainer.contains(event.target as Node)) {
				return;
			}

			event.preventDefault();
		};

		document.addEventListener('touchmove', preventTouchZoom, { passive: false });
		document.addEventListener('gesturestart', preventGestureZoom as EventListener, {
			passive: false
		});
		document.addEventListener('gesturechange', preventGestureZoom as EventListener, {
			passive: false
		});

		if (container) {
			p5Manager = new P5Manager(
				container,
				canva,
				viewOnly,
				marginBottom,
				(colors) => (paletteColors = colors),
				triggerUpdateColorPalette
			);

			return () => {
				document.removeEventListener('touchmove', preventTouchZoom);
				document.removeEventListener('gesturestart', preventGestureZoom as EventListener);
				document.removeEventListener('gesturechange', preventGestureZoom as EventListener);
				p5Manager?.destroy();
			};
		}
	});

	onDestroy(() => {
		unsubscribeTool();
		unsubscribeEvent();
	});

	// $: cursor = () => {
	// 	if (currentTool == undefined) return '';
	// 	return 'cursor-' + currentTool.getCursor();
	// };
</script>

<Modal></Modal>
<div bind:this={rootContainer} {id} class="relative cursor-{cursor} touch-none" role="none" oncontextmenu={e => e.preventDefault()}>
	<!-- overlay -->
	<div class="absolute inset-0 pointer-events-none">
		{#if currentToolType.type == ToolType.Place}
			<div class="h-full w-full pointer-events-none flex justify-center items-center">
				<img class="w-6 h-6" src="/svg/plus.svg" alt="" />
			</div>
		{/if}
		<!-- bootom panel -->
		<div class="absolute bottom-5 md:bottom-10 right-5 flex justify-center">
			<Palette
				canvasOwned={canva.owned}
				canvaId={canva.id}
				bind:colors={paletteColors}
				bind:setColors={triggerUpdateColorPalette}
				childClass={'pointer-events-auto'}
			></Palette>
		</div>

		<div class="absolute bottom-10 left-5 justify-center hidden md:flex">
			<Chat class="w-[500px]"></Chat>
		</div>

		<div class="absolute top-3 md:top-5 right-3 md:right-5 flex flex-col items-end gap-4">
			<ZoomCounter></ZoomCounter>
			<CoordViewer></CoordViewer>
		</div>

		<!-- other -->
		<Toolbar
			class="absolute left-3 md:left-5 top-3 md:top-5 pointer-events-auto"
			p5={p5Manager?.getP5()}
			{viewOnly}
		></Toolbar>
	</div>

	<!-- canvas -->
	<div bind:this={container} class="touch-none"></div>
</div>

<style lang="postcss">
	#canvas-container,
	#canvas-container canvas {
		touch-action: none;
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		user-select: none;
	}
</style>
