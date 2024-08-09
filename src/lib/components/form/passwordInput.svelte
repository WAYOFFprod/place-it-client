<script lang="ts">
	export let placeholder: string = '';
	export let label: string = '';
	export let id: string;
	export let error: string | null = null;

	let passwordShow = false;
</script>

<div class={$$props.class}>
	{#if label}
		<label class="block mb-3" for={id}>{label}</label>
	{/if}
	<div class="relative flex gap-2 w-fit">
		<slot name="startIcon" />
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
			on:click={() => (passwordShow = !passwordShow)}
			aria-pressed={passwordShow}><img src="/svg/eye.svg" alt="" /></button
		>
	</div>
	{#if error}
		<span class="text-red-500 text-sm">{error}</span>
	{/if}
</div>
