<script lang="ts">
	import Panel from "./layout/panel.svelte";
  import Create from '$lib/components/modals/create.svelte';
	import { openedModal } from "$lib/stores/modalStore";

  let dialog: HTMLDialogElement

  let openedDialog: string | undefined
  openedModal.subscribe((newModal) => {
    openedDialog = newModal
    if(dialog != undefined) {
      dialog.showModal()
    }
  })

  const modalClosed = () => {
    console.log("close")
    openedModal.set('');
    dialog.close()
  }
  const close = (e: Event) => {
    if (e.target == dialog) {
      console.log("close")
      openedModal.set('');
      dialog.close()
    }
  }
</script>

  <dialog id="modal-container" on:click={close} role="none" bind:this={dialog} class="bg-transparent z-40 backdrop-blur-sm m-0 w-full h-full max-w-full max-h-full">
    <Panel class="w-fit">
      {#if openedDialog == 'create'}
        <Create on:close={modalClosed}></Create>
      {/if}
    </Panel>
  </dialog>