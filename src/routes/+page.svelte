<script lang="ts">
	import { onMount } from 'svelte';
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

	const onclickNotification = () => {
		// openedModal.set('create');
	};

	const onCreateCanva = () => {
		openedModal.set('create');
	};

	const onClickLogin = () => {
		if (isConnected) {
			openedModal.set('settings');
		} else {
			openedModal.set('login');
		}
	};

	const networker = Networker.getInstance();
	const fetchData = async () => {
		// trigger function to fetch data in background
		networker.getSession();
		// load data
		const data = await networker.getCanvas();
		return data;
	};

	let isConnected: undefined | boolean = undefined;
	authStatus.subscribe((newStatus) => {
		isConnected = newStatus;
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

	onMount(async () => {
		const data = await fetchData();

		if (data) {
			canvas = data.data;
		}
	});
</script>

<Modal></Modal>
<div class="flex flex-col h-full">
	<Header class="top-0">
		<div class="border-b-2 border-black">
			<div class="container mx-auto flex justify-between items-stretch h-24">
				<a class="flex items-center" href="/">
					<img class="h-10" src="/svg/logo.svg" alt="place-it logo" />
				</a>
				<div class="flex gap-2 border-l-2 pl-32 border-black items-center">
					<Button stretch={false} type="button" on:click={onclickNotification}>Notifications</Button
					>
				</div>
			</div>
		</div>
		<div class="container mx-auto flex h-16 items-stretch">
			<div class="border-r-2 border-black flex gap-6 pr-32 uppercase items-center">
				<a href="/">Mes canvas</a>
				<a href="/">Communauté</a>
			</div>
			<div class="flex flex-row-reverse items-center grow">
				<button on:click={onClickLogin} class="flex items-center gap-2 uppercase">
					{#if isConnected}
						<div>Nom d'utilisateur</div>
					{:else if isConnected === false}
						<div>Login</div>
					{/if}
					<div class="rounded-full border-2 border-black w-8 h-8"></div>
				</button>
			</div>
		</div>
	</Header>
	<div class="overflow-y-scroll absolute bottom-0 top-[166px] w-full">
		<!-- search -->
		<div class="container mx-auto flex gap-8 py-8">
			<TextInput class="py-2 my-0" id="search" type="text" placeholder="Chercher">
				<div slot="startIcon">
					<img src="/svg/search.svg" alt="Search icon" />
				</div>
			</TextInput>

			<ToggleButton
				id="recent"
				label="Récents"
				classInactive="bg-fluorescent-cyan"
				classActive="bg-fluorescent-cyan-focus"
				><img src="/svg/alarm.svg" alt="recent icon" /></ToggleButton
			>
			<ToggleButton
				id="favorit"
				label="Favoris"
				classInactive="bg-tea-rose"
				classActive="bg-tea-rose-focus"
				><img src="/svg/heart.svg" alt="favorit icon" /></ToggleButton
			>
			<Select class="min-w-52" id="canvaType" placeholder="Tous" options={canvaTypeOptions}
			></Select>
			<div class="grow flex flex-row-reverse">
				<Button stretch={false} on:click={onCreateCanva}>
					<img src="/svg/plus.svg" alt="plus icon" />
					<span>Créer un nouveau canva</span>
				</Button>
			</div>
		</div>
		<!-- content -->
		<div class="h-full items-center justify-center {canvas.length == 0 ? 'flex' : 'hidden'}">
			<span class="uppercase">Vous n'avez pas encore de canva</span>
		</div>
		<div
			class="container mx-auto {canvas.length != 0
				? 'flex'
				: 'hidden'} flex-wrap gap-5 justify-between h-fit"
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
