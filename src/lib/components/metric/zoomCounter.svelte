<script lang="ts">
	import { zoom } from '$lib/stores/canvaStore';
	import { onDestroy } from 'svelte';
	import Panel from '../layout/panel.svelte';

	let zoomLevel: number | undefined;
	const unsubscribeZoom = zoom.subscribe((newZoom) => {
		zoomLevel = newZoom;
	});

	onDestroy(() => {
		unsubscribeZoom();
	});
</script>

<Panel>
	<div class="p-2">
		{#if zoomLevel}
			{zoomLevel.toFixed(0)} %
		{/if}
	</div>
</Panel>
