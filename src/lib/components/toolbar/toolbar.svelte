<script lang="ts">
	import Panel from '$lib/components/layout/panel.svelte';

	import Tool from '$lib/components/toolbar/ToolClass';

	import { initTools, selectedTool, setTool, toolClasses } from '$lib/stores/toolStore';
	import { onDestroy, onMount } from 'svelte';
	import ToolIcon from './toolIcon.svelte';
	import type { selectTool } from './types';

	import P5 from 'p5';
	import { mdBreak } from '$lib/stores/tailwindStore';

	export let p5: P5;
	export let viewOnly: boolean;

	let isWindowSmall: boolean | undefined = false;
	let md: number | undefined;
	let expandedToolbar: boolean = false;

	mdBreak.subscribe((val) => {
		md = val;
		// initial size
		isWindowSmall = window.innerWidth >= md ? false : true;
	});

	let tools: (typeof Tool)[];

	initTools(viewOnly);

	toolClasses.subscribe((newClasses) => {
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

	const onResize = () => {
		if (md) isWindowSmall = window.innerWidth >= md ? false : true;
	};

	const toggleToolbarLength = () => {
		expandedToolbar = !expandedToolbar;
	};

	onMount(() => {
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
		};
	});
</script>

<div class="{$$props.class} cursor-hand">
	<Panel class="w-fit">
		<div class="grid grid-cols-1 gap-2 p-1 m-1 md:m-2">
			{#if !isWindowSmall || expandedToolbar}
				{#each tools as t}
					<ToolIcon
						on:selectTool={updateSelectTool}
						toolType={t.type}
						selected={currentToolType == t}
					>
						<svelte:component this={t.icon} />
					</ToolIcon>
				{/each}
			{:else if isWindowSmall && currentToolType != null}
				<ToolIcon
					toolType={currentToolType.type}
					selected={true}
					on:selectTool={toggleToolbarLength}
				>
					<svelte:component this={currentToolType.icon} />
				</ToolIcon>
			{/if}
		</div>
	</Panel>
</div>
