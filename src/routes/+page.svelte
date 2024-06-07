<script>
	import Canva from '$lib/components/canva.svelte';
	import Header from '$lib/components/header.svelte';
</script>

<div class="flex flex-col h-full">
	<Header>
		<div class="flex justify-between">
			<div>home icon</div>
			<div>CANVAS NAME</div>
			<div>share and export</div>
		</div>
	</Header>
	<Canva></Canva>
</div>

<style lang="postcss">
	:global(html),
	:global(body) {
		overflow: hidden;
	}
</style>
