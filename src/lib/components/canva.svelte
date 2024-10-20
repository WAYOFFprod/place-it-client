<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import P5 from 'p5';
	import GridManager from '$lib/p5/GridManager';
	import { ToolType, backToTool, selectedTool, setTempTool } from '$lib/stores/toolStore';

	import Palette from './color/palette.svelte';
	import Networker from '$lib/utility/Networker';
	import Modal from '$lib/components/modal.svelte';
	import Toolbar from '$lib/components/toolbar/toolbar.svelte';
	import Tool from './toolbar/ToolClass';
	import ControlManager from './toolbar/ControlManager';
	import { event } from '$lib/stores/eventStore';
	import { isReady } from '$lib/stores/canvaStore';
	import Chat from './chat/chat.svelte';
	import ZoomCounter from './metric/zoomCounter.svelte';
	import CoordViewer from './metric/coordViewer.svelte';

	export let canva: CanvaPreviewData;
	export let viewOnly: boolean = true;
	export let marginBottom: number = 0;

	let id = 'canvas-container';
	let width = 32;
	let height = 16;

	let container: HTMLElement;
	let updateColorPalette: (newColors: [string]) => void;

	let p5: P5;
	let controlManager: ControlManager | undefined;
	let gridManager: GridManager;

	const networker = Networker.getInstance();

	const zoomSensitivity = 0.1;

	let currentToolType: typeof Tool = Tool;

	const unsubscribeTool = selectedTool.subscribe((newTool: Tool | undefined) => {
		if (newTool == undefined) return;
		const type = newTool.getType();
		if (type == null) return;
		currentToolType = type;
	});

	const unsubscribeEvent = event.subscribe((newEvent) => {
		if (newEvent == 'clearCanva') reloadCanva();
	});

	let ready = false;
	const unsubscribeReady = isReady.subscribe((newState) => {
		ready = newState;
	});

	const reloadCanva = async () => {
		isReady.set(false);
	};

	const isTargeting = (target: EventTarget | null, id: string) => {
		if (target == null) return false;
		const targetId = (target as HTMLElement).id;
		if (targetId != id) return false;
		return true;
	};

	const connect = async (canvasData: CanvaData) => {
		networker.connectToSocket(gridManager);

		const pixels = networker.tempPoints as { [key: string]: string };
		gridManager.loadImage(canvasData.data.image, canvasData.size, pixels);
		// color = data.colors[0];
		updateColorPalette(canvasData.data.colors);
		networker.joinLiveCanva(canvasData.id);
	};

	const initCanvas = async () => {
		if (canva) {
			width = canva.width;
			height = canva.height;
			const size: Size2D = { width: width, height: height };
			const data = {
				id: canva.id,
				data: canva,
				size: size
			};
			gridManager = new GridManager(p5, data.size, canva.id, marginBottom);
			controlManager = ControlManager.getInstance(p5, viewOnly, gridManager);
			connect(data);
		}
	};

	onMount(() => {
		const script = (canvas: P5) => {
			p5 = canvas;
			p5.setup = () => {
				const cnv = p5.createCanvas(width, height);
				cnv.id('place-it-canvas');

				p5.resizeCanvas(p5.windowWidth, p5.windowHeight - marginBottom);
				p5.noSmooth();
			};

			p5.draw = () => {
				if (!ready || !controlManager) return;
				controlManager.checkMousePosition();

				// TODO: check if it was updated by drawing pixel or other player pixel as well
				if (gridManager.needsUpdate || controlManager.hasNewScreenOffset()) {
					p5.push();
					p5.background(150);
					p5.translate(gridManager.screenOffset.x, gridManager.screenOffset.y);
					p5.scale(gridManager.currentScale);

					// draw content
					gridManager.updateCanvasPosition();
					p5.pop();
					gridManager.needsUpdate = false;

					controlManager.saveScreenOffset();
				}
			};

			p5.mousePressed = (e: MouseEvent) => {
				if (!isTargeting(e.target, 'place-it-canvas') || !controlManager) return;
				controlManager.mousePressed();
			};

			p5.touchStarted = (e: TouchEvent) => {
				if (!isTargeting(e.target, 'place-it-canvas') || !controlManager) return;
				console.log('touch started', e.touches);
				controlManager.mousePressed();
			};

			p5.touchEnded = (e: TouchEvent) => {
				if (!isTargeting(e.target, 'place-it-canvas') || !controlManager) return;
				controlManager.mouseReleased();
			};

			/* Clicking on canvas */
			p5.mouseReleased = () => {
				if (!controlManager) return;
				controlManager.mouseReleased();
			};

			/* Scrolling */
			window.addEventListener(
				'wheel',
				function (e: WheelEvent) {
					e.preventDefault();
					if (!isTargeting(e.target, 'place-it-canvas') || !controlManager) return;
					if (e.deltaY > 0) {
						controlManager.scroll(1 - zoomSensitivity);
					} else {
						controlManager.scroll(1 + zoomSensitivity);
					}
				},
				{ passive: false }
			);

			p5.keyPressed = () => {
				switch (p5.keyCode) {
					case p5.OPTION:
						setTempTool(ToolType.Hand, p5);
						break;
					default:
						break;
				}
			};
			p5.keyReleased = () => {
				if (!controlManager) return;
				switch (p5.keyCode) {
					case p5.UP_ARROW:
						controlManager.scroll(1 + zoomSensitivity);
						break;
					case p5.DOWN_ARROW:
						controlManager.scroll(1 - zoomSensitivity);
						break;
					case p5.OPTION:
						backToTool();
						break;
					default:
						break;
				}
			};
		};

		/* Instantiate canva */
		if (container) {
			const p5 = new P5(script, container);
			initCanvas();

			/* destroy if unmounted */
			return () => {
				networker.disconnect();
				p5.remove();
			};
		}
	});
	onDestroy(() => {
		if (controlManager) {
			controlManager.destroy();
		}
		unsubscribeTool();
		unsubscribeEvent();
		unsubscribeReady();
	});
</script>

<Modal></Modal>
<div {id} class="relative cursor-{currentToolType.cursor} {$$props.class}">
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
				bind:setColors={updateColorPalette}
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
		<Toolbar class="absolute left-3 md:left-5 top-3 md:top-5 pointer-events-auto" {p5} {viewOnly}
		></Toolbar>
	</div>

	<!-- canvas -->
	<div bind:this={container}></div>
</div>
