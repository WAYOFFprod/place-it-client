<script lang="ts">
	export let placeholder: string = '';
	export let label: string = '';
	export let id: string;
	export let type: string = 'text';
	export let error: string | null = null;
</script>

<div class={$$props.class}>
	{#if label}
		<label class="block mb-3" for={id}>{label}</label>
	{/if}
	<div class="relative w-full flex gap-2">
		<slot name="startIcon" />
		<input
			{id}
			name={id}
			{type}
			{placeholder}
			class="border-b-2 autofill:border-tea-rose border-black bg-transparent focus:border-fluorescent-cyan-focus w-full pr-8 pb-1 min-w-5"
		/>
		<div class="absolute w-5 right-0 bottom-2">
			<slot />
		</div>
	</div>
	{#if error}
		<span class="text-red-500 text-sm">{error}</span>
	{/if}
</div>
