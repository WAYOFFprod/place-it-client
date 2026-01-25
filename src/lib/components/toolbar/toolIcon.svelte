<script lang="ts">
	import { ToolType } from '$lib/stores/toolStore';
	import { createEventDispatcher } from 'svelte';
	import type { selectToolEvent } from './types';
	const dispatch = createEventDispatcher<selectToolEvent>();

	export let toolType: ToolType;
	export let selected: boolean = false;

	const select = () => {
		dispatch('selectTool', { tool: toolType });
	};

	$: selectedClass = selected ? 'text-fluorescent-cyan' : 'text-black';
</script>

<button
	class="w-8 h-8 flex justify-center items-center transition-colors {selectedClass}"
	on:click|stopPropagation={select}
>
	<slot />
</button>
