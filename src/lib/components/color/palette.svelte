<script lang="ts">
	import { storedColors, selectedColor } from '$lib/stores/colorStore';
	import Panel from '$lib/components/layout/panel.svelte';
	import Swatch from './swatch.svelte';
	import { onDestroy } from 'svelte';

	export let childClass: string;
	let currentColor: string;
	let colors: string[] = [];

	export const setColors = (newColors: [string]) => {
		storedColors.set(newColors);
		selectedColor.set(newColors[0]);
	};

	const unsubscribeSelectedColor = selectedColor.subscribe((newColor) => {
		currentColor = newColor;
	});

	const unsubscribeColor = storedColors.subscribe((newColors) => {
		colors = newColors;
	});

	const updateSelectColor = (event: CustomEvent<selectColor>) => {
		selectedColor.set(event.detail.color);
	};

	onDestroy(() => {
		unsubscribeSelectedColor();
		unsubscribeColor();
	});
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
