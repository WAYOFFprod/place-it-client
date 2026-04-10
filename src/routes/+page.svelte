<script lang="ts">
	import { userStore } from '$lib/stores/authStore';
	import { onDestroy, onMount } from 'svelte';
	import Button from '$lib/components/form/button.svelte';
	import Select from '$lib/components/form/select.svelte';
	import TextInput from '$lib/components/form/textInput.svelte';
	import ToggleButton from '$lib/components/form/toggleButton.svelte';
	import Header from '$lib/components/header.svelte';
	import Modal from '$lib/components/modal.svelte';
	import Versioning from '$lib/components/versioning/index.svelte';
	import { openedModal } from '$lib/stores/modalStore';
	import Networker from '$lib/utility/Networker';
	import CanvaPreview from '$lib/components/canvaPreview.svelte';
	import { authStatus } from '$lib/stores/authStore';
	import { event } from '$lib/stores/eventStore';
	import { pushState } from '$app/navigation';
	import { page } from '$app/stores';
	import { isOnline } from '$lib/stores/onlineStore';
	import { OfflineStorage } from '$lib/utility/OfflineStorage';
	import type { Size2D } from '$lib/p5/types';
	import type { CanvaPreviewData } from '$lib/components/types';
	import type { options } from '$lib/components/form/types';

	let canvasScope: 'community' | 'personal' = 'personal';
	let tab: 'my-canvas' | 'community-canvas' = 'my-canvas';

	type categoryOptions = 'all' | 'pixelwar' | 'artistic' | 'free';
	
	const networker = Networker.getInstance();

	let searchTerm: string = '';
	let sort: undefined | 'asc' | 'desc';
	let favoritFilter: undefined | 1;
	let userName: string | undefined;
	let category: undefined | categoryOptions;
	let windowSize: Size2D = {
		width: 0,
		height: 0
	};
	let timer: ReturnType<typeof setTimeout>;
	let headerHeight = 150;
	let additionHeader = 0;

	addEventListener('popstate', () => {});
	onpopstate = () => {
		const params = new URLSearchParams(location.search);
		initParamsFromUrl(params);
		fetchCanvas();
	};

	const unsubscribeUser = userStore.subscribe((newUser) => {
		if (newUser == undefined) return;
		userName = newUser.name;
	});

	// init params from url
	const initParamsFromUrl = (params: URLSearchParams) => {
		if (params.has('sort')) {
			const newSort = params.get('sort');
			if (newSort == 'asc' || newSort == 'desc') {
				sort = newSort;
			}
		} else {
			sort = undefined;
		}
		if (params.has('search')) {
			const initSearch = params.get('search');
			if (initSearch != null) {
				searchTerm = initSearch;
			}
		}
		if (params.has('main')) {
			const initMain = params.get('main');
			if (initMain == 'community' || initMain == 'personal') {
				canvasScope = initMain;
				tab = canvasScope == 'personal' ? 'my-canvas' : 'community-canvas';
			}
		}
		if (params.has('favorit')) {
			const initFavorit = params.get('favorit');
			favoritFilter = initFavorit == 'true' ? 1 : undefined;
		} else {
			favoritFilter = undefined;
		}
		if (params.has('category')) {
			const initCategory = params.get('category');
			if (initCategory == 'all' || initCategory == 'pixelwar' || initCategory == 'artistic' || initCategory == 'free') {
				category = initCategory as categoryOptions;
			}
		}
	};

	initParamsFromUrl($page.url.searchParams);

	const pushWindowState = () => {
		const data = buildQueryUrl('/');
		pushState(data.queryUrl, data.params);
	};

	const buildQueryUrl = (path: string) => {
		let queryUrl = path + '?main=' + canvasScope;
		let params: any = {};
		if (searchTerm != '') {
			queryUrl += '&search=' + searchTerm;
			params['search'] = searchTerm;
		}

		if (sort != undefined) {
			queryUrl += '&sort=' + sort;
			params['sort'] = sort;
		}

		if (favoritFilter != undefined) {
			queryUrl += '&favorit=true';
			params['favorit'] = true;
		}

		if (category != undefined) {
			queryUrl += '&category=' + category;
			params['category'] = category;
		}

		return {
			queryUrl: queryUrl,
			params: params
		};
	};

	const onclickNotification = () => {
		// openedModal.set('create');
	};

	const onCreateCanva = () => {
		openedModal.set({ name: 'create' });
	};

	const onClickLogin = () => {
		if (isConnected) {
			openedModal.set({ name: 'settings' });
		} else {
			openedModal.set({ name: 'login' });
		}
	};

	const openMyCanvas = async () => {
		if (tab == 'my-canvas') return;
		canvasScope = 'personal';
		await fetchCanvas();
		tab = 'my-canvas';
		pushWindowState();
	};

	const openCommunityCanvas = async () => {
		if (tab == 'community-canvas') return;
		canvasScope = 'community';
		await fetchCanvas();
		tab = 'community-canvas';
		pushWindowState();
	};

	const searchUpdated = async (searchTerm: string) => {
		if (!$isOnline) return;
		const data = await networker.getCanvas(canvasScope, sort, favoritFilter, category, searchTerm );
		if (data?.data) canvas = data.data;
	};

	const toggleRecent = async () => {
		sort = sort ? undefined : 'desc';
		await fetchCanvas();
		pushWindowState();
	};

	const toggleFavorit = async () => {
		favoritFilter = favoritFilter ? undefined : 1;
		await fetchCanvas();
		searchTerm = '';
		pushWindowState();
	};

	const changeCanvaType = async (value: string) => {
		category = value === 'all' ? undefined : value as categoryOptions;
		await fetchCanvas();
		pushWindowState();
	};

	

	const loadCanvasFromCache = async () => {
		const user = $userStore;
		if (!user) return;
		const cached = await OfflineStorage.loadCanvasList(user.id);
		if (cached.length > 0) {
			canvas = cached.filter(
				(c) => canvasScope === 'personal' ? true : (c.visibility !== 'private')
			);
		}
	};

	const fetchCanvas = async () => {
		if (!$isOnline) {
			await loadCanvasFromCache();
			return;
		}
		const data = await networker.getCanvas(canvasScope, sort, favoritFilter, category, searchTerm);
		if (data?.data) {
			canvas = data.data;
			// Persist for offline use (personal scope contains all user canvas)
			if (canvasScope === 'personal' && $userStore) {
				OfflineStorage.saveCanvasList($userStore.id, canvas);
			}
		} else {
			await loadCanvasFromCache();
		}
	};

	const fetchData = async () => {
		// trigger function to fetch data in background
		networker.getSession();
	};

	const updateCanvas = async () => {
		if (!$isOnline) {
			await loadCanvasFromCache();
			return;
		}
		const data = await networker.getCanvas(canvasScope, sort, favoritFilter, category, searchTerm);
		if (data?.data) {
			canvas = data.data;
			if (canvasScope === 'personal' && $userStore) {
				OfflineStorage.saveCanvasList($userStore.id, canvas);
			}
		} else {
			await loadCanvasFromCache();
		}
	};

	let isConnected: undefined | boolean = undefined;
	authStatus.subscribe((newStatus) => {
		isConnected = newStatus;
		if (isConnected == true || isConnected == false) updateCanvas();
	});

	event.subscribe((newEvent) => {
		if (newEvent == 'updateCanvas') updateCanvas();
		event.set('');
	});

	let canvas: CanvaPreviewData[] = [];

	const canvaTypeOptions = [
		{
			label: 'Tous',
			value: 'all'
		},
		{
			label: 'Pixelwar',
			value: 'pixelwar'
		},
		{
			label: 'Oeuvre Collaborative',
			value: 'artistic'
		},
		{
			label: 'Libre',
			value: 'free'
		}
	] as options[];

	const debounce = () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			setWindowSize();
		}, 300);
	};

	const setWindowSize = () => {
		windowSize.width = window.innerWidth;
		windowSize.height = window.innerHeight;
	};

	onMount(() => {
		window.addEventListener('resize', debounce);
		fetchData();
		return () => {
			window.removeEventListener('resize', debounce);
		};
	});

	onDestroy(() => {
		unsubscribeUser();
	});

	$: favoritToggle = favoritFilter == 1 ? true : false;
	$: recentToggle = sort == 'desc' ? true : false;
	$: containerTop = headerHeight + additionHeader;
