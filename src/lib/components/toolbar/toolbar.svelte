<script lang="ts">
	import Panel from '$lib/components/panel.svelte';
	
	import Tool from "$lib/components/toolbar/ToolClass";
	import MoveTool from "$lib/components/toolbar/tools/MoveTool";
	import PointTool from "$lib/components/toolbar/tools/PointTool";
	import SelectionTool from "$lib/components/toolbar/tools/SelectionTool";

	import { selectedTool, setTool, toolClasses } from '$lib/stores/toolStore';
	import ToolIcon from './toolIcon.svelte';
	import type { selectTool } from './types';

	import P5 from 'p5';

	export let childClass: string;
	export let p5: P5;
	
	let tools = Object.values(toolClasses);

	let currentTool: Tool | undefined
	let currentToolType: typeof Tool | null

	selectedTool.subscribe((newTool: Tool | undefined) => {
		if(newTool == undefined) return;
		currentTool = newTool;
		currentToolType = currentTool.getType()
	});

	const updateSelectTool = (event: CustomEvent<selectTool>) => {
		setTool(event.detail.tool, p5);
	};

</script>
<div class="{childClass} cursor-hand">
	<Panel>
		<div class="grid grid-cols-1 gap-2 p-2 m-2">
			{#each tools as t, i}
			<ToolIcon on:selectTool={updateSelectTool} toolType={t.type} selected="{currentToolType == t}">
				<svelte:component this={t.icon} />
			</ToolIcon>
			{/each}
		</div>
	</Panel>
</div>
