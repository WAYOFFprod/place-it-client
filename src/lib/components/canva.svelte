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

	interface Props {
		canva: CanvaPreviewData;
		viewOnly: boolean;
		marginBottom: number;
	}

	let { canva, viewOnly = true, marginBottom = 0 }: Props = $props();

	let cursor = $state('');
	let id = 'canvas-container';
	let container: HTMLElement;
	let paletteColors: string[] = $state([]);
	let p5Manager: P5Manager | undefined = $state(undefined);

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
		if (container) {
			p5Manager = new P5Manager(
				container,
				canva,
				viewOnly,
				marginBottom,
				(colors) => (paletteColors = colors)
			);

			return () => {
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
<div {id} class="relative cursor-{cursor}">
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
	<div bind:this={container}></div>
</div>
