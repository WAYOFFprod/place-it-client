<script lang="ts">
	interface Props {
		id: string;
		label?: string;
		placeholder: string;
		options: options[];
		isInitiallyOpen?: boolean;
		disabled?: boolean;
		selectedOption?: string | null;
		className?: string;
		error?: string | null;
	}

	let {
		id,
		label = '',
		placeholder,
		options = [],
		isInitiallyOpen = false,
		disabled = false,
		selectedOption = $bindable(null),
		className = '',
		error = null
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	let isOpen = $state(isInitiallyOpen);

	const toggle = () => {
		isOpen = !isOpen;
		console.log(isOpen);
	};

	const selectOption = (value: string) => {
		selectedOption = value;
		isOpen = false;
	};

	const title = $derived(
		selectedOption ? options.find((x) => x.value == selectedOption)?.label : placeholder
	);
</script>

<div class="relative h-11 {className} z-20">
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
			onclick={toggle}
			aria-pressed={isOpen}
			type="button"
			{disabled}
			class="px-2 flex w-full items-center justify-between h-9"
		>
			<span>{title}</span>
			<img class="w-4" src="/svg/chevron-down.svg" alt="" />
		</button>
		{#if isOpen && !disabled}
			<div class="flex flex-col relative">
				{#each options as option}
					<label for={option.value} class="relative px-2 py-1">
						<input
							{disabled}
							id={option.value}
							name={id}
							type="radio"
							class="peer hidden"
							value={option.value}
							onclick={() => selectOption(option.value)}
							checked={selectedOption == option.value}
						/>
						<span class="relative z-10 pointer-events-none">{option.label}</span>
						<div
							class="absolute inset-0 bg-white hover:bg-naples-yellow peer-checked:bg-fluorescent-cyan z-0"
						></div>
					</label>
				{/each}
			</div>
		{/if}
	</div>
	{#if error}
		<div class="mt-12 text-red-500 text-sm">{error}</div>
	{/if}
</div>
