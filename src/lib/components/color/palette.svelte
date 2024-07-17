<script lang="ts">
	import { storedColors, selectedColor } from '$lib/stores/colorStore';
	import Panel from '$lib/components/layout/panel.svelte';
	import Swatch from './swatch.svelte';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import ColorWheel from './editor/colorWheel.svelte';

	export let childClass: string;
	let currentColor: string;
	let colors: string[] = [];

	let editMode = false;

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

	const toggleEdit = () => {
		editMode = !editMode;
	};

	onDestroy(() => {
		unsubscribeSelectedColor();
		unsubscribeColor();
	});
</script>

<div class="{childClass} cursor-pointer flex flex-col gap-4">
	{#if editMode}
		<ColorWheel></ColorWheel>
	{/if}
	<Panel class="w-fit" container="bg-white flex items-center pr-4">
		<div class="grid grid-cols-8 gap-2 p-2 m-2">
			{#each colors as color}
				<Swatch {color} on:selectColor={updateSelectColor} selected={color == currentColor}
				></Swatch>
			{/each}
		</div>
		<div class="flex gap-4">
			{#if editMode}
				<button><img src="/svg/undo.svg" alt="undo icon" /></button>
				<button on:click={toggleEdit}><img src="/svg/save.svg" alt="settings icon" /></button>
			{:else}
				<button on:click={toggleEdit}><img src="/svg/settings.svg" alt="settings icon" /></button>
			{/if}
		</div>
	</Panel>
</div>
