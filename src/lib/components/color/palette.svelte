<script lang="ts">
	import { storedColors, selectedColor } from '$lib/stores/colorStore';
	import Panel from '$lib/components/layout/panel.svelte';
	import Swatch from './swatch.svelte';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import ColorWheel from './editor/colorWheel.svelte';
	import ColorEditor from './editor/colorEditor.svelte';
	import Networker from '$lib/utility/Networker';
	import NumberInput from '../form/numberInput.svelte';

	const dispatch = createEventDispatcher();
	const networker = Networker.getInstance();

	export let childClass: string;
	export let canvaId: number | undefined;
	let currentColor: string;
	let colorIndex: number = -1;
	let colors: string[] = [];

	let storedColorPalette: string[];

	let editMode = false;

	export const setColors = (newColors: [string]) => {
		storedColors.set(newColors);
		selectedColor.set(newColors[0]);
		colorIndex = 0;
	};

	const unsubscribeSelectedColor = selectedColor.subscribe((newColor) => {
		currentColor = newColor;
		colorIndex = colors.indexOf(currentColor);
	});

	const unsubscribeColor = storedColors.subscribe((newColors) => {
		colors = newColors;
	});

	const onUpdateSelectColor = (event: CustomEvent<selectColor>) => {
		selectedColor.set(event.detail.color);
		if (!editMode) {
		}
	};

	const onOpenSettings = () => {
		editMode = true;
		storedColorPalette = [...colors];
	};

	const onSave = () => {
		editMode = false;
		storedColorPalette = [...colors];
		selectedColor.set(storedColorPalette[colorIndex]);
		if (canvaId) {
			networker.replaceColors(canvaId, storedColorPalette);
		}
	};

	const onUndo = () => {
		editMode = false;
		storedColors.set(storedColorPalette);
	};

	onDestroy(() => {
		unsubscribeSelectedColor();
		unsubscribeColor();
	});
</script>

<div class="{childClass} cursor-pointer flex flex-col gap-4">
	{#if editMode}
		<ColorEditor currentColorIndex={colorIndex} colorPalette={colors}></ColorEditor>
	{/if}
	<Panel class="w-fit" container="bg-white flex items-center pr-4">
		<div class="grid grid-cols-8 gap-2 p-2 m-2">
			{#each colors as color}
				<Swatch
					{color}
					on:selectColor={onUpdateSelectColor}
					edit={editMode}
					selected={color == currentColor}
				></Swatch>
			{/each}
		</div>
		<div class="flex gap-4">
			{#if editMode}
				<button on:click={onUndo}><img src="/svg/undo.svg" alt="undo icon" /></button>
				<button on:click={onSave}><img src="/svg/save.svg" alt="save icon" /></button>
			{:else}
				<button on:click={onOpenSettings}><img src="/svg/settings.svg" alt="edit icon" /></button>
			{/if}
		</div>
	</Panel>
</div>
