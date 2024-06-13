<script lang="ts">
	import Panel from "../layout/panel.svelte";

  export let toggleName: string;
</script>

<div>
  <Panel class="w-fit">
    <label>
      <input type="radio" name={toggleName} class="absolute opacity-0 h-0 w-0 peer" />
      <div class="w-64 h-64 flex justify-center items-center peer-hover:bg-naples-yellow peer-checked:bg-fluorescent-cyan hover:cursor-pointer">
        <slot></slot>
      </div>
    </label>
  </Panel>
</div>