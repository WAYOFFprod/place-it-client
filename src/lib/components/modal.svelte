<script lang="ts">
	import Panel from "./panel.svelte";


</script>

  <dialog open class="bg-transparent z-40 backdrop-blur-sm w-full h-full">
    <div id="modal-container" class="w-fit mx-auto">
      <Panel>
        <slot />
      </Panel>
    </div>
  </dialog>