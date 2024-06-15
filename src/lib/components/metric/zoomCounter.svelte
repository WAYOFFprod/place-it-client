<script lang="ts">
	import { zoom } from '$lib/stores/canvaStore';
	import Panel from '../layout/panel.svelte';

	let zoomLevel: number | undefined;
	zoom.subscribe((newZoom) => {
		zoomLevel = newZoom;
	});
</script>

<Panel>
	<div class="p-2">
		{#if zoomLevel}
			{zoomLevel.toFixed(0)} %
		{/if}
	</div>
</Panel>
