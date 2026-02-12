<script lang="ts">
	// import type { MouseEventHandler } from 'svelte/elements';
	import Panel from '../layout/panel.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	interface Props {
		id?: string;
		type?: 'button' | 'reset' | 'submit' | 'link';
		stretch?: boolean;
		link?: string;
		disabled?: boolean;
		classColor?: string;
		className?: string;
	}

	let {
		id,
		type = 'button',
		stretch = true,
		link = '',
		disabled = false,
		classColor = 'bg-naples-yellow hover:bg-naples-yellow-focus',
		className = ''
	}: Props = $props();

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

	let isHovering = $derived(disabled ? false : hovered);
</script>

<div
	class="{stretch ? 'w-full' : ''} {className}"
	role="presentation"
	onfocus={focus}
	onmouseover={mouseEnter}
	onmouseleave={mouseLeave}
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
				onclick={click}
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
