<script lang="ts">
	import Button from '$lib/components/form/button.svelte';
	import SelectSettings from '$lib/components/form/selectSettings.svelte';
	import TextSettings from '$lib/components/form/textSettings.svelte';
	import ToggleInput from '$lib/components/form/toggleInput.svelte';
	import { userStore } from '$lib/stores/authStore';
	import Networker from '$lib/utility/Networker';
	import { onDestroy } from 'svelte';
	interface Props {
		close?: () => void;
	}

	let { close }: Props = $props();

	let form: HTMLFormElement;

	let user: User | undefined = $state(undefined);

	let darkmode = $state(false);

	let nameValue: string = $state('');
	let nameEditable: boolean = $state(false);

	const networker: Networker = Networker.getInstance();

	const unsubscribeUser = userStore.subscribe((newUser) => {
		if (newUser == undefined) return;
		user = newUser;
		nameValue = user.name;
	});

	const onSaveField = (options: SettingOption) => {
		const formData = new FormData(form);
		const value = formData.get(options.field) as string;
		if (options.value != value) {
			networker.saveUserField({
				field: options.field,
				value: value
			});
		}
	};

	const makeEditable = () => {
		nameEditable = !nameEditable;
	};

	const saveName = () => {
		const formData = new FormData(form);
		const value = formData.get('name') as string;
		networker.saveUserField({
			field: 'name',
			value: value
		});
		nameEditable = false;
	};

	const logout = async () => {
		await networker.logout();
		userStore.set(undefined);
		close?.();
	};

	onDestroy(() => {
		unsubscribeUser();
	});
</script>

<form bind:this={form} class="px-8 md:px-20 py-6 w-full">
	<div class="w-40 flex flex-col items-center gap-2 mx-auto">
		<div class="rounded-full w-36 h-36 border-2 border-black"></div>
		<input
			id="name"
			name="name"
			type="text"
			placeholder="Name"
			disabled={!nameEditable}
			value={nameValue}
			class="border-b-2 autofill:border-tea-rose border-black bg-transparent focus:border-fluorescent-cyan-focus w-full pb-1 min-w-5 disabled:border-transparent"
		/>
		<Button id="edit-username" click={() => (nameEditable ? saveName() : makeEditable())}>
			{#snippet content()}
				Modifier
			{/snippet}
		</Button>
	</div>
	<div class="py-8 w-full">
		<div class="flex flex-col gap-4">
			<ToggleInput
				id="darkmode"
				label="Dark Mode"
				toggle={darkmode}
				change={() => (darkmode = !darkmode)}
				disabled={true}
			/>
			<TextSettings
				type="text"
				id="email"
				label="Email"
				value={user?.email}
				field="email"
				saveField={onSaveField}
				disabled={true}
			></TextSettings>
			<TextSettings
				type="password"
				id="mot de passe"
				label="password"
				value="thisismypassword"
				field="password"
				saveField={onSaveField}
				disabled={true}
			></TextSettings>
			<TextSettings
				type="text"
				id="discord_user"
				label="Compte Discord"
				value={user?.discord_user}
				field="discord_user"
				saveField={onSaveField}
			></TextSettings>
			<SelectSettings
				id="language"
				placeholder="Langue"
				field="language"
				value={user?.language}
				saveField={onSaveField}
			></SelectSettings>
			<div class="flex justify-center">
				<Button
					classColor="bg-bittersweet-red hover:bittersweet-red-focus"
					type="button"
					stretch={false}
					click={logout}
				>
					{#snippet content()}
						Logout
					{/snippet}
				</Button>
			</div>
		</div>
	</div>
</form>
