<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Background from '../svg/toggle/background.svelte';
	import Knob from '../svg/toggle/knob.svelte';

	const dispatch = createEventDispatcher();
	export let placeholder: string = '';
	export let label: string;
	export let id: string;
	export let toggle = false;
	export let disabled = false;

	const change = () => {
		dispatch('change');
	};
</script>

<div class={disabled ? 'text-gray-400' : 'text-black'}>
	<input
		name={id}
		{id}
		type="checkbox"
		{placeholder}
		bind:checked={toggle}
		on:change={change}
		{disabled}
	/>
	<label
		class="flex justify-between items-center group {disabled
			? 'cursor-not-allowed'
			: 'cursor-pointer'}"
		for={id}
	>
		<span>{label}</span>
		<div class="relative">
			<Background class={toggle ? 'text-fluorescent-cyan' : 'text-black'}></Background>
			<Knob class="absolute top-0 {toggle ? 'right-0' : 'left-0'}"></Knob>
		</div>
	</label>
</div>
