<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { FriendStatus, type Friend, type removeFriendEvent } from '../types';

	const dispatch = createEventDispatcher<removeFriendEvent>();

	export let friend: Friend;

	const removeFriend = (id: number) => {
		dispatch('removeFriend', id);
	};

	const acceptRequest = (id: number) => {
		dispatch('acceptRequest', id);
	};
</script>

<div class="flex justify-between items-center">
	<div class="flex items-center gap-2">
		<img class="h-5" src="/svg/user-icon.svg" alt="" />
		<div>{friend.name}</div>
	</div>
	{#if friend.request_status == FriendStatus.Pending}
		{#if friend.is_sender}
			<button
				aria-label="accept {friend.name} as friend"
				on:click={() => acceptRequest(friend.friend_id)}
			>
				<img class="h-5" src="/svg/reply.svg" alt="" />
			</button>
		{:else}
			<img class="h-5" src="/svg/time.svg" alt="" />
		{/if}
	{/if}
	<button
		aria-label="remove {friend.name} as friend"
		on:click={() => removeFriend(friend.friend_id)}
	>
		<img class="h-5" src="/svg/trash.svg" alt="" />
	</button>
</div>
