<script lang="ts">
	import { FriendStatus, type Friend } from '../types';

	interface Props {
		account: Friend;
		unblockAccount?: (id: number) => void;
	}

	let { account, unblockAccount }: Props = $props();

	const onUnblockAccount = (id: number) => {
		unblockAccount?.(id);
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
		onclick={() => onUnblockAccount(account.friend_id)}
	>
		<img class="h-5" src="/svg/trash.svg" alt="" />
	</button>
</div>
