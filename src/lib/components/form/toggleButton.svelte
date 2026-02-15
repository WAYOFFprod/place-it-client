<script lang="ts">
	import type { Snippet } from 'svelte';
	import Panel from '../layout/panel.svelte';

	interface Props {
		placeholder?: string;
		label?: string;
		id: string;
		toggle: boolean;
		disabled?: boolean;
		className?: string;
		classInactive?: string;
		classActive?: string;
		change?: (value: boolean) => void;
		content?: Snippet;
	}

	let {
		placeholder = '',
		label = undefined,
		id,
		toggle = false,
		disabled = false,
		className = '',
		classInactive = '',
		classActive = '',
		change = () => {},
		content: subContent
	}: Props = $props();

	let hovered: boolean = false;
	const mouseEnter = () => {
		hovered = true;
	};

	const mouseLeave = () => {
		hovered = false;
	};

	const focus = () => {};

	const onChange = () => {
		change(toggle);
	};

	const isHovering = $derived(hovered);
</script>

<div role="presentation" onfocus={focus} onmouseover={mouseEnter} onmouseleave={mouseLeave}>
	<Panel isSmall={disabled || isHovering || toggle}>
		{#snippet content()}
			<input
				class="peer"
				name={id}
				{id}
				type="checkbox"
				{placeholder}
				bind:checked={toggle}
				onchange={onChange}
				{disabled}
			/>
			<label
				class="py-2 px-2 flex justify-between gap-2 items-center peer-disabled:bg-dark-grey
			{className}
      {toggle ? classActive : classInactive}
      {disabled ? 'cursor-not-allowed' : 'cursor-pointer'}"
				for={id}
			>
				{#if subContent}
					{@render subContent()}
				{/if}
				{#if label}
					<span class="hidden md:inline">{label}</span>
				{/if}
			</label>
		{/snippet}
	</Panel>
</div>
