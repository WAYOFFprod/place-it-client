<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		isSmall?: boolean;
		container?: string;
		noShadow?: boolean;
		className?: string;
		content: Snippet;
	}

	let {
		isSmall = false,
		container = 'bg-off-white',
		noShadow = false,
		className = '',
		content
	}: Props = $props();
</script>

<div class="relative {className}">
	<div class="relative border-2 border-solid rounded border-black z-10 overflow-hidden {container}">
		{@render content()}
	</div>
	{#if !noShadow}
		<div
			class="absolute inset-0 rounded bg-black z-0 {isSmall
				? 'translate-x-0.5 translate-y-0.5'
				: 'translate-x-1 translate-y-1'}"
		></div>
	{/if}
</div>
