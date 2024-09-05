<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Tooltip from '../form/tooltip.svelte';

	const dispatch = createEventDispatcher();

	export let toggleName: string;
	export let disabled = false;
	export let value: string;
	export let selectedValue: string;

	const selectValue = () => {
		dispatch('selectValue');
	};
</script>

<label class="relative w-full border-b-2 border-black self-stretch">
	<input
		class="absolute opacity-0 h-0 w-0 peer"
		type="radio"
		name={toggleName}
		checked={selectedValue == value}
		on:change={selectValue}
		{value}
		{disabled}
	/>
	<div
		class="bg-white peer-hover:bg-naples-yellow peer-checked:bg-fluorescent-cyan peer-disabled:text-gray-400 peer-disabled:cursor-not-allowed flex items-center justify-start gap-4 {$$props.class} grow"
	>
		<slot></slot>
		<div class="grow flex justify-end md:hidden">
			<img src="/svg/chevron-right.svg" alt="" class="w-4 h-4" />
		</div>
	</div>
	<Tooltip show={disabled} class="hidden peer-hover:flex">Comming soon</Tooltip>
</label>
