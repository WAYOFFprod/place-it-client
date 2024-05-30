<script lang="ts">
	import { onMount } from 'svelte';
	import P5, { Renderer } from 'p5';
	import GridManager from '$lib/p5/GridManager';
	import Palette from './color/palette.svelte';
	import { selectedColor } from '$lib/stores/colorStore';
	import { io } from 'socket.io-client';

	const socket = io('http://localhost:3000');

	const width = 64;
	const height = 64;

	let container: HTMLElement;

	let gridManager: GridManager;

	const zoomSensitivity = 0.1;
	let scaleFactor = 1;
	let currentScale = 0;

	let color: string;

	let isDragging = false;

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

	// original position adjusted to screenoffset at the start of dragging
	let dragOffset: Coord = {
		x: 0,
		y: 0
	};

	selectedColor.subscribe((newColor) => {
		color = newColor;
	});

	// listen to socket server message
	socket.on('new-pixel-from-others', (coord, color) => {
		gridManager.drawPixelOnCanvas(coord, color);
	});

	let p5: P5;

	const isTargeting = (target: EventTarget | null, id: string) => {
		if (target == null) return false;
		const targetId = (target as HTMLElement).id;
		if (targetId != id) return false;
		return true;
	};

	const initCanvas = () => {
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
	};

	const hasMovedSinceDragStart = () => {
		if (isDragging) {
			isDragging = false;
			const dragVector = p5.createVector(grabStart.x, grabStart.y);
			const ogVector = p5.createVector(p5.mouseX, p5.mouseY);
			if (dragVector.dist(ogVector) > 5) {
				return true;
			}
		}
		return false;
	};

	const adjustForMouseDraging = () => {
		screenOffset.x = p5.mouseX - dragOffset.x;
		screenOffset.y = p5.mouseY - dragOffset.y;
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
				p5.background(150);

				p5.push();

				if (isDragging) {
					adjustForMouseDraging();
				}

				p5.translate(screenOffset.x, screenOffset.y);
				p5.scale(currentScale);

				// draw content
				gridManager.updateCanvasPosition();
				p5.pop();
			};

			p5.mousePressed = (e: MouseEvent) => {
				if (!isTargeting(e.target, 'place-it-canvas')) return;

				isDragging = true;

				grabStart.x = p5.mouseX;
				grabStart.y = p5.mouseY;
				dragOffset.x = p5.mouseX - screenOffset.x;
				dragOffset.y = p5.mouseY - screenOffset.y;
			};

			/* Clicking on canvas */
			p5.mouseReleased = (e: MouseEvent) => {
				if (!isTargeting(e.target, 'place-it-canvas')) return;

				if (hasMovedSinceDragStart()) return;

				isDragging = false;

				const x = Math.floor((p5.mouseX - screenOffset.x) / currentScale);
				const y = Math.floor((p5.mouseY - screenOffset.y) / currentScale);

				gridManager.drawPixelOnCanvas(
					{
						x: x,
						y: y
					},
					color
				);
				socket.emit(
					'new-pixel',
					{
						x: x,
						y: y
					},
					color
				);
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

			p5.keyReleased = () => {
				if (p5.keyCode === p5.UP_ARROW) {
					scaleFactor = 1 + zoomSensitivity;
				} else {
					scaleFactor = 1 - zoomSensitivity;
				}
				adjustForZoomMovement();
			};
		};

		/* Instantiate canva */
		if (container) {
			const p5 = new P5(script, container);
			gridManager = new GridManager(p5, { width: width, height: height });

			initCanvas();

			/* destroy if unmounted */
			return () => {
				p5.remove();
			};
		}
	});
</script>

<!-- overlay -->
<div class="flex absolute inset-0 justify-center items-center space-between pointer-events-none">
	<Palette childClass={'shrink self-end pointer-events-auto'}></Palette>
</div>

<!-- canvas -->
<div bind:this={container} class="h-full w-full"></div>
