<script lang="ts">
	import { userStore } from '$lib/stores/authStore';
	import Networker from '$lib/utility/Networker';
	import Button from '../form/button.svelte';
	import SelectSettings from '../form/selectSettings.svelte';
	import TextSettings from '../form/textSettings.svelte';
	import ToggleInput from '../form/toggleInput.svelte';

	let darkmode = false;
	let form: HTMLFormElement;

	let user: User;
	userStore.subscribe((newUser) => {
		user = newUser;
	});

	const networker: Networker = Networker.getInstance();
	const onSaveField = (event: CustomEvent<SettingOption>) => {
		const formData = new FormData(form);
		const value = formData.get(event.detail.field) as string;
		if (event.detail.value != value) {
			console.log(value, event.detail.value);
			networker.saveField({
				field: event.detail.field,
				value: value
			});
		}
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
		<div class="overflow-scroll px-20 py-6 w-full">
			<div class="w-40 flex flex-col items-center gap-2 mx-auto">
				<div class="rounded-full w-36 h-36 border-2 border-black"></div>
				<div>{user.name}</div>
				<Button>Modifier</Button>
			</div>
			<form class="py-8" bind:this={form}>
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
				</div>
			</form>
		</div>
	</div>
</div>
