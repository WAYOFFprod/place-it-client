<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';
	import Panel from '../layout/panel.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let type: 'button' | 'reset' | 'submit' | 'link' = 'button';
	export let stretch: boolean = true;
	export let link: string = '';

	export let classColor: string = 'bg-naples-yellow hover:bg-naples-yellow-focus';

	let hovered: boolean = false;
	const mouseEnter = () => {
		hovered = true;
	};

	const mouseLeave = () => {
		hovered = false;
	};

	const focus = () => {};

	const click = (e: any) => {
		e.preventDefault();
		dispatch('click');
	};

	$: isHovering = hovered;
</script>

<div
	class="{stretch ? 'w-full' : ''} {$$props.class}"
	role="presentation"
	on:focus={focus}
	on:mouseover={mouseEnter}
	on:mouseleave={mouseLeave}
>
	<Panel isSmall={isHovering} class={stretch ? 'w-full' : ''}>
		{#if type == 'link'}
			<a
				class="px-4 py-2 flex justify-center items-center gap-4 text-xl {classColor} {stretch
					? 'w-full'
					: ''}"
				href={link}
			>
				<slot></slot>
			</a>
		{:else}
			<button
				on:click|preventDefault={click}
				{type}
				class="px-4 py-2 flex justify-center items-center gap-4 text-xl {classColor} {stretch
					? 'w-full'
					: ''}"
			>
				<slot></slot>
			</button>
		{/if}
	</Panel>
</div>
