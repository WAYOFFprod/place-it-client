<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from '../form/button.svelte';
	import Participants from './participants.svelte';
	import Autocomplete from '../form/autocomplete.svelte';
	import Networker from '$lib/utility/Networker';
	import type { Friend } from './types';
	import TextSettings from '../form/textSettings.svelte';
	import { event } from '$lib/stores/eventStore';

	const dispatch = createEventDispatcher();
	const networker = Networker.getInstance();
	export let canvaId: number;
	export let canvaName: string;

	let form: HTMLFormElement;

	let wasUpdated: boolean = false;

	let isAddingUser: boolean = false;
	let friendoptions: Option[] = [];
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

	const onSaveName = (event: CustomEvent<SettingOption>) => {
		const formData = new FormData(form);
		const value = formData.get(event.detail.field) as string;
		networker.saveCanvaField({
			id: canvaId,
			field: 'name',
			value: value
		});
		wasUpdated = true;
	};

	const close = () => {
		if (wasUpdated) event.set('updateCanvas');
		dispatch('close');
	};

	getData();
</script>

<form bind:this={form} class="">
	<!-- header -->
	<div
		class="relative border-b-2 border-black py-5 text-center font-sans font-bold text-3xl uppercase"
	>
		<span>modifier le canva</span>
		<button id="close-modal" aria-label="close" class="absolute right-4 top-4" on:click={close}>
			<img class="icon" src="/svg/close.svg" alt="" />
		</button>
	</div>
	<!-- content -->
	<div class="m-8 flex flex-col items-center gap-8">
		<div class="flex gap-8">
			<div>
				<TextSettings
					type="text"
					id="name"
					label="Nom"
					value={canvaName}
					field="name"
					on:saveField={onSaveName}
				></TextSettings>
			</div>
			<div>
				{#if isAddingUser}
					<div class="flex mb-4">
						<h3>Ajouter</h3>
					</div>
					<Autocomplete
						on:selectOption={selectOption}
						id="friends"
						options={friendoptions}
						class="max-h-64 mb-6"
					></Autocomplete>
					<Button
						id="see-participant-list"
						type="button"
						on:click={() => (isAddingUser = !isAddingUser)}>Voir liste</Button
					>
				{:else}
					<div class="flex">
						<img src="" alt="" />
						<h3>Participants</h3>
					</div>
					<Participants {canvaId}></Participants>
					<Button id="add-participant" type="button" on:click={() => (isAddingUser = !isAddingUser)}
						><img class="icon" src="/svg/plus.svg" alt="" />Ajouter un participant</Button
					>
				{/if}
			</div>
		</div>
		<!-- <div class="flex flex-col gap-4 w-64">
			<Button type="button" classColor="bg-fluorescent-cyan hover:bg-fluorescent-cyan-focus"
				><img src="/svg/save.svg" alt="" />Sauvegarder</Button
			>
			<Button type="button" classColor="bg-tea-rose hover:bg-tea-rose-focus"
				><img src="/svg/close.svg" alt="" />Annuler</Button
			>
		</div> -->
	</div>
</form>
