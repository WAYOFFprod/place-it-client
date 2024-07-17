<script lang="ts">
	import Panel from '$lib/components/layout/panel.svelte';
	import Background from '$lib/components/svg/range/background.svelte';
	import { onMount } from 'svelte';
	import Swatch from '../swatch.svelte';
	import type { MouseEventHandler } from 'svelte/elements';

	let canva: HTMLCanvasElement | undefined;
	let context: CanvasRenderingContext2D | null;
	let rangeInput: HTMLInputElement | undefined;

	const size = 200;

	let pickerPosition: Coord = {
		x: 100,
		y: 100
	};

	let pickedColorHex: string = '#E11C1A';
	let pickedColorRgb = [];
	let luminosity: number = 1;

	const drawPicker = () => {
		if (!context) return;
		// grab the current ImageData (or use createImageData)
		var bitmap = context.getImageData(0, 0, size, size);

		for (var y = 0; y < size; y++) {
			for (var x = 0; x < size; x++) {
				// offset for the 4 RGBA values in the data array
				var offset = 4 * (y * size + x);

				const hue = 180 + Math.atan2(y - size / 2, x - size / 2) * (180 / Math.PI);
				let saturation =
					Math.sqrt(Math.pow(y - size / 2, 2) + Math.pow(x - size / 2, 2)) / (size / 2);

				// console.log(value);

				saturation = Math.min(1, saturation);

				const hsv = hsv2rgb(hue, saturation, luminosity);
				// fill RGBA values
				bitmap.data[offset + 0] = hsv[0];
				bitmap.data[offset + 1] = hsv[1];
				bitmap.data[offset + 2] = hsv[2];
				bitmap.data[offset + 3] = 255; // no transparency
			}
		}

		// update the canvas
		context.putImageData(bitmap, 0, 0);
		drawSelector();
	};

	const drawSelector = () => {
		if (!context) return;
		context.lineWidth = 3;
		context.fillStyle = pickedColorHex;
		context.beginPath();
		context.arc(pickerPosition.x, pickerPosition.y, 10, 0, 2 * Math.PI);
		context.fill();
		context.stroke();
	};

	// =========

	const hsv2rgb = (h: number, s: number, v: number) => {
		const c = v * s;
		const h1 = h / 60;
		const x = c * (1 - Math.abs((h1 % 2) - 1));
		const m = v - c;
		let rgb = [3];

		if (typeof h == 'undefined') rgb = [0, 0, 0];
		else if (h1 < 1) rgb = [c, x, 0];
		else if (h1 < 2) rgb = [x, c, 0];
		else if (h1 < 3) rgb = [0, c, x];
		else if (h1 < 4) rgb = [0, x, c];
		else if (h1 < 5) rgb = [x, 0, c];
		else if (h1 <= 6) rgb = [c, 0, x];

		const r = 255 * (rgb[0] + m);
		const g = 255 * (rgb[1] + m);
		const b = 255 * (rgb[2] + m);

		return [r, g, b];
	};

	const changeLuminosity = () => {
		if (!rangeInput) return;
		luminosity = rangeInput.value ?? 1;
		drawPicker();
	};

	/* Convert radians to degrees.
	 *
	 * @param {number} rad - radians to convert, expects
	 *                       rad in range +/- PI per Math.atan2
	 * @returns {number} degrees equivalent of rad
	 */
	const rad2deg = (rad: number) => {
		return (360 + (180 * rad) / Math.PI) % 360;
	};

	const rectToRGB = (x: number, y: number) => {
		// Hue is from angle, saturation from distance from centre, value set to 1
		var r = Math.sqrt(x * x + y * y);
		// Limit extent to disc
		var sat = r > 1 ? 0 : r;
		let hue = rad2deg(Math.atan2(y, x));
		var rgb = hsv2rgb(hue, sat, luminosity).map(Math.round);
		return rgb;
	};

	/* RGB TO HEX */
	const componentToHex = (c: number) => {
		var hex = c.toString(16);
		return hex.length == 1 ? '0' + hex : hex;
	};

	const rgbToHex = (r: number, g: number, b: number) => {
		return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
	};

	let isMouseDown = false;
	const onMouseDown = (event: MouseEvent) => {
		isMouseDown = true;
		// save position
		pickerPosition.x = event.offsetX;
		pickerPosition.y = event.offsetY;
		const x = (event.offsetX - size / 2) / (size / 2);
		const y = (event.offsetY - size / 2) / (size / 2);
		// get equivalent color value
		pickedColorRgb = rectToRGB(-x, -y);
		pickedColorHex = rgbToHex(pickedColorRgb[0], pickedColorRgb[1], pickedColorRgb[2]);
		drawPicker();
	};

	const onMouseMove = (event: MouseEvent) => {
		if (!isMouseDown) return;
		// save position
		pickerPosition.x = event.offsetX;
		pickerPosition.y = event.offsetY;
		const x = (event.offsetX - size / 2) / (size / 2);
		const y = (event.offsetY - size / 2) / (size / 2);
		// get equivalent color value
		pickedColorRgb = rectToRGB(-x, -y);
		pickedColorHex = rgbToHex(pickedColorRgb[0], pickedColorRgb[1], pickedColorRgb[2]);
		drawPicker();
	};

	const onMouseLeave = (event: MouseEvent) => {
		isMouseDown = false;
	};
	const onMouseUp = (event: MouseEvent) => {
		isMouseDown = false;
	};

	onMount(() => {
		if (canva) {
			context = canva.getContext('2d');
			drawPicker();
		} else {
			console.warn('Missing canva or range input for color wheel');
		}
	});
</script>

<Panel class="w-full color-wheel" container="bg-white px-6 py-4">
	<div class="flex justify-around">
		<canvas
			bind:this={canva}
			id="picker"
			width="200"
			height="200"
			class="rounded-full border-2 border-black"
			on:mousedown={onMouseDown}
			on:mousemove={onMouseMove}
			on:mouseleave={onMouseLeave}
			on:mouseup={onMouseUp}
		></canvas>
		<div class="relative self-stretch flex justify-center items-center w-12">
			<!-- <Background class="absolute rotate-90 h-36 w-4"></Background> -->
			<div class="rotate-90 w-48">
				<input
					class="w-48"
					bind:this={rangeInput}
					on:input={changeLuminosity}
					id="range"
					type="range"
					min="0"
					max="1"
					value="1"
					step="0.01"
				/>
			</div>
		</div>
	</div>
	<div class="flex justify-between">
		<span class="text-xl">Couleurs</span>
		<div class="flex items-center gap-2">
			<Swatch color={pickedColorHex}></Swatch>
			<span>{pickedColorHex}</span>
		</div>
	</div>
</Panel>
