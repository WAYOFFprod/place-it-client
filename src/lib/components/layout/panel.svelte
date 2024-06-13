<script lang="ts">
 export let isSmall: boolean = false
</script>
<div class="relative {$$props.class}">
  <div class="relative border-2 border-solid rounded border-black bg-white z-10 overflow-hidden">
    <slot/>
  </div>
  <div class="absolute inset-0 rounded bg-black z-0 {isSmall ? 'translate-x-0.5 translate-y-0.5': 'translate-x-1 translate-y-1'}"></div>
</div>