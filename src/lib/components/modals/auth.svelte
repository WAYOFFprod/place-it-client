<script lang="ts">
	import Login from '$lib/components/auth/login.svelte';

	import Register from '../auth/register.svelte';
	import Button from '../form/button.svelte';

	interface Props {
		tab?: 'login' | 'register';
		close?: () => void;
	}

	let { tab = 'login', close }: Props = $props();

	const onClose = () => {
		close?.();
	};

	const switchTab = () => {
		tab = tab == 'login' ? 'register' : 'login';
	};
</script>

<div class="p-4 max-w-2xl min-w-96 bg-off-white flex flex-col items-center">
	{#if tab == 'login'}
		<Login close={onClose} />
		<Button
			type="button"
			stretch={false}
			click={switchTab}
			classColor="bg-fluorescent-cyan hover:bg-fluorescent-cyan-focus">Créer un compte</Button
		>
	{:else if tab == 'register'}
		<Register close={onClose} />
		<Button
			type="button"
			stretch={false}
			click={switchTab}
			classColor="bg-fluorescent-cyan hover:bg-fluorescent-cyan-focus">Se connecter</Button
		>
	{/if}
</div>
