<script lang="ts">
	import TextInput from '$lib/components/form/textInput.svelte';
	import Networker from '$lib/utility/Networker';

	import Button from '$lib/components/form/button.svelte';
	import type { Errors } from '../modals/types';
	import PasswordInput from '../form/passwordInput.svelte';

	let form: HTMLFormElement;

	let errors: null | Errors;

	interface Props {
		close?: () => void;
	}
	let { close }: Props = $props();

	const networker = Networker.getInstance();
	const validate = async (e: Event) => {
		console.log('validate');
		e.preventDefault();
		const formData = new FormData(form);
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const response: any = await networker.login({
			email: email,
			password: password
		});
		console.log(response);
		if (response?.status == 422) {
			errors = response.response.errors;
		} else if (response?.status) {
			close?.();
		}
	};

	const getError = (value: string) => {
		if (errors?.[value]) {
			return errors[value]?.[0];
		}
		return null;
	};
</script>

<div class="p-4 flex flex-col gap-4 items-center">
	<h2 class="text-xl uppercase">Se Connecter</h2>
	<form bind:this={form} onsubmit={validate} class="flex flex-col gap-4 items-center">
		<TextInput
			id="email"
			className="w-full"
			placeholder="Email"
			label="Email"
			type="email"
			error={getError('email')}
		/>
		<PasswordInput
			id="password"
			placeholder="Password"
			label="Password"
			error={getError('password')}
		/>
		<Button className="mt-4" type="submit" stretch={false} click={validate}>Login</Button>
	</form>
</div>
