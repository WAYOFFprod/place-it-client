<script lang="ts">

export let placeholder: string = ""
export let label: string = ""
export let id: string
</script>
<div>
  {#if label}
    <label class="block" for={id}>{label}</label>
  {/if}
  <div class="relative flex gap-2">
    <input id={id} name={id} type="text" placeholder={placeholder} class="border-b-2 autofill:border-red-400 border-black bg-transparent focus:border-fluorescent-cyan-focus grow pr-8" />
    <div class="absolute right-0 w-5">
      <slot />
    </div>
  </div>
</div>