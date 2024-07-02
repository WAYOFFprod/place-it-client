<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Background from '../svg/toggle/background.svelte';
	import Knob from '../svg/toggle/knob.svelte';
	import Panel from '../layout/panel.svelte';

	const dispatch = createEventDispatcher();
	export let placeholder: string = '';
	export let label: string;
	export let id: string;
	export let toggle = false;
	export let disabled = false;

	export let classInactive: string = '';
	export let classActive: string = '';

	let hovered: boolean = false;
	const mouseEnter = () => {
		hovered = true;
	};

	const mouseLeave = () => {
		hovered = false;
	};

	const focus = () => {};

	const change = () => {
		dispatch('change');
	};

	$: isHovering = hovered;
</script>

<div role="presentation" on:focus={focus} on:mouseover={mouseEnter} on:mouseleave={mouseLeave}>
	<Panel isSmall={isHovering || toggle}>
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
			class=" py-2 px-2 flex justify-between gap-2 items-center group
			{$$props.class}
      {toggle ? classActive : classInactive}
      {disabled ? 'cursor-not-allowed' : 'cursor-pointer'}"
			for={id}
		>
			<slot></slot>
			<span>{label}</span>
		</label>
	</Panel>
</div>
