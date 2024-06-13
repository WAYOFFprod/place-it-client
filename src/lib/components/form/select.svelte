<script lang="ts">
	import type { ChangeEventHandler, EventHandler } from "svelte/elements";

  export let id: string;
  export let label: string = '';
  export let placeholder: string;
  export let options: options[];
  export let isOpen: boolean = false;

  let selectedOption: string | null = null;
  const toggle = () => {
    isOpen = !isOpen
  }

  const onChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    selectedOption = target.value
    // selected = event.target.value;
  }

  $: title = selectedOption ? options.find(x => x.value == selectedOption)?.label : placeholder;

</script>
<div>
  {#if label != ''}
    <span>{label}</span>
  {/if}
  <div class="rounded w-full border-2 border-black overflow-hidden">
    <button on:click={toggle} class="px-2 flex w-full items-center justify-between h-9">
      <span>{title}</span>
      <img class="w-4" src="icons/chevron-down.svg" alt="chevron-down" />
    </button>
    <div class="flex flex-col  {isOpen ? '' : 'hidden'}">
      {#each options as option}
      <label for={option.value} class="relative px-2 py-1">
        <input id={option.value} name={id} type="radio" class="peer hidden" on:change={onChange} value={option.value} />
        <span class="relative z-10 pointer-events-none">{option.label}</span>
        <div class="absolute inset-0 hover:bg-naples-yellow peer-checked:bg-fluorescent-cyan z-0" ></div>
      </label>
      {/each}
    </div>
  </div>
</div>