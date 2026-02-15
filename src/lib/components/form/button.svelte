<script lang="ts">
	import type { Snippet } from 'svelte';
	import Panel from '../layout/panel.svelte';

	interface Props {
		id?: string;
		type?: 'button' | 'reset' | 'submit' | 'link';
		stretch?: boolean;
		link?: string;
		disabled?: boolean;
		classColor?: string;
		className?: string;
		click?: (e: MouseEvent) => void;
		content: Snippet;
	}

	let {
		id,
		type = 'button',
		stretch = true,
		link = '',
		disabled = false,
		classColor = 'bg-naples-yellow hover:bg-naples-yellow-focus',
		className = '',
		click,
		content: subContent
	}: Props = $props();

	let hovered: boolean = false;
	const mouseEnter = () => {
		hovered = true;
	};

	const mouseLeave = () => {
		hovered = false;
	};

	const focus = () => {};

	const onclick = (e: MouseEvent) => {
		e.preventDefault();
		click?.(e);
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
	<Panel isSmall={isHovering} className={stretch ? 'w-full' : ''}>
		{#snippet content()}
			{#if type == 'link'}
				<a
					class="px-2 md:px-4 py-2 flex justify-center items-center gap-4 text-xl {classColor} {stretch
						? 'w-full'
						: ''}"
					href={link}
				>
					{@render subContent()}
				</a>
			{:else}
				<button
					id={id ? 'button-' + id : undefined}
					{onclick}
					{type}
					{disabled}
					class="px-2 md:px-4 py-2 flex justify-center items-center gap-4 text-xl disabled:bg-dark-grey disabled:cursor-not-allowed {classColor} {stretch
						? 'w-full'
						: ''}"
				>
					{@render subContent()}
				</button>
			{/if}
		{/snippet}
	</Panel>
</div>
