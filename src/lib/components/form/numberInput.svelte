<script lang="ts">
	import ChevronDown from '$lib/icons/chevronDown.svelte';

	export let step: number = 1;
	export let label: string = '';
	export let placeholder: string = '';
	export let id: string;
	export let error: string | null = null;

	export let inputValue = 100;

	export const click = (change: number) => {
		inputValue += change;
	};
</script>

<div class="flex gap-2 items-center h-7">
	{#if label}
		<label for={id}>{label}</label>
	{/if}
	<div class="relative h-7 flex">
		<input
			{id}
			name={id}
			type="number"
			{step}
			{placeholder}
			class="text-medium w-16 h-7 rounded-r border-2 border-l-0 border-black focus:border-fluorescent-cyan-focus ml-4 pl-2 peer"
			bind:value={inputValue}
		/>
		<div
			class="absolute top-0 bottom-0 left-0 w-4 flex flex-col border-2 border-black hover:border-fluorescent-cyan-focus peer-focus:border-r-fluorescent-cyan-focus items-center rounded-l overflow-hidden"
		>
			<button
				on:click={() => click(step)}
				type="button"
				class="h-1/2 flex justify-center items-center bg-white text-black hover:text-fluorescent-cyan-focus"
				><ChevronDown classes="w-4 rotate-180" /></button
			>
			<button
				on:click={() => click(-step)}
				type="button"
				class="h-1/2 flex justify-center items-center bg-white text-black hover:text-fluorescent-cyan-focus"
				><ChevronDown classes="w-4 " /></button
			>
		</div>
	</div>
	{#if error}
		<span class="text-red-500 text-sm">{error}</span>
	{/if}
</div>
