<script lang="ts">
let isOpen: boolean = false;

const toggleOpen = () => {
  isOpen = !isOpen
}
</script>
<div>
  <!-- heading -->
  <button on:click={toggleOpen} class="flex flex-row justify-between w-full">
    <slot name="heading"></slot> <img class={isOpen ? '' : '-rotate-90'} src="icons/chevron-down.svg" alt="chevron of accordeon" />
  </button>
  <!-- content -->
  <div class="pl-9 py-4 text-medium {isOpen ? 'hidden' : '' }">
    <slot name="content"></slot>
  </div>
</div>