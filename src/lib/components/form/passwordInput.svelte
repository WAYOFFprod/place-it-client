<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		placeholder?: string;
		label?: string;
		id: string;
		error?: string | null;
		className?: string;
		startIcon?: Snippet;
	}

	let {
		placeholder = '',
		label = '',
		id,
		error = null,
		className = '',
		startIcon
	}: Props = $props();

	let passwordShow = $state(false);
</script>

<div class={className}>
	{#if label}
		<label class="block mb-3" for={id}>{label}</label>
	{/if}
	<div class="relative flex gap-2 w-fit">
		{#if startIcon}{@render startIcon()}{/if}
		<input
			{id}
			name={id}
			type={passwordShow ? 'text' : 'password'}
			{placeholder}
			class="border-b-2 autofill:border-tea-rose border-black bg-transparent focus:border-fluorescent-cyan-focus pr-8 pb-1"
		/>
		<button
			aria-label="Toggle {label} visibility"
			type="button"
			onclick={() => (passwordShow = !passwordShow)}
			aria-pressed={passwordShow}><img src="/svg/eye.svg" alt="" /></button
		>
	</div>
	{#if error}
		<span class="text-red-500 text-sm">{error}</span>
	{/if}
</div>
