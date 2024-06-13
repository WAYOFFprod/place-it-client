<script lang="ts">
	import type { MouseEventHandler } from "svelte/elements";
  import Panel from "../layout/panel.svelte";
	import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  
  export let type: 'button' | 'reset' | 'submit' = "button";
  export let stretch: boolean = true;

  let hovered: boolean = false
  const mouseEnter = () => {
    hovered = true;
  }

  const mouseLeave = () => {
    hovered = false;
  }

  const focus = () => {

  }

  const click = (e: any) => {
    e.preventDefault()
    dispatch('click')
  }

  $: isHovering = hovered
</script>
<div class="{stretch ? 'w-full' : ''} {$$props.class}" role="presentation" on:focus={focus} on:mouseover={mouseEnter} on:mouseleave={mouseLeave}>
  <Panel isSmall={isHovering} class={stretch ? 'w-full' : ''}>
      <button on:click|preventDefault={click} type={type} class="px-4 flex justify-center items-center gap-4 button yellow {stretch ? 'w-full' : ''}">
        <slot></slot>
      </button>
    </Panel>
  </div>