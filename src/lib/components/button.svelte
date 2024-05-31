<script lang="ts">
	export let childClass: string;
	const onClick = (e: Event) => {};
</script>

<button class="w-8 h-8 {childClass}" on:click={onClick}>Clear</button>
