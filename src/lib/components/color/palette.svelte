<script lang="ts">
	import { selectedColor } from '$lib/stores/colorStore';
	import Swatch from './swatch.svelte';

	export let childClass: string;

	let colors: string[] = [];

	export const setColors = (newColors: [string]) => {
		colors = newColors;
	};

	selectedColor.set(colors[0]);

	const updateSelectColor = (event: CustomEvent<selectColor>) => {
		selectedColor.set(event.detail.color);
	};
</script>

<div class="grid grid-cols-8 gap-2 p-2 bg-white {childClass}">
	{#each colors as color}
		<Swatch {color} on:selectColor={updateSelectColor}></Swatch>
	{/each}
</div>
