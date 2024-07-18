<script lang="ts">
	import Panel from '$lib/components/layout/panel.svelte';
	import { storedColors } from '$lib/stores/colorStore';
	import ColorWheel from './colorWheel.svelte';

	export let currentColorIndex: number;
	export let colorPalette: string[];

	const onUpdateColor = (event: CustomEvent<selectColor>) => {
		if (currentColorIndex >= 0) {
			const cs = colorPalette;
			cs[currentColorIndex] = event.detail.color;
			storedColors.set(cs);
		}
	};
</script>

<Panel class="w-full" container="bg-white px-6 py-4">
	<div>header</div>
	<ColorWheel on:updateColor={onUpdateColor}></ColorWheel>
</Panel>
