<script lang="ts">
	import Canva from '$lib/components/canva.svelte';
	import Button from '$lib/components/form/button.svelte';
	import Header from '$lib/components/header.svelte';
	import { openedModal } from '$lib/stores/modalStore';
	import Networker from '$lib/utility/Networker';
	import { isOnline } from '$lib/stores/onlineStore';
	import { OfflineStorage } from '$lib/utility/OfflineStorage';
	import { userStore } from '$lib/stores/authStore';
	import { get } from 'svelte/store';
	import SyncOverlay from '$lib/components/SyncOverlay.svelte';
	import type { CanvaPreviewData } from '$lib/components/types';

	const getIdFromParam = () => {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		const id = urlParams.get('id');
		return id ? parseInt(id) : null;
	};
	const canva_id: number | null = getIdFromParam();
	let canva: undefined | CanvaPreviewData = undefined;
	let isOffline = false;
	let isLoadingSlow = false;
	const fetchData = async () => {
		const delay = setTimeout(() => {
			isLoadingSlow = true;
		}, 2 * 1000);

		await networker.getSession();
		if (canva_id == null) return null;

		if (!navigator.onLine) {
			console.warn("You are currently offline, Loading canva from offline storage")
			// Try to load the canvas from the personal cache
			isOffline = true;
			const user = get(userStore);
			if (user) {
				const cached = await OfflineStorage.loadCanvasList(user.id);
				const found = cached.find((c) => c.id === canva_id);
				if (found && found.visibility === 'private' && found.owned) {
					canva = found;
				}
			}
			clearTimeout(delay);
			return;
		}

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
		{#snippet content()}
			<div class="flex justify-between h-10 items-center p-6">
				<a aria-label="homepage" href="/">
					<img src="/svg/home.svg" alt="" />
				</a>
				<div class="flex items-center gap-3 uppercase">
					{#if $isOnline === false}
						<span class="inline-flex items-center gap-1 rounded-full bg-bittersweet-red px-2 py-0.5 text-xs text-white normal-case">
							<span class="h-1.5 w-1.5 rounded-full bg-white"></span>
							Hors-ligne
						</span>
					{/if}
					{#if canva}
						{canva.name}
					{/if}
				</div>
				<div class="flex gap-2">
					<Button stretch={false} type="button" click={onclickExport} disabled>
						{#snippet content()}
							Export
						{/snippet}
					</Button>
				</div>
			</div>
		{/snippet}
	</Header>
	{#if canva}
		<SyncOverlay canvasId={canva.id} />
		<Canva {canva} viewOnly={false} marginBottom={52}></Canva>
	{:else if isOffline}
		<div class="absolute top-14 bottom-0 w-full flex flex-col justify-center items-center gap-8">
			<p class="text-3xl">Hors-ligne</p>
			<p class="text-center">Ce canva n'est pas disponible hors-ligne.<br />Seuls vos canva privés sont accessibles sans connexion.</p>
			<a href="/" class="underline uppercase">Retour au tableau de bord</a>
		</div>
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
