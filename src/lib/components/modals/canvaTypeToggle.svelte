<script lang="ts">
	import Panel from '../layout/panel.svelte';

	interface Props {
		toggleName: string;
		disabled?: boolean;
		value: string;
		selectedValue: string;
		selectValue?: () => void;
	}

	let { toggleName, disabled = false, value, selectedValue, selectValue }: Props = $props();

	const selectVal = () => {
		selectValue?.();
	};
</script>

<div>
	<Panel className="w-full">
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
				<slot></slot>
			</div>
		</label>
	</Panel>
</div>
