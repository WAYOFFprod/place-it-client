<script lang="ts">
	import { onMount } from 'svelte';
	import P5 from 'p5';
	import GridManager from '$lib/p5/GridManager';

	const width = 512;
	const height = 512;

	let container: HTMLElement;

	let gridManager: GridManager;

	let scaleFactor = 1;
	const tileSize = 1;

	let screenOff: Coord = { x: 0, y: 0 };
	let center: Coord = {
		x: 0,
		y: 0
	};

	onMount(() => {
		const script = (canvas: P5) => {
			canvas.setup = () => {
				console.log(width);
				canvas.createCanvas(width, height);
				canvas.noSmooth();
				canvas.resizeCanvas(canvas.windowWidth, canvas.windowHeight);
			};

			canvas.draw = () => {
				canvas.background(220);
				canvas.scale(scaleFactor);
				// canvas.fill('#ffffff');
				canvas.rect(0, 0, width, height);

				gridManager.updateCanvasPosition();
			};

			/* Clicking on canvas */
			canvas.mouseReleased = (e: MouseEvent) => {
				const screenOffset = {
					x: 0,
					y: 0
				} as Coord;

				const percentX = canvas.mouseX - screenOffset.x;
				const percentY = canvas.mouseY - screenOffset.y;

				const x = Math.floor(percentX / scaleFactor);
				const y = Math.floor(percentY / scaleFactor);

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
					scaleFactor *= 1.05;
				} else {
					scaleFactor *= 0.95;
				}
			});
		};

		/* Instantiate canva */
		if (container) {
			const p5 = new P5(script, container);
			gridManager = new GridManager(p5, { width: width, height: height });

			const initCanvas = () => {
				const widthDiff = p5.windowWidth / width;
				const heightDiff = p5.windowHeight / height;
				const diff = widthDiff < heightDiff ? widthDiff : heightDiff;
				scaleFactor = diff;
				screenOff.x = center.x - width / 2;
				screenOff.y = center.y - height / 2;
			};

			initCanvas();

			/* destroy if unmounted */
			return () => {
				p5.remove();
			};
		}
	});
</script>

<div bind:this={container} class="h-full w-full"></div>
