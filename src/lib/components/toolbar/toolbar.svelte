<script lang="ts">
	import Panel from '$lib/components/layout/panel.svelte';

	import Tool from '$lib/components/toolbar/ToolClass';

	import {
		destroyActiveTool,
		readOnlytoolClasses,
		selectedTool,
		setTool,
		toolClasses
	} from '$lib/stores/toolStore';
	import { onDestroy } from 'svelte';
	import ToolIcon from './toolIcon.svelte';
	import type { selectTool } from './types';

	import P5 from 'p5';

	export let p5: P5;
	export let viewOnly: boolean;

	let tools: (typeof Tool)[];
	if (viewOnly) {
		tools = Object.values(readOnlytoolClasses);
	} else {
		tools = Object.values(toolClasses);
	}

	let currentTool: Tool | undefined;
	let currentToolType: typeof Tool | null;

	const unsubscribeTool = selectedTool.subscribe((newTool: Tool | undefined) => {
		if (newTool == undefined) return;
		currentTool = newTool;
		currentToolType = currentTool.getType();
	});

	const updateSelectTool = (event: CustomEvent<selectTool>) => {
		setTool(event.detail.tool, p5);
	};

	onDestroy(() => {
		unsubscribeTool();
	});
</script>

<div class="{$$props.class} cursor-hand">
	<Panel class="w-fit">
		<div class="grid grid-cols-1 gap-2 p-1 m-2">
			{#each tools as t, i}
				<ToolIcon
					on:selectTool={updateSelectTool}
					toolType={t.type}
					selected={currentToolType == t}
				>
					<svelte:component this={t.icon} />
				</ToolIcon>
			{/each}
		</div>
	</Panel>
</div>
