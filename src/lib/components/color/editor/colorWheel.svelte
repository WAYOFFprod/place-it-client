<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import Swatch from '../swatch.svelte';
	import { selectedColor } from '$lib/stores/colorStore';
	import { hexToRgb, hsv2rgb, rectToRGB, rgbToHex, rgbToHsv } from '../utils/converter';

	const dispatch = createEventDispatcher<updateColorEvent>();

	let canva: HTMLCanvasElement | undefined;
	let context: CanvasRenderingContext2D | null;
	let rangeInput: HTMLInputElement | undefined;

	const size = 240;

	let pickerPosition: Coord = {
		x: 120,
		y: 120
	};

	let pickedColorHex: string = '#E11C1A';
	let pickedColorRgb = [];
	let luminosity: number = 1;

	onMount(() => {
		selectedColor.subscribe((newColor) => {
			pickedColorHex = newColor;
			savePositionFromHex();
			drawPicker();
		});

		if (canva) {
			context = canva.getContext('2d');
			drawPicker();
		} else {
			console.warn('Missing canva or range input for color wheel');
		}
	});

	const drawPicker = () => {
		if (!context) return;
		// grab the current ImageData (or use createImageData)
		let bitmap = context.getImageData(0, 0, size, size);

		for (let y = 0; y < size; y++) {
			for (let x = 0; x < size; x++) {
				const reverseX = size - x - 1;
				// offset for the 4 RGBA values in the data array
				const offset = 4 * (y * size + reverseX);

				const hue = 180 + Math.atan2(y - size / 2, x - size / 2) * (180 / Math.PI);
				let saturation =
					Math.sqrt(Math.pow(y - size / 2, 2) + Math.pow(x - size / 2, 2)) / (size / 2);

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

	const changeLuminosity = () => {
		if (!rangeInput) return;
		luminosity = parseFloat(rangeInput.value + '') ?? 1;
		saveColor();
		drawPicker();
		updateColor();
	};

	const saveColor = () => {
		const x = (pickerPosition.x - size / 2) / (size / 2);
		const y = (pickerPosition.y - size / 2) / (size / 2);

		// get equivalent color value
		pickedColorRgb = rectToRGB(x, -y, luminosity);
		pickedColorHex = rgbToHex(pickedColorRgb[0], pickedColorRgb[1], pickedColorRgb[2]);
		return true;
	};

	const savePositionFromHex = () => {
		pickedColorRgb = hexToRgb(pickedColorHex);
		let hsv = rgbToHsv(pickedColorRgb[0], pickedColorRgb[1], pickedColorRgb[2]);
		if (!hsv) return;
		// Hue value represents the angle in the color wheel
		let angle = hsv.h * 2 * Math.PI; // Convert to radians

		const r = size / 2;
		// luminance value represents the distance from the center
		let distance = hsv.s * r;

		pickerPosition.x = r + distance * Math.cos(angle);
		pickerPosition.y = size - (r + distance * Math.sin(angle));
		luminosity = hsv.v;
		if (rangeInput) {
			rangeInput.value = luminosity.toString();
		}
		// since position moved, update color
		pickedColorRgb = rectToRGB(pickerPosition.x, pickerPosition.y, luminosity);
	};

	let isMouseDown = false;
	const onMouseDown = (event: MouseEvent) => {
		isMouseDown = true;
		// save position
		pickerPosition.x = event.offsetX;
		pickerPosition.y = event.offsetY;

		if (saveColor()) {
			drawPicker();
			updateColor();
		}
	};

	const onMouseMove = (event: MouseEvent) => {
		if (!isMouseDown) return;
		// save position
		pickerPosition.x = event.offsetX;
		pickerPosition.y = event.offsetY;
		const r = size / 2;

		const absX = Math.abs(pickerPosition.x - r);
		const absY = Math.abs(pickerPosition.y - r);
		const distance: number = Math.sqrt(Math.abs(absX * absX + absY * absY));
		// if farther than limit max out position
		if (distance > r) {
			const diff = distance - r;
			const ratio = diff / r;
			pickerPosition.x = (pickerPosition.x - r) * (1 - ratio) + r;
			pickerPosition.y = (pickerPosition.y - r) * (1 - ratio) + r;
		}

		if (saveColor()) {
			drawPicker();
			updateColor();
		}
	};

	const updateColor = () => {
		dispatch('updateColor', {
			color: pickedColorHex
		});
	};

	const onMouseLeave = (event: MouseEvent) => {
		// isMouseDown = false;
	};
	const onMouseUp = (event: MouseEvent) => {
		isMouseDown = false;
	};
</script>

<div class="color-wheel flex justify-center gap-2">
	<canvas
		bind:this={canva}
		id="picker"
		width={size}
		height={size}
		class="rounded-full border-2 border-black"
		on:mousedown={onMouseDown}
		on:mousemove={onMouseMove}
		on:mouseleave={onMouseLeave}
		on:mouseup={onMouseUp}
	></canvas>
	<div class="relative self-stretch flex justify-center items-center w-8">
		<!-- <Background class="absolute rotate-90 h-36 w-4"></Background> -->
		<div class="rotate-90 w-56">
			<input
				class="w-56"
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
