<script lang="ts">
	import { selectedColor } from '$lib/stores/colorStore';
	import Swatch from './swatch.svelte';

	export let childClass: string;

	const colors: string[] = [
		'#ffd887',
		'#eb9361',
		'#da5e4e',
		'#ab2330',
		'#dfffff',
		'#b5de89',
		'#6aab7c',
		'#26616b',
		'#a2dceb',
		'#759ed0',
		'#434ea8',
		'#2a2140',
		'#e1a7c5',
		'#ab7ac6',
		'#735bab',
		'#3b3772'
	];

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
