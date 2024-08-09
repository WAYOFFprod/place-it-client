<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let childClass: string;
	const onClick = () => {
		dispatch('resetCanva');
	};
</script>

<button class="w-8 h-8 {childClass}" on:click={onClick}>Clear</button>
