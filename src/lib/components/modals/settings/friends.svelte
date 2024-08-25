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

	const removeFriend = (event: CustomEvent<number>) => {
		console.log('remove friend', event.detail);
	};

	const acceptRequest = (event: CustomEvent<number>) => {
		console.log('accept friend', event.detail);
	};

	onDestroy(() => {});
	getData();
</script>

<div class="overflow-scroll w-full">
	<div class="w-full flex flex-col items-center gap-2 mx-auto custom-scroll pr-4">
		<div class="min-h-60 max-h-96 overflow-y-scroll flex flex-col w-full px-10 py-8">
			{#each friends as friend}
				<FriendLine {friend} on:removeFriend={removeFriend} on:acceptRequest={acceptRequest}
				></FriendLine>
			{/each}
		</div>
	</div>
</div>
