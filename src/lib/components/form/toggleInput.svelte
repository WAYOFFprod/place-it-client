<script lang="ts">
	import Background from "../svg/toggle/background.svelte";
	import Knob from "../svg/toggle/knob.svelte";

  export let placeholder: string = ""
  export let label: string
  export let id: string

  let toggle = false;
</script>
<div>
  <input name={id} id={id} type="checkbox" placeholder={placeholder} bind:checked={toggle}  />
  <label class="flex justify-between items-center group cursor-pointer" for={id}>
    <span>{label}</span>
    <div class="relative">
      <Background class={toggle ? 'text-fluorescent-cyan' : 'text-black'} ></Background>
      <Knob class="absolute top-0 {toggle ? 'right-0' : 'left-0'}"></Knob>
    </div>
  </label>
</div>
