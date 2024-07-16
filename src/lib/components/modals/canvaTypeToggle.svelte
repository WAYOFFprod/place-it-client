<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Panel from '../layout/panel.svelte';

	const dispatch = createEventDispatcher();

	export let toggleName: string;
	export let disabled = false;
	export let value: string;
	export let selectedValue: string;

	const selectValue = () => {
		dispatch('selectValue');
	};
</script>

<div>
	<Panel class="w-fit">
		<label>
			<input
				type="radio"
				name={toggleName}
				class="absolute opacity-0 h-0 w-0 peer"
				{disabled}
				{value}
				checked={selectedValue == value}
				on:change={selectValue}
			/>
			<div
				class="w-64 h-64 flex flex-col gap-2 justify-center items-center peer-hover:bg-naples-yellow peer-checked:bg-fluorescent-cyan hover:cursor-pointer peer-disabled:bg-dark-grey"
			>
				<slot></slot>
			</div>
		</label>
	</Panel>
</div>
