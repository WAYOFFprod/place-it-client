<script lang="ts">
	import { mouseCoord } from '$lib/stores/canvaStore';
	import { onDestroy } from 'svelte';
	import Panel from '../layout/panel.svelte';

	let coord: Coord | undefined = $state(undefined);
	const unsubscribeMouseCoord = mouseCoord.subscribe((newCoord) => {
		coord = newCoord;
	});

	onDestroy(() => {
		unsubscribeMouseCoord();
	});
</script>

<Panel>
	{#snippet content()}
		<div class="p-2">
			{#if coord}
				x:{coord.x}, y:{coord.y}
			{/if}
		</div>
	{/snippet}
</Panel>
