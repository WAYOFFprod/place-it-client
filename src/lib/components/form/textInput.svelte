<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { FormEventHandler } from 'svelte/elements';

	export let placeholder: string = '';
	export let label: string = '';
	export let type: string = 'text';
	export let id: string;
	export let error: string | null = null;
	export let liveUpdate: boolean = false;
	export let val = '';

	const dispatch = createEventDispatcher<updateSearchEvent>();

	let onCooldown = false;
	let changedSinceCooldown = false;
	const cooldown = () => {
		onCooldown = true;
		setTimeout(() => {
			onCooldown = false;
			if (changedSinceCooldown) {
				dispatch('onChange', val);
				cooldown();
				changedSinceCooldown = false;
			}
		}, 1000);
	};
	const onChange = (event: FormEventHandler<HTMLInputElement>) => {
		if (event.target.value == '' || (event.target.value.length > 2 && !onCooldown)) {
			changedSinceCooldown = true;
			cooldown();
		} else {
		}
	};
</script>

<div class={$$props.class}>
	{#if label}
		<label class="block mb-3" for={id}>{label}</label>
	{/if}
	<div class="relative w-full flex gap-2">
		<slot name="startIcon" />
		{#if liveUpdate}
			<input
				{id}
				name={id}
				type="text"
				{placeholder}
				class="border-b-2 autofill:border-tea-rose border-black bg-transparent focus:border-fluorescent-cyan-focus w-full pr-8 pb-1 min-w-5"
				on:input={onChange}
				bind:value={val}
			/>
		{:else}
			<input
				{id}
				name={id}
				{type}
				{placeholder}
				class="border-b-2 autofill:border-tea-rose border-black bg-transparent focus:border-fluorescent-cyan-focus w-full pr-8 pb-1 min-w-5"
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
