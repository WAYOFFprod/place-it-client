<script lang="ts">
	import Panel from '$lib/components/layout/panel.svelte';
	import { storedColors } from '$lib/stores/colorStore';
	import ColorWheel from './colorWheel.svelte';

	export let currentColorIndex: number;
	export let colorPalette: string[];

	let tab: 'disk' | 'harmonie' | 'palettes' = 'disk';

	const onUpdateColor = (event: CustomEvent<selectColor>) => {
		if (currentColorIndex >= 0) {
			const cs = colorPalette;
			cs[currentColorIndex] = event.detail.color;
			storedColors.set(cs);
		}
	};

	const onOpenDisk = () => {
		tab = 'disk';
	};
	const onOpenHarmonie = () => {
		tab = 'harmonie';
	};
	const onOpenPalettes = () => {
		tab = 'palettes';
	};
</script>

<Panel class="w-full " container="bg-white px-8 py-5 flex flex-col gap-10">
	<div class="flex justify-center gap-4">
		<button
			aria-label="open color picker"
			on:click={onOpenDisk}
			class="flex flex-col items-center gap-2 border-b-2 disabled:text-dark-grey disabled:cursor-not-allowed {tab ==
			'disk'
				? 'border-black'
				: 'border-transparent'}"
		>
			<img src="/svg/color-wheel.svg" alt="" />
			<div>Disque</div>
		</button>
		<button
			aria-label="open harmoie selector"
			on:click={onOpenHarmonie}
			class="flex flex-col items-center gap-2 border-b-2 disabled:text-dark-grey disabled:cursor-not-allowed {tab ==
			'harmonie'
				? 'border-black'
				: 'border-transparent'}"
			disabled
		>
			<img src="/svg/harmonie.svg" alt="" />
			<div>Harmonie</div>
		</button>
		<button
			aria-label="open palette selector"
			on:click={onOpenPalettes}
			class="flex flex-col items-center gap-2 border-b-2 disabled:text-dark-grey disabled:cursor-not-allowed {tab ==
			'palettes'
				? 'border-black'
				: 'border-transparent'}"
			disabled
		>
			<img src="/svg/palette.svg" alt="" />
			<div>Palettes</div>
		</button>
	</div>
	{#if tab == 'disk'}
		<ColorWheel on:updateColor={onUpdateColor}></ColorWheel>
	{/if}
</Panel>
