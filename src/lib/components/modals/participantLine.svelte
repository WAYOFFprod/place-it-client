<script lang="ts">
	import { type Participant } from './types';
	interface Props {
		participant: Participant;
		removeParticipant?: (id: number) => void;
		acceptRequest?: (id: number) => void;
	}

	let { participant, removeParticipant, acceptRequest }: Props = $props();

	const onRemoveParticipant = (id: number) => {
		removeParticipant?.(id);
	};

	const onAcceptRequest = (id: number) => {
		acceptRequest?.(id);
	};
</script>

<div class="flex justify-between items-center">
	<div><img src="/svg/user.svg" alt="" class="inline" /> {participant.name}</div>
	{#if participant.status != 'accepted' && participant.status != 'invited'}
		<button
			aria-label="accept {participant.name} as friend"
			onclick={() => onAcceptRequest(participant.id)}
		>
			<img class="h-5" src="/svg/reply.svg" alt="" />
		</button>
	{/if}
	{#if participant.status == 'invited'}
		<img class="h-5" src="/svg/time.svg" alt="" />
	{/if}
	{#if participant.status != 'rejected'}
		<button
			aria-label="remove {participant.name} as friend"
			onclick={() => onRemoveParticipant(participant.id)}
		>
			<img class="h-5" src="/svg/trash.svg" alt="" />
		</button>
	{/if}
	{#if participant.status == 'rejected'}
		<img class="h-5" src="/svg/block.svg" alt="" />
	{/if}
</div>
