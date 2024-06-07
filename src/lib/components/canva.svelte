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

	let width = 32;
	let height = 16;

	let container: HTMLElement;
	let updateColorPalette: (newColors: [string]) => void;

	let gridManager: GridManager;
	const networker = new Networker(PUBLIC_SERVER_URL, PUBLIC_WEBSOCKET_URL);

	const zoomSensitivity = 0.1;
	let scaleFactor = 1;
	let currentScale = 0;

	let color: string | null;

	let isMouseDown = false;
	let isMouseDragging = false;

	let screenOffset: Coord = {
		x: 0,
		y: 0
	};

	let screenCenter: Coord = {
		x: 0,
		y: 0
	};
	// original position on start of dragging
	let grabStart: Coord = {
		x: 0,
		y: 0
	};

	let dragOffset: Coord = {
		x: 0,
		y: 0
	};

	let p5: P5;


	selectedColor.subscribe((newColor) => {
		color = newColor;
	});

	let currentTool: Tool | undefined
	let currentToolType: typeof Tool = Tool

	selectedTool.subscribe((newTool: Tool | undefined) => {
		if(newTool == undefined) return;
		currentTool = newTool;
		const type = currentTool.getType()
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

		// initialize scale factor
		const widthDiff = p5.windowWidth / width;
		const heightDiff = p5.windowHeight / height;
		// get scale factor by getting the one from the axies with the least pixels
		currentScale = widthDiff < heightDiff ? widthDiff : heightDiff;
		// currentScale = 1;

		// set initial offset to center image
		const x = (width / 2) * currentScale;
		const y = (height / 2) * currentScale;
		screenOffset.x = screenCenter.x - x;
		screenOffset.y = screenCenter.y - y;

		// initialise canvas and palette
		gridManager = new GridManager(p5, size);

		networker.connectToSocket(gridManager, reloadCanva);

		const pixels = networker.tempPoints as {[key: string]: string};
		gridManager.loadImage(data.image, size, pixels);
		color = data.colors[0];
		updateColorPalette(data.colors);
		initToolbar();
		isReady = true;
	};

	const initToolbar = () => {
		setTool(ToolType.Cursor, p5);
	}

	const resetCanva = async () => {
		await networker.clearCanva();
		reloadCanva();
	};

	const hasMovedSinceDragStart = () => {
		if (isMouseDown) {
			isMouseDown = false;
			const dragVector = p5.createVector(grabStart.x, grabStart.y);
			const ogVector = p5.createVector(p5.mouseX, p5.mouseY);
			if (dragVector.dist(ogVector) > 5) {
				return true;
			}
		}
		return false;
	};

	const adjustForZoomMovement = () => {
		currentScale = currentScale * scaleFactor;

		// get mouse position relative to canvas zoom
		const relMouse = {
			x: p5.mouseX * scaleFactor,
			y: p5.mouseY * scaleFactor
		};

		// get the current screen offset relative to the canvas
		const relOffset = {
			x: screenOffset.x * scaleFactor,
			y: screenOffset.y * scaleFactor
		};

		screenOffset.x = p5.mouseX - relMouse.x + relOffset.x;
		screenOffset.y = p5.mouseY - relMouse.y + relOffset.y;
	};
	onMount(() => {
		const script = (canvas: P5) => {
			p5 = canvas;
			p5.setup = () => {
				const cnv = p5.createCanvas(width, height);
				cnv.id('place-it-canvas');
				p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
				p5.noSmooth();

				screenCenter = {
					x: p5.windowWidth / 2,
					y: p5.windowHeight / 2
				};
			};

			p5.draw = () => {
				if (!isReady) return;
				p5.background(150);

				p5.push();

				if (isMouseDown) {
					if(currentTool) screenOffset = currentTool.mouseMove(isMouseDown);
				}

				p5.translate(screenOffset.x, screenOffset.y);
				p5.scale(currentScale);

				// draw content
				gridManager.updateCanvasPosition();
				p5.pop();
			};

			p5.mousePressed = (e: MouseEvent) => {
				if (!isTargeting(e.target, 'place-it-canvas')) return;

				isMouseDown = true;
				grabStart.x = p5.mouseX;
    		grabStart.y = p5.mouseY;

				if(currentTool) isMouseDown = isMouseDragging = currentTool.mousePressed(screenOffset);
				
			};

			/* Clicking on canvas */
			p5.mouseReleased = (e: MouseEvent) => {
				if (!isTargeting(e.target, 'place-it-canvas')) return;

				if (hasMovedSinceDragStart()) return;
				if(currentTool) currentTool.mouseReleased();

				isMouseDown = false;
				if(isMouseDragging) return;
				isMouseDragging = false;

				const coords: Coord = {
					x: Math.floor((p5.mouseX - screenOffset.x) / currentScale),
					y: Math.floor((p5.mouseY - screenOffset.y) / currentScale)
				};
				networker.placePixel(coords, color);
			};

			/* Scrolling */
			window.addEventListener('wheel', function (e) {
				if (e.deltaY > 0) {
					scaleFactor = 1 + zoomSensitivity;
				} else {
					scaleFactor = 1 - zoomSensitivity;
				}
				adjustForZoomMovement();
			});
			p5.keyPressed = () => {
				switch (p5.keyCode) {
					case p5.OPTION:
						setTempTool(ToolType.Hand, p5);
						break;
					default:
						break;
				}
				adjustForZoomMovement();
			};
			p5.keyReleased = () => {
				switch (p5.keyCode) {
					case p5.UP_ARROW:
						scaleFactor = 1 + zoomSensitivity;
						break;
					case p5.DOWN_ARROW:
						scaleFactor = 1 - zoomSensitivity;
						break;
					case p5.OPTION:
						backToTool()
						break;
					default:
						break;
				}
				adjustForZoomMovement();
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


