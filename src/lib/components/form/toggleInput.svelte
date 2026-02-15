<script lang="ts">
	import Background from '../svg/toggle/background.svelte';
	import Knob from '../svg/toggle/knob.svelte';

	interface Props {
		placeholder?: string;
		label: string;
		id: string;
		toggle?: boolean;
		disabled?: boolean;
		change?: (value: boolean) => void;
	}

	let {
		placeholder = '',
		label,
		id,
		toggle = false,
		disabled = false,
		change = () => {}
	}: Props = $props();

	const onChange = () => {
		change(toggle);
	};
</script>

<div class={disabled ? 'text-gray-400' : 'text-black'}>
	<input
		name={id}
		{id}
		type="checkbox"
		{placeholder}
		bind:checked={toggle}
		onchange={onChange}
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
