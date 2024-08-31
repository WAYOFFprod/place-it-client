<script lang="ts">
	import Networker from '$lib/utility/Networker';
	import { onDestroy } from 'svelte';
	import FriendLine from './friendLine.svelte';
	import type { Friend } from '../types';

	const networker = Networker.getInstance();

	let friends: Friend[] = [];
	const getData = async () => {
		const response = await networker.getFriends();
		friends = response.data;
	};

	const removeFriend = async (event: CustomEvent<number>) => {
		const isRemoved = await networker.removeFriend(event.detail);
		console.log('isRemoved', isRemoved);
		if (isRemoved) {
			const index = friends.findIndex((obj) => obj.friend_id == event.detail);
			if (index != -1) {
				friends[index].noDisplay = true;
			}
		}
	};

	const acceptRequest = async (event: CustomEvent<number>) => {
		const response = await networker.acceptFriendRequest(event.detail);
		const index = friends.findIndex((obj) => obj.friend_id == response.data.friend_id);
		if (index >= 0) {
			friends[index] = response.data;
		}
	};

	onDestroy(() => {});
	getData();
</script>

<div class="overflow-scroll w-full">
	<div class="w-full flex flex-col items-center gap-2 mx-auto custom-scroll pr-4">
		<div class="min-h-60 max-h-96 overflow-y-scroll flex flex-col w-full px-10 py-8">
			{#each friends as friend}
				{#if !friend.noDisplay}
					<FriendLine {friend} on:removeFriend={removeFriend} on:acceptRequest={acceptRequest}
					></FriendLine>
				{/if}
			{/each}
		</div>
	</div>
</div>
