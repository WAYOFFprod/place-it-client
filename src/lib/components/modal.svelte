<script lang="ts">
	import Panel from './layout/panel.svelte';
	import Create from '$lib/components/modals/create.svelte';
	import { openedModal } from '$lib/stores/modalStore';
	import Auth from '$lib/components/modals/auth.svelte';
	import Settings from '$lib/components/modals/settings.svelte';
	import JoinCanva from '$lib/components/modals/joinCanva.svelte';
	import { onDestroy } from 'svelte';
	import UserActions from '$lib/components/modals/userActions.svelte';
	import Modify from '$lib/components/modals/modify.svelte';

	let dialog: HTMLDialogElement;

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

	onDestroy(() => {
		unsubscribeModal();
	});
</script>

<dialog
	id="modal-container"
	on:click={close}
	role="none"
	bind:this={dialog}
	class="bg-transparent z-10 backdrop-blur-sm m-0 w-full h-full max-w-full max-h-full {isOpen
		? 'flex'
		: ''} justify-center items-center"
>
	<Panel class="w-fit">
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
