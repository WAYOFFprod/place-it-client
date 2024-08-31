<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { FriendStatus, type Friend, type unblockAccountEvent } from '../types';

	const dispatch = createEventDispatcher<unblockAccountEvent>();

	export let account: Friend;

	const unblockAccount = (id: number) => {
		dispatch('unblockAccount', id);
	};
</script>

<div class="flex justify-between items-center">
	<div class="flex items-center gap-2">
		<img class="h-5" src="/svg/user-icon.svg" alt="" />
		<div>{account.name}</div>
	</div>
	{#if account.request_status == FriendStatus.Pending}
		<!-- {#if account.is_sender}
			<button
				aria-label="accept {friend.name} as friend"
				on:click={() => acceptRequest(friend.friend_id)}
			>
				<img class="h-5" src="/svg/reply.svg" alt="" />
			</button>
		{:else}
			<img class="h-5" src="/svg/time.svg" alt="" />
		{/if} -->
	{/if}
	<button
		aria-label="remove {account.name} as friend"
		on:click={() => unblockAccount(account.friend_id)}
	>
		<img class="h-5" src="/svg/trash.svg" alt="" />
	</button>
</div>
