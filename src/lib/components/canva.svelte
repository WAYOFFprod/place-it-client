<script lang="ts">
	import { onMount } from 'svelte';
	import P5 from 'p5';
	import GridManager from '$lib/p5/GridManager';

	const width = 512;
	const height = 512;

	let container: HTMLElement;

	let gridManager: GridManager;

	const zoomSensitivity = 0.1;
	let scaleFactor = 1;
	let currentScale = 0;

	let isDragging = false;

	let screenOffset: Coord = {
		x: 0,
		y: 0
	};

	let zoomOffset: Coord = {
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

	let p5: P5;

	const initCanvas = () => {
		// initialize scale factor
		const widthDiff = p5.windowWidth / width;
		const heightDiff = p5.windowHeight / height;
		// get scale factor by getting the one from the axies with the least pixels
		currentScale = widthDiff < heightDiff ? widthDiff : heightDiff;

		// set initial offset to center image
		const x = (width / 2) * currentScale;
		const y = (height / 2) * currentScale;
		screenOffset.x = screenCenter.x - x;
		screenOffset.y = screenCenter.y - y;
	};

	const drawDebug = () => {
		// crosshair
		p5.stroke(2);
		const x = screenCenter.x / currentScale;
		p5.line(x, 0, x, p5.windowHeight);
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
		const relMouse = {
			x: p5.mouseX * scaleFactor,
			y: p5.mouseY * scaleFactor
		};
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
				p5.createCanvas(width, height);
				p5.noSmooth();
				p5.resizeCanvas(p5.windowWidth, p5.windowHeight);

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
				// p5.translate(-screenOffset.x, 0);

				// drawDebug();

				// draw content
				gridManager.updateCanvasPosition();
				p5.pop();
			};

			p5.mousePressed = (e: MouseEvent) => {
				isDragging = true;

				// grab.canvas.start.x = canvas.mouseX - screenOffset.x * scaleFactor;
				// grab.canvas.start.y = canvas.mouseY - screenOffset.y * scaleFactor;
				grabStart.x = p5.mouseX;
				grabStart.y = p5.mouseY;
				dragOffset.x = p5.mouseX - screenOffset.x;
				dragOffset.y = p5.mouseY - screenOffset.y;
			};

			/* Clicking on canvas */
			p5.mouseReleased = (e: MouseEvent) => {
				if (hasMovedSinceDragStart()) return;

				isDragging = false;

				// const x = Math.floor(p5.mouseX / scaleFactor - screenOffset.x);
				// const y = Math.floor(p5.mouseY / scaleFactor - screenOffset.y);
				const x = Math.floor((p5.mouseX - screenOffset.x) / currentScale);
				const y = Math.floor((p5.mouseY - screenOffset.y) / currentScale);

				gridManager.drawPixelOnCanvas(
					{
						x: x,
						y: y
					},
					'#00ff00'
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

<div bind:this={container} class="h-full w-full"></div>
