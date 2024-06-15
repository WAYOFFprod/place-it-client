<script lang="ts">
	import { mouseCoord } from '$lib/stores/canvaStore';
	import Panel from '../layout/panel.svelte';

	let coord: Coord | undefined;
	mouseCoord.subscribe((newCoord) => {
		coord = newCoord;
	});
</script>

<Panel>
	<div class="p-2">
		{#if coord}
			x:{coord.x}, y:{coord.y}
		{/if}
	</div>
</Panel>