</script>

<svelte:head>
	<title>Place-it Dashboard</title>
	<meta
		name="description"
		content="Place-it is a pixelart tool with sharable art. create personal canva or join other people artwork"
	/>
</svelte:head>
<Modal></Modal>
<Versioning></Versioning>
<div class="flex flex-col h-full">
	<Header className="top-0">
		{#snippet content()}
			<div class="border-b-2 border-black">
				<div class="relative container mx-auto flex justify-between items-stretch h-20 lg:h-24">
					<a
						class="flex grow justify-center lg:justify-start items-end lg:items-center p-4"
						href="/"
					>
						<img class="h-7 lg:h-10" src="/svg/logo.svg" alt="place-it logo" />
					</a>
					<div
						class="absolute right-0 bottom-0 lg:relative flex gap-2 lg:border-l-2 lg:pl-32 border-black items-center p-4"
					>
						<Button
							classColor="bg-tea-rose hover:bg-tea-rose-focus"
							stretch={false}
							type="button"
							click={onclickNotification}
						>
							{#snippet content()}
								<img class="icon" src="/svg/alarm.svg" alt="" />
								<span class="hidden lg:inline">Notifications</span>
							{/snippet}
						</Button>
					</div>
				</div>
			</div>
			<div class="container mx-auto flex h-16 items-stretch px-4">
				<div
					class="border-r-2 border-black flex gap-4 lg:gap-6 pr-4 lg:pr-32 items-center grow lg:grow-0"
				>
					<button
						id="button-my-canvas"
						onclick={openMyCanvas}
						class="border-b-2 {tab == 'my-canvas' ? 'border-black' : 'border-transparent'}"
						><span class="uppercase">Mes canvas</span></button
					>
					<button
						id="button-community-canvas"
						onclick={openCommunityCanvas}
						class="border-b-2 {tab == 'community-canvas' ? 'border-black' : 'border-transparent'}"
						><span class="uppercase">Communauté</span></button
					>
				</div>
				<div class="flex flex-row-reverse items-center grow-0 lg:grow pl-4">
					<div class="flex items-center gap-2">
						{#if !$isOnline}
							<span class="inline-flex items-center gap-1 rounded-full bg-bittersweet-red px-2 py-0.5 text-xs text-white">
								<span class="h-1.5 w-1.5 rounded-full bg-white"></span>
								Hors-ligne
							</span>
						{/if}
						<button
							id="button-profile"
							onclick={onClickLogin}
							class="flex items-center gap-2 uppercase"
						>
							{#if isConnected}
								<div class="hidden lg:block">{userName}</div>
							{:else if isConnected === false}
								<div>Login</div>
							{/if}
							<div class="rounded-full border-2 border-black w-8 h-8"></div>
						</button>
					</div>
				</div>
			</div>
		{/snippet}
	</Header>
	<div
		class="overflow-y-scroll w-full"
		style="top: {containerTop}px; height: calc(100vh - {containerTop}px);"
	>
		<div class="container mx-auto flex flex-row flex-wrap gap-4 lg:gap-8 py-8 px-8">
			<!-- search -->
			<TextInput
				onChange={searchUpdated}
				className="py-2 my-0 flex-shrink grow lg:grow-0 "
				id="search"
				type="text"
				placeholder="Chercher"
				value={searchTerm}
				liveUpdate={true}
			>
				{#snippet startIcon()}
					<img src="/svg/search.svg" alt="" />
				{/snippet}
			</TextInput>
			<div class="flex gap-4 lg:gap-8 justify-start lg:grow">
				<ToggleButton
					id="recent"
					label="Récents"
					className="hover:bg-fluorescent-cyan"
					classInactive="bg-white"
					classActive="!bg-fluorescent-cyan-focus"
					toggle={recentToggle}
					change={toggleRecent}
				>
					{#snippet content()}
						<img class="icon" src="/svg/time.svg" alt="" />
					{/snippet}
				</ToggleButton>
				<ToggleButton
					id="favorit"
					label="Favoris"
					className="hover:bg-tea-rose"
					classInactive="bg-white"
					classActive="!bg-tea-rose-focus"
					toggle={favoritToggle}
					disabled={!isConnected}
					change={toggleFavorit}
				>
					{#snippet content()}
						<img class="icon" src="/svg/heart.svg" alt="" />
					{/snippet}
				</ToggleButton>
				<Select
					className="min-w-52 hidden lg:block"
					id="canvaType"
					placeholder="Tous"
					options={canvaTypeOptions}
					change={changeCanvaType}
				></Select>
				<div class="flex grow justify-end">
					{#if isConnected}
						<Button stretch={false} click={onCreateCanva}>
							{#snippet content()}
								<img class="icon" src="/svg/plus.svg" alt="" />
								<span class="hidden xl:inline">Créer un nouveau canva</span>
							{/snippet}
						</Button>
					{/if}
				</div>
			</div>
			<div class="grow lg:grow-0 lg:hidden">
				<Select className="min-w-52" id="canvaType" placeholder="Tous" options={canvaTypeOptions}
				></Select>
			</div>
		</div>
		<!-- content -->
		<div class="h-full px-8 items-center justify-center {canvas.length == 0 ? 'flex' : 'hidden'}">
			<span class="uppercase">Vous n'avez pas encore de canva</span>
		</div>
		<div
			class="container mx-auto p-8 {canvas.length != 0
				? 'flex'
				: 'hidden'} flex-wrap gap-5 justify-center h-fit"
		>
			{#each canvas as canva}
				<CanvaPreview {canva} isOffline={!$isOnline}></CanvaPreview>
			{/each}
		</div>
	</div>
</div>

<style lang="postcss">
	:global(html),
	:global(body) {
		overflow: hidden;
	}
</style>
