<script lang="ts">
	import { userStore } from '$lib/stores/authStore';
	import Networker from '$lib/utility/Networker';
	import Button from '../form/button.svelte';
	import SelectSettings from '../form/selectSettings.svelte';
	import TextSettings from '../form/textSettings.svelte';
	import ToggleInput from '../form/toggleInput.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let darkmode = false;
	let form: HTMLFormElement;

	let user: User;

	let nameInput: HTMLInputElement;
	let nameValue: string = '';
	let nameEditable: boolean = false;

	userStore.subscribe((newUser) => {
		user = newUser;
		nameValue = user.name;
	});

	const networker: Networker = Networker.getInstance();
	const onSaveField = (event: CustomEvent<SettingOption>) => {
		const formData = new FormData(form);
		const value = formData.get(event.detail.field) as string;
		if (event.detail.value != value) {
			networker.saveField({
				field: event.detail.field,
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
		networker.saveField({
			field: 'name',
			value: value
		});
		nameEditable = false;
	};

	const logout = async () => {
		await networker.logout();
		dispatch('close');
	};
</script>

<div class="lg:w-[800px]">
	<!-- Header -->
	<div class="h-14 w-full border-b-2 border-black uppercase flex justify-center items-center">
		Règlage
	</div>
	<div class="flex">
		<!-- Sidebar -->
		<div class="flex flex-col items-start border-r-2 border-black">
			<button class="border-b-2 border-black py-4 px-5 self-stretch">Général</button>
			<button class="border-b-2 border-black py-4 px-5 self-stretch">Amis</button>
			<button class="border-b-2 border-black py-4 px-5 self-stretch">Compte bloqués</button>
			<button class="border-b-2 border-black py-4 px-5 self-stretch">Notifications</button>
		</div>
		<!-- Window -->
		<form bind:this={form} class="overflow-scroll px-20 py-6 w-full">
			<div class="w-40 flex flex-col items-center gap-2 mx-auto">
				<div class="rounded-full w-36 h-36 border-2 border-black"></div>
				<input
					bind:this={nameInput}
					id="name"
					name="name"
					type="text"
					placeholder="Name"
					disabled={!nameEditable}
					value={nameValue}
					class="border-b-2 autofill:border-tea-rose border-black bg-transparent focus:border-fluorescent-cyan-focus w-full pb-1 min-w-5 disabled:border-transparent"
				/>
				<Button on:click={() => (nameEditable ? saveName() : makeEditable())}>Modifier</Button>
			</div>
			<div class="py-8">
				<div class="flex flex-col gap-4">
					<ToggleInput
						id="darkmode"
						label="Dark Mode"
						toggle={darkmode}
						on:change={() => (darkmode = !darkmode)}
						disabled={true}
					/>
					<TextSettings
						type="text"
						id="email"
						label="Email"
						value={user.email}
						field="email"
						on:saveField={onSaveField}
					></TextSettings>
					<TextSettings
						type="password"
						id="mot de passe"
						label="password"
						value="thisismypassword"
						field="password"
						on:saveField={onSaveField}
					></TextSettings>
					<TextSettings
						type="text"
						id="discord_user"
						label="Compte Discord"
						value={user.discord_user}
						field="discord_user"
						on:saveField={onSaveField}
					></TextSettings>
					<SelectSettings
						id="language"
						placeholder="Langue"
						field="language"
						value={user.language}
						on:saveField={onSaveField}
					></SelectSettings>
					<div class="flex justify-center">
						<Button
							classColor="bg-bittersweet-red hover:bittersweet-red-focus"
							type="button"
							stretch={false}
							on:click={logout}>Logout</Button
						>
					</div>
				</div>
			</div>
		</form>
	</div>
</div>
