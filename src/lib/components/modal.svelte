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
</script>

<dialog
	id="modal-container"
	on:click={close}
	role="none"
	bind:this={dialog}
	class="bg-transparent z-10 backdrop-blur-sm m-0 w-full h-screen overflow-scroll max-w-full max-h-full {isOpen
		? 'flex'
		: ''} justify-center items-center"
>
	<Panel class="w-fit {isWindowSmall ? 'h-full' : ''}" noShadow={isWindowSmall}>
		{#if openedDialog.name == 'create'}
			<Create on:close={modalClosed}></Create>
		{:else if openedDialog.name == 'login'}
			<Auth on:close={modalClosed}></Auth>
		{:else if openedDialog.name == 'settings'}
			<Settings on:close={modalClosed}></Settings>
		{:else if openedDialog.name == 'joinRequest'}
			<JoinCanva on:close={modalClosed} canvaId={openedDialog.data.id}></JoinCanva>
		{:else if openedDialog.name == 'modifyCanva'}
			<Modify
				on:close={modalClosed}
				canvaId={openedDialog.data.id}
				canvaName={openedDialog.data.name}
			></Modify>
		{:else if openedDialog.name == 'userAction'}
			<UserActions
				on:close={modalClosed}
				userId={openedDialog.data.id}
				userName={openedDialog.data.name}
			></UserActions>
		{/if}
	</Panel>
</dialog>
