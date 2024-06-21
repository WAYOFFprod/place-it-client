<script>
	import Canva from '$lib/components/canva.svelte';
	import Button from '$lib/components/form/button.svelte';
	import Header from '$lib/components/header.svelte';
	import { openedModal } from '$lib/stores/modalStore';

	const onclickReset = () => {
		openedModal.set('create');
	};

	const onclickLogin = () => {
		openedModal.set('login');
	};
</script>

<div class="flex flex-col h-full">
	<Header>
		<div class="flex justify-between h-10 items-center">
			<a href="/">
				<img src="/svg/home.svg" alt="home icon" />
			</a>
			<div>CANVAS NAME</div>
			<div class="flex gap-2">
				<Button stretch={false} type="button" on:click={onclickReset}>Reset</Button>
				<Button stretch={false} type="button" on:click={onclickLogin}>Login</Button>
			</div>
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
