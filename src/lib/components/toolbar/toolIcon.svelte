<script lang="ts">
	import { ToolType } from '$lib/stores/toolStore';
	import type { SelectTool } from './types';

	interface Props {
		toolType: ToolType;
		selected?: boolean;
		selectTool?: (event: SelectTool) => void;
	}

	let { toolType, selected = false, selectTool }: Props = $props();

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
	<slot />
</button>
