<script lang="ts">
	import { mdBreak } from '$lib/stores/tailwindStore';
	import { onMount } from 'svelte';

	interface Props {
		placeholder?: string;
		label?: string;
		type?: string;
		id: string;
		error?: string | null;
		liveUpdate?: boolean;
		val?: string;
		className?: string;
		onChange?: (value: string) => void;
	}

	let {
		placeholder = '',
		label = '',
		type = 'text',
		id,
		error = null,
		liveUpdate = false,
		val = '',
		className = '',
		onChange = () => {}
	}: Props = $props();

	let inputSize: number | undefined = $state(10);
	let md: number | undefined;

	mdBreak.subscribe((val) => {
		md = val;
		// initial size
		inputSize = window.innerWidth >= md ? 20 : 10;
	});

	let onCooldown = false;
	let changedSinceCooldown = false;
	const cooldown = () => {
		onCooldown = true;
		setTimeout(() => {
			onCooldown = false;
			if (changedSinceCooldown) {
				onChange(val);
				cooldown();
				changedSinceCooldown = false;
			}
		}, 1000);
	};
	const change = (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (target.value == '' || (target.value.length > 2 && !onCooldown)) {
			changedSinceCooldown = true;
			cooldown();
		} else {
		}
	};

	const onResize = () => {
		if (md) inputSize = window.innerWidth >= md ? 20 : 10;
	};

	onMount(() => {
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
		};
	});
</script>

<div class={className}>
	{#if label}
		<label class="block mb-3" for={id}>{label}</label>
	{/if}
	<div class="relative w-full flex gap-2">
		<slot name="startIcon" />
		{#if liveUpdate}
			<input
				{id}
				size={inputSize}
				name={id}
				type="text"
				{placeholder}
				class="border-b-2 autofill:border-tea-rose border-black bg-transparent focus:border-fluorescent-cyan-focus w-full pb-1 {$$slots.default
					? 'pr-8'
					: ''}"
				oninput={change}
				bind:value={val}
			/>
		{:else}
			<input
				{id}
				size={inputSize}
				name={id}
				{type}
				{placeholder}
				class="border-b-2 autofill:border-tea-rose border-black bg-transparent focus:border-fluorescent-cyan-focus w-full pb-1 {$$slots.default
					? 'pr-8'
					: ''}"
			/>
		{/if}
		<div class="absolute w-5 right-0 bottom-2">
			<slot />
		</div>
	</div>
	{#if error}
		<span class="text-red-500 text-sm">{error}</span>
	{/if}
</div>
