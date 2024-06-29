<script lang="ts">
	import { storedColors, selectedColor } from '$lib/stores/colorStore';
	import Panel from '$lib/components/layout/panel.svelte';
	import Swatch from './swatch.svelte';

	export let childClass: string;
	let currentColor: string;
	let colors: string[] = [];

	export const setColors = (newColors: [string]) => {
		storedColors.set(newColors);
		selectedColor.set(newColors[0]);
	};

	selectedColor.subscribe((newColor) => {
		currentColor = newColor;
	});

	storedColors.subscribe((newColors) => {
		colors = newColors;
	});

	const updateSelectColor = (event: CustomEvent<selectColor>) => {
		console.log('hello', event);
		selectedColor.set(event.detail.color);
	};
</script>

<div class="{childClass} cursor-pointer">
	<Panel class="w-fit">
		<div class="grid grid-cols-8 gap-2 p-2 m-2">
			{#each colors as color}
				<Swatch {color} on:selectColor={updateSelectColor} selected={color == currentColor}
				></Swatch>
			{/each}
		</div>
	</Panel>
</div>
