<script lang="ts">
	import TextInput from '$lib/components/form/textInput.svelte';
	import Networker from '$lib/utility/Networker';

	import { createEventDispatcher } from 'svelte';
	import { event } from '$lib/stores/eventStore';
	import Button from '$lib/components/form/button.svelte';

	const dispatch = createEventDispatcher();
	let form: HTMLFormElement;

	const validate = () => {
		const networker = Networker.getInstance();

		const formData = new FormData(form);
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		networker.login({
			email: email,
			password: password
		});

		dispatch('close');
	};
</script>

<form bind:this={form} on:submit|preventDefault={validate} class="flex flex-col gap-4 items-center">
	<TextInput id="email" placeholder="Email" label="Email" type="email" />
	<TextInput id="password" placeholder="Password" label="Password" type="password" />
	<Button type="submit" stretch={false} on:click={validate}>Login</Button>
</form>
