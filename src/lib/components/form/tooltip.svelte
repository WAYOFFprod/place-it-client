<script lang="ts">
	import type { Snippet } from 'svelte';

	let { show, className, content }: { show: boolean; className?: string; content?: Snippet } =
		$props();
</script>

{#if show}
	<div
		class="absolute top-0 bottom-0 right-0 flex items-center justify-center pointer-events-none {className}"
	>
		<span class="block px-4 py-2 rounded bg-dark-grey text-off-white border border-off-white">
			{#if content}
				{@render content()}
			{/if}
		</span>
	</div>
{/if}
