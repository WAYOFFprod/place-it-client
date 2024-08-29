<script lang="ts">
	import { userStore } from '$lib/stores/authStore';
	import { onDestroy, onMount } from 'svelte';
	import Button from '$lib/components/form/button.svelte';
	import Select from '$lib/components/form/select.svelte';
	import TextInput from '$lib/components/form/textInput.svelte';
	import ToggleButton from '$lib/components/form/toggleButton.svelte';
	import Header from '$lib/components/header.svelte';
	import Modal from '$lib/components/modal.svelte';
	import { openedModal } from '$lib/stores/modalStore';
	import Networker from '$lib/utility/Networker';
	import CanvaPreview from '$lib/components/canvaPreview.svelte';
	import { authStatus } from '$lib/stores/authStore';
	import { event } from '$lib/stores/eventStore';
	import { pushState } from '$app/navigation';
	import { page } from '$app/stores';

	let canvasScope: 'community' | 'personal' = 'personal';
	let tab: 'my-canvas' | 'community-canvas' = 'my-canvas';

	let searchTerm: string = '';
	let sort: undefined | 'asc' | 'desc';
	let favoritFilter: undefined | 1;
	let userName: string | undefined;
	let windowSize: Size2D = {
		width: 0,
		height: 0
	};
	let timer: ReturnType<typeof setTimeout>;
	let headerHeight = 166;
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

	const searchUpdated = async (event: CustomEvent<string>) => {
		searchTerm = event.detail;
		const data = await networker.getCanvas(canvasScope, sort, favoritFilter, searchTerm);
		canvas = data.data;
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

	const fetchCanvas = async () => {
		const data = await networker.getCanvas(canvasScope, sort, favoritFilter, searchTerm);
		canvas = data.data;
	};

	const networker = Networker.getInstance();
	const fetchData = async () => {
		// trigger function to fetch data in background
		networker.getSession();
	};

	const updateCanvas = async () => {
		const data = await networker.getCanvas(canvasScope, sort, favoritFilter, searchTerm);
		canvas = data.data;
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
			value: 'creative'
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
<div class="flex flex-col h-full">
	<Header class="top-0">
		<div class="border-b-2 border-black">
			<div class="container mx-auto flex justify-between items-stretch h-24">
				<a class="flex items-center p-4" href="/">
					<img class="h-10" src="/svg/logo.svg" alt="place-it logo" />
				</a>
				<div class="flex gap-2 border-l-2 pl-32 border-black items-center p-4">
					<Button stretch={false} type="button" on:click={onclickNotification}>Notifications</Button
					>
				</div>
			</div>
		</div>
		<div class="container mx-auto flex h-16 items-stretch px-4">
			<div class="border-r-2 border-black flex gap-6 pr-32 items-center">
				<button
					on:click={openMyCanvas}
					class="border-b-2 {tab == 'my-canvas' ? 'border-black' : 'border-transparent'}"
					><span class="uppercase">Mes canvas</span></button
				>
				<button
					on:click={openCommunityCanvas}
					class="border-b-2 {tab == 'community-canvas' ? 'border-black' : 'border-transparent'}"
					><span class="uppercase">Communauté</span></button
				>
			</div>
			<div class="flex flex-row-reverse items-center grow">
				<button
					id="button-profile"
					on:click={onClickLogin}
					class="flex items-center gap-2 uppercase"
				>
					{#if isConnected}
						<div>{userName}</div>
					{:else if isConnected === false}
						<div>Login</div>
					{/if}
					<div class="rounded-full border-2 border-black w-8 h-8"></div>
				</button>
			</div>
		</div>
	</Header>
	<div
		class="overflow-y-scroll w-full"
		style="top: {containerTop}px; height: calc(100vh - {containerTop}px);"
	>
		<div class="container mx-auto flex flex-col md:flex-row flex-wrap gap-8 py-8 px-8">
			<!-- search -->
			<TextInput
				on:onChange={searchUpdated}
				class="py-2 my-0"
				id="search"
				type="text"
				placeholder="Chercher"
				value={searchTerm}
				liveUpdate={true}
			>
				<div slot="startIcon">
					<img src="/svg/search.svg" alt="" />
				</div>
			</TextInput>
			<div class="flex gap-8 justify-center">
				<ToggleButton
					id="recent"
					label="Récents"
					class="hover:bg-fluorescent-cyan"
					classInactive="bg-white"
					classActive="!bg-fluorescent-cyan-focus"
					toggle={recentToggle}
					on:change={toggleRecent}><img src="/svg/alarm.svg" alt="" /></ToggleButton
				>
				<ToggleButton
					id="favorit"
					label="Favoris"
					class="hover:bg-tea-rose"
					classInactive="bg-white"
					classActive="!bg-tea-rose-focus"
					toggle={favoritToggle}
					disabled={!isConnected}
					on:change={toggleFavorit}><img src="/svg/heart.svg" alt="" /></ToggleButton
				>
			</div>
			<Select class="min-w-52" id="canvaType" placeholder="Tous" options={canvaTypeOptions}
			></Select>
			<div class="grow flex justify-center md:justify-end">
				{#if isConnected}
					<Button stretch={false} on:click={onCreateCanva}>
						<img src="/svg/plus.svg" alt="" />
						<span class="inline lg:hidden xl:inline">Créer un nouveau canva</span>
					</Button>
				{/if}
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
				<CanvaPreview {canva}></CanvaPreview>
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
