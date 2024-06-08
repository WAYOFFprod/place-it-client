<script lang="ts">
	import { onMount } from 'svelte';
	import P5 from 'p5';
	import GridManager from '$lib/p5/GridManager';
	import { selectedColor } from '$lib/stores/colorStore';
	import { ToolType, backToTool, selectedTool, setTempTool, setTool } from '$lib/stores/toolStore';

	import Palette from './color/palette.svelte';
	import Button from './button.svelte';
	import Networker from '$lib/utility/Networker';
	import { PUBLIC_WEBSOCKET_URL, PUBLIC_SERVER_URL } from '$env/static/public';
	import Toolbar from '$lib/components/toolbar/toolbar.svelte';
	import Tool from './toolbar/ToolClass';
	import ControlManager from './toolbar/ControlManager';

	let width = 32;
	let height = 16;

	let container: HTMLElement;
	let updateColorPalette: (newColors: [string]) => void;

	let p5: P5;
	let controlManager: ControlManager
	let gridManager: GridManager;
	const networker = new Networker(PUBLIC_SERVER_URL, PUBLIC_WEBSOCKET_URL);

	const zoomSensitivity = 0.1;



	let currentToolType: typeof Tool = Tool


	selectedTool.subscribe((newTool: Tool | undefined) => {
		if(newTool == undefined) return;
		const type = newTool.getType()
		if(type == null) return;
		currentToolType = type;
	});

	
	let isReady = false;

	const reloadCanva = () => {
		isReady = false;
		initCanvas();
	};

	const isTargeting = (target: EventTarget | null, id: string) => {
		if (target == null) return false;
		const targetId = (target as HTMLElement).id;
		if (targetId != id) return false;
		return true;
	};

	const initCanvas = async () => {
		// load data
		const data = await networker.getCanva();

		// set width and height
		width = data.width;
		height = data.height;
		const size: Size2D = { width: width, height: height };

		gridManager = new GridManager(p5, size);
		
		networker.connectToSocket(gridManager, reloadCanva);

		const pixels = networker.tempPoints as {[key: string]: string};
		gridManager.loadImage(data.image, size, pixels);
		// color = data.colors[0];
		updateColorPalette(data.colors);
		

		controlManager = new ControlManager(p5, size, networker)

		isReady = true;
	};

	const resetCanva = async () => {
		await networker.clearCanva();
		reloadCanva();
	};

	onMount(() => {
		const script = (canvas: P5) => {
			p5 = canvas;
			p5.setup = () => {
				const cnv = p5.createCanvas(width, height);
				cnv.id('place-it-canvas');
				p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
				p5.noSmooth();

			};

			p5.draw = () => {
				if (!isReady) return;
				p5.background(150);

				p5.push();

				controlManager.updateOffset();

				p5.translate(ControlManager.screenOffset.x, ControlManager.screenOffset.y);
				p5.scale(ControlManager.currentScale);

				// draw content
				gridManager.updateCanvasPosition();
				p5.pop();
			};

			p5.mousePressed = (e: MouseEvent) => {
				if (!isTargeting(e.target, 'place-it-canvas')) return;
				controlManager.mousePressed()
			};

			/* Clicking on canvas */
			p5.mouseReleased = (e: MouseEvent) => {
				if (!isTargeting(e.target, 'place-it-canvas')) return;
				controlManager.mouseReleased()
			};

			/* Scrolling */
			window.addEventListener('wheel', function (e) {
				if (e.deltaY > 0) {
					controlManager.scroll(1 + zoomSensitivity)
				} else {
					controlManager.scroll(1 - zoomSensitivity)
				}
			});

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
				switch (p5.keyCode) {
					case p5.UP_ARROW:
						controlManager.scroll(1 + zoomSensitivity)
						break;
					case p5.DOWN_ARROW:
						controlManager.scroll(1 - zoomSensitivity)
						break;
					case p5.OPTION:
						backToTool()
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
				p5.remove();
				networker.disconnect();
			};
		}
	});

</script>

<div id="canvas-container" class="relative cursor-{currentToolType.cursor}">
	<!-- overlay -->
	<div class="absolute top-0 bottom-[50px] left-0 right-0 pointer-events-none">
		<!-- bootom panel -->
		<div class="absolute bottom-0 left-0 right-0 flex justify-center">
			<Palette bind:setColors={updateColorPalette} childClass={'pointer-events-auto'}
			></Palette>
		</div>

		<!-- other -->
		<Toolbar childClass={'absolute pointer-events-auto'} p5="{p5}"></Toolbar>
		<Button on:resetCanva={resetCanva} childClass={'absolute top-0 right-0'}></Button>
	</div>

	<!-- canvas -->
	<div bind:this={container} class="w-full"></div>
</div>


