<script lang="ts">
	import type { Snippet } from 'svelte';
	import Panel from '../layout/panel.svelte';

	interface Props {
		toggleName: string;
		disabled?: boolean;
		value: string;
		selectedValue: string;
		selectValue?: () => void;
		content?: Snippet;
	}

	let {
		toggleName,
		disabled = false,
		value,
		selectedValue,
		selectValue,
		content: subContent
	}: Props = $props();

	const selectVal = () => {
		selectValue?.();
	};
</script>

<div>
	<Panel className="w-full">
		{#snippet content()}
			<label>
				<input
					type="radio"
					name={toggleName}
					class="absolute opacity-0 h-0 w-0 peer"
					{disabled}
					{value}
					checked={selectedValue == value}
					onchange={selectVal}
				/>
				<div
					class="w-full h-40 md:w-64 md:h-64 flex flex-col gap-2 justify-center items-center peer-hover:bg-naples-yellow peer-checked:bg-fluorescent-cyan hover:cursor-pointer peer-disabled:bg-dark-grey"
				>
					{#if subContent}
						{@render subContent()}
					{/if}
				</div>
			</label>
		{/snippet}
	</Panel>
</div>
