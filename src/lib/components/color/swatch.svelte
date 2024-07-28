<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher<selectColorEvent>();

	export let color: string;
	export let selected = false;
	export let edit = false;

	const select = () => {
		dispatch('selectColor', { color: color });
	};
</script>

<button
	class="h-6 w-6 border-2"
	style="background-color: {color}; border-color:{!selected ? 'black' : edit ? '#49E8E0' : color}"
	on:click|stopPropagation={select}
></button>
