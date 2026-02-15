<script lang="ts">
	import Tooltip from '../form/tooltip.svelte';

	interface Props {
		toggleName: string;
		disabled?: boolean;
		value: string;
		selectedValue: string;
		className?: string;
		selectValue?: () => void;
		content?: import('svelte').Snippet;
	}

	let {
		toggleName,
		disabled = false,
		value,
		selectedValue,
		className = '',
		selectValue,
		content
	}: Props = $props();

	const onSelectValue = () => {
		selectValue?.();
	};
</script>

<label class="relative w-full border-b-2 border-black self-stretch">
	<input
		class="absolute opacity-0 h-0 w-0 peer"
		type="radio"
		name={toggleName}
		checked={selectedValue == value}
		onchange={onSelectValue}
		{value}
		{disabled}
	/>
	<div
		class="bg-white peer-hover:bg-naples-yellow peer-checked:bg-fluorescent-cyan peer-disabled:text-gray-400 peer-disabled:cursor-not-allowed flex items-center justify-start gap-4 {className} grow"
	>
		{#if content}{@render content()}{/if}
		<div class="grow flex justify-end md:hidden">
			<img src="/svg/chevron-right.svg" alt="" class="w-4 h-4" />
		</div>
	</div>
	<Tooltip show={disabled} className="hidden peer-hover:flex">Comming soon</Tooltip>
</label>
