<script lang="ts">
	export let isSmall: boolean = false;
	export let container: string = 'bg-off-white';
</script>

<div class="relative {$$props.class}">
	<div class="relative border-2 border-solid rounded border-black z-10 overflow-hidden {container}">
		<slot />
	</div>
	<div
		class="absolute inset-0 rounded bg-black z-0 {isSmall
			? 'translate-x-0.5 translate-y-0.5'
			: 'translate-x-1 translate-y-1'}"
	></div>
</div>
