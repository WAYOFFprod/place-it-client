<script lang="ts">
	// import type { MouseEventHandler } from 'svelte/elements';
	import Panel from '../layout/panel.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let id: string | undefined = undefined;
	export let type: 'button' | 'reset' | 'submit' | 'link' = 'button';
	export let stretch: boolean = true;
	export let link: string = '';
	export let disabled: boolean = false;

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

	$: isHovering = disabled ? false : hovered;
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
				class="px-2 md:px-4 py-2 flex justify-center items-center gap-4 text-xl {classColor} {stretch
					? 'w-full'
					: ''}"
				href={link}
			>
				<slot></slot>
			</a>
		{:else}
			<button
				id={id ? 'button-' + id : undefined}
				on:click|preventDefault={click}
				{type}
				{disabled}
				class="px-2 md:px-4 py-2 flex justify-center items-center gap-4 text-xl disabled:bg-dark-grey disabled:cursor-not-allowed {classColor} {stretch
					? 'w-full'
					: ''}"
			>
				<slot></slot>
			</button>
		{/if}
	</Panel>
</div>
