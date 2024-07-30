<script lang="ts">
	import Canva from '$lib/components/canva.svelte';
	import Button from '$lib/components/form/button.svelte';
	import Header from '$lib/components/header.svelte';
	import { openedModal } from '$lib/stores/modalStore';
	import Networker from '$lib/utility/Networker';

	const getIdFromParam = () => {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		const id = urlParams.get('id');
		return id ? parseInt(id) : null;
	};
	const canva_id: number | null = getIdFromParam();
	let canva: undefined | CanvaRequestData = undefined;

	const fetchData = async () => {
		await networker.getSession();
		if (canva_id == null) return null;

		canva = await networker.getCanva(canva_id);
	};

	const onclickExport = () => {
		openedModal.set({ name: 'create' });
	};
	const networker = Networker.getInstance();

	fetchData();
</script>

<div class="flex flex-col h-full">
	<Header>
		<div class="flex justify-between h-10 items-center p-6">
			<a href="/">
				<img src="/svg/home.svg" alt="home icon" />
			</a>
			<div class="uppercase">
				{#if canva}
					{canva.name}
				{/if}
			</div>
			<div class="flex gap-2">
				<Button stretch={false} type="button" on:click={onclickExport} disabled>Export</Button>
			</div>
		</div>
	</Header>
	{#if canva}
		<Canva {canva} viewOnly={false} class="" marginBottom={52}></Canva>
	{:else}
		<div>Loading</div>
	{/if}
</div>

<style lang="postcss">
	:global(html),
	:global(body) {
		overflow: hidden;
	}
</style>
