<script lang="ts">
	import { ToolType } from '$lib/stores/toolStore';
	import type { Snippet } from 'svelte';
	import type { SelectTool } from './types';

	interface Props {
		toolType: ToolType;
		selected?: boolean;
		selectTool?: (event: SelectTool) => void;
		content?: Snippet;
	}

	let { toolType, selected = false, selectTool, content }: Props = $props();

	const select = (e: MouseEvent) => {
		e.preventDefault();
		selectTool?.({ tool: toolType } as SelectTool);
	};

	const selectedClass = $derived(selected ? 'text-fluorescent-cyan' : 'text-black');
</script>

<button
	class="w-8 h-8 flex justify-center items-center transition-colors {selectedClass}"
	onclick={select}
>
	{#if content}
		{@render content()}
	{/if}
</button>
