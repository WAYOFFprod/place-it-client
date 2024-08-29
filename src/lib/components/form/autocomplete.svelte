<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { FormEventHandler } from 'svelte/elements';

	export let placeholder: string = '';
	export let label: string = '';
	export let id: string;
	export let error: string | null = null;
	export let val = '';
	export let options: Option[] = [];

	const dispatch = createEventDispatcher();

	let isFocus = false;
	let onCooldown = false;
	let changedSinceCooldown = false;
	let selectedOption: number | undefined;
	let filteredOptions: Option[] = [];
	const cooldown = () => {
		onCooldown = true;
		setTimeout(() => {
			onCooldown = false;
			if (changedSinceCooldown) {
				console.log('update', val);
				filteredOptions = options.filter((x) => x.value.toLowerCase().includes(val.toLowerCase()));
				cooldown();
				changedSinceCooldown = false;
			}
		}, 500);
	};
	const onChange: FormEventHandler<HTMLInputElement> = (event: any) => {
		if (event.target.value == '' || (event.target.value.length > 2 && !onCooldown)) {
			changedSinceCooldown = true;
			cooldown();
		}
	};

	const selectOption = (option: any) => {
		selectedOption = option;
		if (selectedOption != undefined) {
			const newValue = options.find((x) => x.key == option);
			if (newValue != undefined) {
				val = newValue.value;
			}
		}
		isFocus = false;
		dispatch('selectOption', option);
	};

	function clickOutside(element: HTMLElement, callbackFunction: () => void) {
		function onClick(event: any) {
			if (!element.contains(event.target)) {
				callbackFunction();
			}
		}

		document.body.addEventListener('click', onClick);

		return {
			update(newCallbackFunction: () => void) {
				callbackFunction = newCallbackFunction;
			},
			destroy() {
				document.body.removeEventListener('click', onClick);
			}
		};
	}
</script>

<div class={$$props.class}>
	{#if label}
		<label class="block mb-3" for={id}>{label}</label>
	{/if}
	<div
		class="relative w-full flex flex-col gap-2 rounded border-2 autofill:border-tea-rose bg-transparent {isFocus
			? 'border-fluorescent-cyan-focus'
			: 'border-black'} "
		use:clickOutside={() => {
			isFocus = false;
		}}
	>
		<slot name="startIcon" />
		<input
			{id}
			name={id}
			type="text"
			{placeholder}
			class="p-2 w-full pr-8 pb-1 min-w-5 bg-transparent"
			on:input={onChange}
			on:focus={() => (isFocus = true)}
			bind:value={val}
			role="combobox"
			aria-controls="listbox"
			aria-haspopup="listbox"
			aria-expanded={false}
		/>
		<div class="absolute w-5 right-0 bottom-2">
			<slot />
		</div>
		<!-- predictions -->
		{#if isFocus}
			<div id="listbox" class="flex flex-col">
				{#each filteredOptions as option}
					<button
						id={'option-' + option.key}
						type="button"
						class="m-2"
						on:click={() => selectOption(option.key)}
						role="option"
						aria-selected={false}
					>
						{option.value}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	{#if error}
		<span class="text-red-500 text-sm">{error}</span>
	{/if}
</div>
