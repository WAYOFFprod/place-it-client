<script lang="ts">
	import { type Snippet } from 'svelte';
	let { content, className = '' }: { content: Snippet; className?: string } = $props();
</script>

<div class="relative border-2 border-solid border-black bg-white z-10 {className}">
	{@render content()}
</div>
