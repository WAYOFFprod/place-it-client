<script lang="ts">
	import type { Snippet } from 'svelte';

	let isOpen: boolean = $state(false);

	interface Props {
		heading?: Snippet;
		content?: Snippet;
	}

	let { heading, content }: Props = $props();

	const toggleOpen = () => {
		isOpen = !isOpen;
	};
</script>

<div>
	<!-- heading -->
	<button
		aria-pressed={isOpen}
		onclick={toggleOpen}
		type="button"
		class="flex flex-row justify-between w-full"
	>
		{#if heading}
			{@render heading()}
		{/if}

		<img class={isOpen ? '' : '-rotate-90'} src="/svg/chevron-down.svg" alt="" />
	</button>
	<!-- content -->
	<div class="pl-9 py-4 text-medium {isOpen ? 'hidden' : ''}">
		{#if content}
			{@render content()}{/if}
	</div>
</div>
