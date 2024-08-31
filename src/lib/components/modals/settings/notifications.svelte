<script lang="ts">
	import ToggleInput from '$lib/components/form/toggleInput.svelte';
	import Networker from '$lib/utility/Networker';

	let form: HTMLFormElement;

	// let settings: any;

	let friendRequest = false;
	let acceptedFriendRequest = false;
	let canvaRequest = false;
	let acceptedCanvaRequest = false;

	const networker: Networker = Networker.getInstance();

	// const dispatch = createEventDispatcher();

	const getData = async () => {
		const response: any = await networker.getNotificationSettings();
		const settings: NotificationSettings = response.data;
		updateSettings(settings);
	};

	const onUpdateField = async (field: string) => {
		const formData = new FormData(form);
		const value = formData.get(field) as string;
		const response: any = await networker.saveNotificationSetting({
			field: field,
			value: value == 'on' ? true : false
		});

		const settings: NotificationSettings = response.data;
		updateSettings(settings);
	};

	const updateSettings = (newSettings: NotificationSettings) => {
		friendRequest = newSettings.friend_request;
		acceptedFriendRequest = newSettings.accepted_friend_request;
		canvaRequest = newSettings.canva_request;
		acceptedCanvaRequest = newSettings.accepted_canva_request;
	};

	// onDestroy(() => {
	// 	unsubscribeUser();
	// });
	getData();
</script>

<form bind:this={form} class="overflow-scroll px-20 py-6 w-full">
	<div class="py-8">
		<div class="flex flex-col gap-4">
			<ToggleInput
				id="friend_request"
				label="Nouvelle demande d’ami"
				toggle={friendRequest}
				on:change={() => {
					friendRequest = !friendRequest;
					onUpdateField('friend_request');
				}}
			/>
			<ToggleInput
				id="accepted_friend_request"
				label="Demande d’ami acceptée"
				toggle={acceptedFriendRequest}
				on:change={() => {
					acceptedFriendRequest = !acceptedFriendRequest;
					onUpdateField('accepted_friend_request');
				}}
			/>
			<ToggleInput
				id="canva_request"
				label="Demande pour rejoindre mon canva"
				toggle={canvaRequest}
				on:change={() => {
					canvaRequest = !canvaRequest;
					onUpdateField('canva_request');
				}}
			/>
			<ToggleInput
				id="accepted_canva_request"
				label="Demande pour rejoindre un canva acceptée"
				toggle={acceptedCanvaRequest}
				on:change={() => {
					acceptedCanvaRequest = !acceptedCanvaRequest;
					onUpdateField('accepted_canva_request');
				}}
			/>

			<!-- <div class="flex justify-center">
				<Button
					classColor="bg-bittersweet-red hover:bittersweet-red-focus"
					type="button"
					stretch={false}
					on:click={logout}>Logout</Button
				>
			</div> -->
		</div>
	</div>
</form>
