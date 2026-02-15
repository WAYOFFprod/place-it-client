<script lang="ts">
	import { storedColors, selectedColor } from '$lib/stores/colorStore';
	import Panel from '$lib/components/layout/panel.svelte';
	import Swatch from './swatch.svelte';
	import { onDestroy } from 'svelte';
	import ColorEditor from './editor/colorEditor.svelte';
	import Networker from '$lib/utility/Networker';

	const networker = Networker.getInstance();

	interface Props {
		childClass: string;
		canvaId: number | undefined;
		canvasOwned: boolean | undefined;
		colors: string[];
		setColors: (newColors: [string]) => void;
	}

	let {
		childClass,
		canvaId,
		canvasOwned,
		colors = $bindable(),
		setColors = $bindable()
	}: Props = $props();

	let currentColor: string = $state('');
	let colorIndex: number = $state(-1);

	let storedColorPalette: string[];

	let editMode = $state(false);

	setColors = (newColors: [string]) => {
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

	const onUpdateSelectColor = (color: string) => {
		selectedColor.set(color);
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
	<Panel className="w-fit" container="bg-white flex items-center">
		{#snippet content()}
			<div class="grid grid-cols-8 gap-2 p-2 m-2">
				{#each colors as color}
					<Swatch
						{color}
						onclick={() => onUpdateSelectColor(color)}
						edit={editMode}
						selected={color == currentColor}
					></Swatch>
				{/each}
			</div>
			{#if canvasOwned}
				<div class="flex gap-4 pr-4">
					{#if editMode}
						<button onclick={onUndo}><img src="/svg/undo.svg" alt="undo icon" /></button>
						<button onclick={onSave}><img src="/svg/save.svg" alt="save icon" /></button>
					{:else}
						<button onclick={onOpenSettings}><img src="/svg/settings.svg" alt="edit icon" /></button
						>
					{/if}
				</div>
			{/if}
		{/snippet}
	</Panel>
</div>
