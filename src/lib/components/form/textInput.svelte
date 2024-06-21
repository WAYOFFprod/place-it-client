<script lang="ts">
	export let placeholder: string = '';
	export let label: string = '';
	export let id: string;
	export let type: string = 'text';
</script>

<div>
	{#if label}
		<label class="block mb-3" for={id}>{label}</label>
	{/if}
	<div class="relative w-full">
		<input
			{id}
			name={id}
			{type}
			{placeholder}
			class="border-b-2 autofill:border-red-400 border-black bg-transparent focus:border-fluorescent-cyan-focus w-full pr-8 min-w-5"
		/>
		<div class="absolute w-5 right-0 bottom-2">
			<slot />
		</div>
	</div>
</div>
