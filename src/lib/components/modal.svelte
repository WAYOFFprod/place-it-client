<script lang="ts">
	import Panel from './layout/panel.svelte';
	import Create from '$lib/components/modals/create.svelte';
	import { openedModal } from '$lib/stores/modalStore';
	import Auth from '$lib/components/modals/auth.svelte';
	import Settings from '$lib/components/modals/settings.svelte';
	import JoinCanva from '$lib/components/modals/joinCanva.svelte';
	import { onDestroy, onMount } from 'svelte';
	import UserActions from '$lib/components/modals/userActions.svelte';
	import Modify from '$lib/components/modals/modify.svelte';
	import { mdBreak } from '$lib/stores/tailwindStore';

	let dialog: HTMLDialogElement;

	let isWindowSmall: boolean | undefined = false;
	let md: number | undefined;

	mdBreak.subscribe((val) => {
		md = val;
		// initial size
		isWindowSmall = window.innerWidth >= md ? false : true;
	});

	let isOpen = false;
	let openedDialog: ModalData;
	const unsubscribeModal = openedModal.subscribe((newModal: ModalData) => {
		openedDialog = newModal;
		if (dialog != undefined) {
			dialog.showModal();
			isOpen = true;
		}
	});

	const modalClosed = () => {
		openedModal.set({ name: '' });
		dialog.close();
		isOpen = false;
	};
	const close = (e: Event) => {
		if (e.target == dialog) {
			openedModal.set({ name: '' });
			dialog.close();
			isOpen = false;
		}
	};

	const onResize = () => {
		if (md) isWindowSmall = window.innerWidth >= md ? false : true;
	};

	onMount(() => {
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
		};
	});

	onDestroy(() => {
		unsubscribeModal();
	});

	$: label = () => {
		let val: undefined | string;
		switch (openedDialog.name) {
			case 'create':
				val = 'Créer un nouveau canva';
				break;
			case 'modifyCanva':
				val = 'MODIFIER LE CANVA';
				break;
			case 'settings':
				val = 'Règlages';
				break;
			case 'login':
				val = 'Connexion';
				break;
			default:
				val = undefined;
				break;
		}
		return val;
	};
</script>

<dialog
	id="modal-container"
	onclick={close}
	bind:this={dialog}
	class="bg-transparent z-10 backdrop-blur-sm m-0 w-full h-screen min-w-full min-h-full {isOpen
		? 'flex'
		: ''} justify-center items-center"
>
	<Panel
		className="w-fit {isWindowSmall ? 'h-full min-h-full w-full' : ''}"
		noShadow={isWindowSmall}
		container="bg-off-white h-full md:h-auto"
	>
		<!-- Header -->
		{#if label() != undefined}
			<div
				class="relative h-14 mr-32 w-full border-b-2 border-black uppercase flex justify-center items-center"
			>
				<span>{label()}</span>
				<button aria-label="close" class="absolute right-4 top-4" onclick={() => modalClosed()}>
					<img src="/svg/close.svg" alt="" />
				</button>
			</div>
		{/if}
		<!-- Body -->
		<div class="overflow-scroll" style={isWindowSmall ? 'height: calc(100vh - 56px);' : ''}>
			{#if openedDialog.name == 'create'}
				<Create close={modalClosed}></Create>
			{:else if openedDialog.name == 'login'}
				<Auth close={modalClosed}></Auth>
			{:else if openedDialog.name == 'settings'}
				<Settings close={modalClosed}></Settings>
			{:else if openedDialog.name == 'joinRequest'}
				<JoinCanva close={modalClosed} canvaId={openedDialog.data.id}></JoinCanva>
			{:else if openedDialog.name == 'modifyCanva'}
				<Modify
					close={modalClosed}
					canvaId={openedDialog.data.id}
					canvaName={openedDialog.data.name}
				></Modify>
			{:else if openedDialog.name == 'userAction'}
				<UserActions
					close={modalClosed}
					userId={openedDialog.data.id}
					userName={openedDialog.data.name}
				></UserActions>
			{/if}
		</div>
	</Panel>
</dialog>
