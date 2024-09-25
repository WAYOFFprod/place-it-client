<script lang="ts">
	import Panel from '$lib/components/layout/panel.svelte';

	import Tool from '$lib/components/toolbar/ToolClass';

	import { selectedTool, setTool, toolClasses } from '$lib/stores/toolStore';
	import { onDestroy } from 'svelte';
	import ToolIcon from './toolIcon.svelte';
	import type { selectTool } from './types';

	import { isWindowSmall } from '$lib/stores/tailwindStore';

	let windowSmall: boolean | undefined = false;
	let expandedToolbar: boolean = false;

	isWindowSmall.subscribe((val) => {
		windowSmall = val;
	});

	let tools: (typeof Tool)[];

	toolClasses.subscribe((newClasses) => {
		if (newClasses == undefined) return;
		tools = Object.values(newClasses);
	});

	let currentTool: Tool | undefined;
	let currentToolType: typeof Tool | null;

	const unsubscribeTool = selectedTool.subscribe((newTool: Tool | undefined) => {
		if (newTool == undefined) return;
		currentTool = newTool;
		currentToolType = currentTool.getType();
	});

	const updateSelectTool = (event: CustomEvent<selectTool>) => {
		setTool(event.detail.tool);
		if (isWindowSmall) expandedToolbar = false;
	};

	onDestroy(() => {
		unsubscribeTool();
	});

	const toggleToolbarLength = () => {
		expandedToolbar = !expandedToolbar;
	};
</script>

<div class="{$$props.class} cursor-hand">
	<Panel class="w-fit">
		<div class="grid grid-cols-1 gap-2 p-1 m-1 md:m-2">
			{#if tools != undefined}
				{#if !windowSmall || expandedToolbar}
					{#each tools as t}
						<ToolIcon
							on:selectTool={updateSelectTool}
							toolType={t.type}
							selected={currentToolType == t}
						>
							<svelte:component this={t.icon} />
						</ToolIcon>
					{/each}
				{:else if windowSmall && currentToolType != null}
					<ToolIcon
						toolType={currentToolType.type}
						selected={true}
						on:selectTool={toggleToolbarLength}
					>
						<svelte:component this={currentToolType.icon} />
					</ToolIcon>
				{/if}
			{/if}
		</div>
	</Panel>
</div>
