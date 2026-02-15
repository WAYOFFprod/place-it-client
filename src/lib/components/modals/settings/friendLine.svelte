<script lang="ts">
	import { FriendStatus, type Friend } from '../types';

	interface Props {
		friend: Friend;
		removeFriend?: (id: number) => void;
		acceptRequest?: (id: number) => void;
	}

	let { friend, removeFriend, acceptRequest }: Props = $props();

	const onRemoveFriend = (id: number) => {
		removeFriend?.(id);
	};

	const onAcceptRequest = (id: number) => {
		acceptRequest?.(id);
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
				onclick={() => onAcceptRequest(friend.friend_id)}
			>
				<img class="h-5" src="/svg/reply.svg" alt="" />
			</button>
		{:else}
			<img class="h-5" src="/svg/time.svg" alt="" />
		{/if}
	{/if}
	<button
		aria-label="remove {friend.name} as friend"
		onclick={() => onRemoveFriend(friend.friend_id)}
	>
		<img class="h-5" src="/svg/trash.svg" alt="" />
	</button>
</div>
