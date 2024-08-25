<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from '../form/button.svelte';
	import TextInput from '../form/textInput.svelte';
	import Participants from './participants.svelte';
	import Autocomplete from '../form/autocomplete.svelte';
	import Networker from '$lib/utility/Networker';
	import type { Friend } from './types';

	const dispatch = createEventDispatcher();
	const networker = Networker.getInstance();
	export let canvaId: number;

	let isAddingUser: boolean = false;
	let friendoptions: Option[] = [];
	let friends: Friend[];
	const getData = async () => {
		const response = await networker.getFriends();
		console.log(response.data);
		friends = response.data;
		friendoptions = response.data.map((user: Friend) => {
			return {
				key: user.friend_id,
				value: user.name
			};
		});
	};

	const selectOption = (event: CustomEvent<number>) => {
		console.log('select option', event.detail);
		const selectedFriend = friends.filter((friend) => {
			return friend.friend_id == event.detail;
		})[0];
		// TODO: invite friend to canva
		networker.inviteToCanva(selectedFriend.friend_id, canvaId);
	};

	const close = () => {
		dispatch('close');
	};

	getData();
</script>

<div class="">
	<!-- header -->
	<div
		class="relative border-b-2 border-black py-5 text-center font-sans font-bold text-3xl uppercase"
	>
		<span>modifier le canva</span>
		<button aria-label="close" class="absolute right-4 top-4" on:click={close}>
			<img src="/svg/close.svg" alt="" />
		</button>
	</div>
	<!-- content -->
	<div class="m-8 flex flex-col items-center gap-8">
		<div class="flex gap-8">
			<div>
				<TextInput id="name" label="Nom"><img src="/svg/edit.svg" alt="" /></TextInput>
			</div>
			<div>
				{#if isAddingUser}
					<div class="flex">
						<h3>Ajouter</h3>
					</div>
					<Autocomplete
						on:selectOption={selectOption}
						id="friends"
						options={friendoptions}
						class="h-64"
					></Autocomplete>
				{:else}
					<div class="flex">
						<img src="" alt="" />
						<h3>Participants</h3>
					</div>
					<Participants {canvaId}></Participants>
				{/if}
				<Button type="button" on:click={() => (isAddingUser = !isAddingUser)}
					><img src="/svg/plus.svg" alt="" />Ajouter un participant</Button
				>
			</div>
		</div>
		<div class="flex flex-col gap-4 w-64">
			<Button type="button" classColor="bg-fluorescent-cyan hover:bg-fluorescent-cyan-focus"
				><img src="/svg/save.svg" alt="" />Sauvegarder</Button
			>
			<Button type="button" classColor="bg-tea-rose hover:bg-tea-rose-focus"
				><img src="/svg/close.svg" alt="" />Annuler</Button
			>
		</div>
	</div>
</div>
