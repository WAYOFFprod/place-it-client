<script lang="ts">
	let { show, className }: { show: boolean; className?: string } = $props();
</script>

{#if show}
	<div
		class="absolute top-0 bottom-0 right-0 flex items-center justify-center pointer-events-none {className}"
	>
		<span class="block px-4 py-2 rounded bg-dark-grey text-off-white border border-off-white"
			><slot></slot>
		</span>
	</div>
{/if}
