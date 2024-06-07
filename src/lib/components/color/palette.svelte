<script lang="ts">
	import { selectedColor } from '$lib/stores/colorStore';
	import Panel from '$lib/components/panel.svelte';
	import Swatch from './swatch.svelte';

	export let childClass: string;

	let colors: string[] = [];
	let currentColor: string;

	export const setColors = (newColors: [string]) => {
		colors = newColors;
		selectedColor.set(colors[0]);
	};

	selectedColor.subscribe((newColor) => {
		currentColor = newColor;
	});

	const updateSelectColor = (event: CustomEvent<selectColor>) => {
		selectedColor.set(event.detail.color);
	};

</script>
<div class="{childClass} cursor-pointer">
	<Panel>
		<div class="grid grid-cols-8 gap-2">
			{#each colors as color}
				<Swatch {color} on:selectColor={updateSelectColor} selected="{color == currentColor}"></Swatch>
			{/each}
		</div>
	</Panel>
</div>
