<script lang="ts">
	import Panel from '$lib/components/layout/panel.svelte';
	import { storedColors } from '$lib/stores/colorStore';
	import type { SelectColor } from '../types';
	import ColorWheel from './colorWheel.svelte';

	interface Props {
		currentColorIndex: number;
		colorPalette: string[];
	}

	let { currentColorIndex, colorPalette }: Props = $props();

	let tab: 'disk' | 'harmonie' | 'palettes' = $state('disk');

	const onUpdateColor = (selectedColor: SelectColor) => {
		if (currentColorIndex >= 0) {
			const cs = colorPalette;
			cs[currentColorIndex] = selectedColor.color;
			storedColors.set(cs);
		}
	};
</script>

<Panel className="w-full " container="bg-white px-8 py-5 flex flex-col gap-10">
	{#snippet content()}
		<div class="flex justify-center gap-4">
			<button
				aria-label="open color picker"
				onclick={() => (tab = 'disk')}
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
				onclick={() => (tab = 'harmonie')}
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
				onclick={() => (tab = 'palettes')}
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
			<ColorWheel updateColor={onUpdateColor}></ColorWheel>
		{/if}
	{/snippet}
</Panel>
