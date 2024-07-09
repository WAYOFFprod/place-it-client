<script lang="ts">
	import TextInput from '$lib/components/form/textInput.svelte';
	import Networker from '$lib/utility/Networker';

	import { createEventDispatcher } from 'svelte';
	import { event } from '$lib/stores/eventStore';
	import Button from '$lib/components/form/button.svelte';

	const dispatch = createEventDispatcher();
	let form: HTMLFormElement;

	let errors: null | Errors;

	const networker = Networker.getInstance();
	const validate = async () => {
		const formData = new FormData(form);
		const email = formData.get('email') as string;
		const name = formData.get('name') as string;
		const password = formData.get('password') as string;
		const passwordConfirmation = formData.get('password_confirmation') as string;

		const response = await networker.register({
			name: name,
			email: email,
			password: password,
			password_confirmation: passwordConfirmation
		});

		if (response?.status == 422) {
			errors = response.response.errors;
		} else if (response?.status) {
			dispatch('close');
		}
	};

	$: getError = (value: string) => {
		if (errors?.[value]) {
			return errors[value]?.[0];
		}
		return null;
	};
</script>

<div class="p-4 flex flex-col gap-4 items-center">
	<h2 class="text-xl uppercase">Créer un compte</h2>
	<form
		bind:this={form}
		on:submit|preventDefault={validate}
		class="flex flex-col gap-4 items-center"
	>
		<TextInput
			id="name"
			placeholder="Username"
			label="Username"
			type="text"
			error={getError('name')}
		/>
		<TextInput
			id="email"
			placeholder="Email"
			label="Email"
			type="email"
			error={getError('email')}
		/>
		<TextInput
			id="password"
			placeholder="Password"
			label="Password"
			type="password"
			error={getError('password')}
		/>
		<TextInput
			id="password_confirmation"
			placeholder="Password"
			label="Password"
			type="password"
			error={getError('password_confirmation')}
		/>
		<Button type="submit" stretch={false} on:click={validate}>S'enregister</Button>
	</form>
</div>
