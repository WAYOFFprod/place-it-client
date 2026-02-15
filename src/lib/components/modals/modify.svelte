<script lang="ts">
	import Button from '../form/button.svelte';
	import Participants from './participants.svelte';
	import Autocomplete from '../form/autocomplete.svelte';
	import Networker from '$lib/utility/Networker';
	import type { Friend } from './types';
	import TextSettings from '../form/textSettings.svelte';
	import { event } from '$lib/stores/eventStore';

	const networker = Networker.getInstance();

	interface Props {
		canvaId: number;
		canvaName: string;
		close?: () => void;
	}

	let { canvaId, canvaName, close }: Props = $props();

	let form: HTMLFormElement;

	let wasUpdated: boolean = false;

	let isAddingUser: boolean = $state(false);
	let friendoptions: Option[] = $state([]);
	let friends: Friend[];
	const getData = async () => {
		const response = await networker.getFriends();
		friends = response.data;
		friendoptions = response.data.map((user: Friend) => {
			return {
				key: user.friend_id,
				value: user.name
			};
		});
	};

	const selectOption = (event: CustomEvent<number>) => {
		const selectedFriend = friends.filter((friend) => {
			return friend.friend_id == event.detail;
		})[0];
		// TODO: invite friend to canva
		networker.inviteToCanva(selectedFriend.friend_id, canvaId);
	};

	const onSaveName = (data: SettingOption) => {
		const formData = new FormData(form);
		const value = formData.get(data.field) as string;
		networker.saveCanvaInputField({
			id: canvaId,
			field: 'name',
			value: value
		});
		wasUpdated = true;
		onclose();
	};

	const onclose = () => {
		if (wasUpdated) event.set('updateCanvas');
		close?.();
	};

	getData();
</script>

<form bind:this={form} class="relative">
	<!-- content -->
	<div class="p-8 flex flex-col items-center justify-between gap-8 h-full">
		<div class="flex flex-col md:flex-row gap-8">
			<div>
				<TextSettings
					type="text"
					id="name"
					label="Nom"
					value={canvaName}
					field="name"
					saveField={onSaveName}
				></TextSettings>
			</div>
			<div>
				{#if isAddingUser}
					<div class="flex mb-4">
						<h3>Ajouter</h3>
					</div>
					<Autocomplete
						{selectOption}
						id="friends"
						options={friendoptions}
						className="max-h-64 mb-6"
					></Autocomplete>
					<Button
						id="see-participant-list"
						type="button"
						click={() => (isAddingUser = !isAddingUser)}
						>{#snippet content()}Voir liste{/snippet}</Button
					>
				{:else}
					<div class="flex">
						<img src="" alt="" />
						<h3>Participants</h3>
					</div>
					<Participants {canvaId}></Participants>
					<Button id="add-participant" type="button" click={() => (isAddingUser = !isAddingUser)}>
						{#snippet content()}
							<img class="icon" src="/svg/plus.svg" alt="" />Ajouter un participant
						{/snippet}
					</Button>
				{/if}
			</div>
		</div>
		<div class="flex flex-col gap-4 w-64">
			<Button type="button" classColor="bg-fluorescent-cyan hover:bg-fluorescent-cyan-focus">
				{#snippet content()}
					<img src="/svg/save.svg" alt="" />Sauvegarder
				{/snippet}
			</Button>
			<Button type="button" classColor="bg-tea-rose hover:bg-tea-rose-focus">
				{#snippet content()}
					<img src="/svg/close.svg" alt="" />Annuler
				{/snippet}
			</Button>
		</div>
	</div>
</form>
