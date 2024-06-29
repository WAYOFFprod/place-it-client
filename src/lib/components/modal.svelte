<script lang="ts">
	import Panel from './layout/panel.svelte';
	import Create from '$lib/components/modals/create.svelte';
	import { openedModal } from '$lib/stores/modalStore';
	import Auth from '$lib/components/modals/auth.svelte';
	import Settings from './modals/settings.svelte';

	let dialog: HTMLDialogElement;

	let isOpen = false;
	let openedDialog: string | undefined;
	openedModal.subscribe((newModal) => {
		openedDialog = newModal;
		if (dialog != undefined) {
			dialog.showModal();
			isOpen = true;
		}
	});

	const modalClosed = () => {
		openedModal.set('');
		dialog.close();
		isOpen = false;
	};
	const close = (e: Event) => {
		if (e.target == dialog) {
			openedModal.set('');
			dialog.close();
			isOpen = false;
		}
	};
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
		{#if openedDialog == 'create'}
			<Create on:close={modalClosed}></Create>
		{:else if openedDialog == 'login'}
			<Auth on:close={modalClosed}></Auth>
		{:else if openedDialog == 'settings'}
			<Settings on:close={modalClosed}></Settings>
		{/if}
	</Panel>
</dialog>
