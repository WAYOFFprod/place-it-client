<script lang="ts">
	import Panel from "../panel.svelte";

  export let toggleName: string;
</script>

<div>
  <Panel>
    <label>
      <input type="radio" name={toggleName} class="absolute opacity-0 h-0 w-0 peer" />
      <div class="w-64 h-64 flex justify-center items-center peer-checked:bg-red-200 hover:cursor-pointer">
        <slot></slot>
      </div>
    </label>
  </Panel>
</div>