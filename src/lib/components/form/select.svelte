<script lang="ts">
	import type { ChangeEventHandler, EventHandler } from 'svelte/elements';

	export let id: string;
	export let label: string = '';
	export let placeholder: string;
	export let options: options[];
	export let isOpen: boolean = false;
	export let disabled: boolean = false;
	export let selectedOption: string | null = null;
	export let error: string | null = null;

	const toggle = () => {
		isOpen = !isOpen;
	};

	const onChange = (event: Event) => {
		const target = event.target as HTMLSelectElement;
		selectedOption = target.value;
		isOpen = false;
		// selected = event.target.value;
	};

	$: title = selectedOption ? options.find((x) => x.value == selectedOption)?.label : placeholder;
</script>

<div class="relative h-11 {$$props.class} z-20">
	{#if label != ''}
		<span>{label}</span>
	{/if}
	<div
		class="absolute {label != ''
			? 'top-6'
			: 'top-0'} rounded w-full border-2 border-black overflow-hidden"
	>
		<button
			aria-label="toggle {label} list"
			on:click={toggle}
			aria-pressed={isOpen}
			type="button"
			{disabled}
			class="px-2 flex w-full items-center justify-between h-9"
		>
			<span>{title}</span>
			<img class="w-4" src="/svg/chevron-down.svg" alt="" />
		</button>
		<div class="flex flex-col {isOpen && !disabled ? '' : 'hidden'} relative">
			{#each options as option}
				<label for={option.value} class="relative px-2 py-1">
					<input
						{disabled}
						id={option.value}
						name={id}
						type="radio"
						class="peer hidden"
						on:change={onChange}
						value={option.value}
						checked={selectedOption == option.value}
					/>
					<span class="relative z-10 pointer-events-none">{option.label}</span>
					<div
						class="absolute inset-0 bg-white hover:bg-naples-yellow peer-checked:bg-fluorescent-cyan z-0"
					></div>
				</label>
			{/each}
		</div>
	</div>
	{#if error}
		<div class="mt-12 text-red-500 text-sm">{error}</div>
	{/if}
</div>
