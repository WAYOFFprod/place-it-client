<script lang="ts">
	import Login from '$lib/components/auth/login.svelte';

	import { createEventDispatcher } from 'svelte';
	import Register from '../auth/register.svelte';
	import Button from '../form/button.svelte';
	const dispatch = createEventDispatcher();

	export let tab: 'login' | 'register' = 'login';

	const close = () => {
		dispatch('close');
	};

	const switchTab = () => {
		tab = tab == 'login' ? 'register' : 'login';
	};
</script>

<div class="p-4 max-w-2xl min-w-96 bg-off-white flex flex-col items-center">
	{#if tab == 'login'}
		<Login on:close={close} />
		<Button
			type="button"
			stretch={false}
			on:click={switchTab}
			classColor="bg-fluorescent-cyan hover:bg-fluorescent-cyan-focus">Créer un compte</Button
		>
	{:else if tab == 'register'}
		<Register on:close={close} />
		<Button
			type="button"
			stretch={false}
			on:click={switchTab}
			classColor="bg-fluorescent-cyan hover:bg-fluorescent-cyan-focus">Se connecter</Button
		>
	{/if}
</div>
