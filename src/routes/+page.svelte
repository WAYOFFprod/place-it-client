<script>
	import Canva from '$lib/components/canva.svelte';
	import Button from '$lib/components/form/button.svelte';
	import Header from '$lib/components/header.svelte';
	import { openedModal } from '$lib/stores/modalStore';

	const onclick = () => {
    openedModal.set('create')
  }
</script>

<div class="flex flex-col h-full">
	<Header>
		<div class="flex justify-between">
			<div>home icon</div>
			<div>CANVAS NAME</div>
			<Button stretch={false} type="button" on:click={onclick}>Reset</Button>
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
