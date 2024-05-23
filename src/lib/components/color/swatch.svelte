<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher<selectColorEvent>();

	export let color: string;

	const select = () => {
		dispatch('selectColor', { color: color });
	};
</script>

<button class="h-8 w-8" style="background-color: {color};" on:click|stopPropagation={select}
></button>
