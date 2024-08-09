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
	let canva: undefined | CanvaPreviewData = undefined;
	let isLoadingSlow = false;
	const fetchData = async () => {
		const delay = setTimeout(() => {
			isLoadingSlow = true;
		}, 2 * 1000);
		// for testing
		// await new Promise((r) => setTimeout(r, 6 * 1000));

		await networker.getSession();
		if (canva_id == null) return null;

		canva = await networker.getCanva(canva_id);
		clearTimeout(delay);
	};

	const onclickExport = () => {
		openedModal.set({ name: 'create' });
	};
	const networker = Networker.getInstance();

	fetchData();
</script>

<svelte:head>
	<title>Canva {canva?.name}</title>
	<meta name="description" content="an editable canva" />
</svelte:head>
<div class="flex flex-col h-full">
	<Header>
		<div class="flex justify-between h-10 items-center p-6">
			<a aria-label="homepage" href="/">
				<img src="/svg/home.svg" alt="" />
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
		<div class="absolute top-14 bottom-0 w-full flex flex-col justify-center items-center gap-8">
			<p class="text-3xl">Loading</p>
			{#if isLoadingSlow}
				<div>
					This app is currently running on slow servers, the first load may take up to a minute.
				</div>
			{/if}
		</div>
	{/if}
</div>

<style lang="postcss">
	:global(html),
	:global(body) {
		overflow: hidden;
	}
</style>
