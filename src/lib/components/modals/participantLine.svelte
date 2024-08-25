<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { type Participant, type removeParticipantEvent } from './types';

	const dispatch = createEventDispatcher<removeParticipantEvent>();

	export let participant: Participant;

	const removeParticipant = (id: number) => {
		dispatch('removeParticipant', id);
	};

	const acceptRequest = (id: number) => {
		dispatch('acceptRequest', id);
	};
	console.log(participant);
</script>

<div class="flex justify-between items-center">
	<div><img src="/svg/user.svg" alt="" class="inline" /> {participant.name}</div>
	{#if participant.status != 'accepted' && participant.status != 'invited'}
		<button
			aria-label="accept {participant.name} as friend"
			on:click={() => acceptRequest(participant.id)}
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
			on:click={() => removeParticipant(participant.id)}
		>
			<img class="h-5" src="/svg/trash.svg" alt="" />
		</button>
	{/if}
	{#if participant.status == 'rejected'}
		<img class="h-5" src="/svg/block.svg" alt="" />
	{/if}
</div>
