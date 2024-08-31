<script lang="ts">
	import Networker from '$lib/utility/Networker';
	import { onDestroy } from 'svelte';
	import type { Participant } from './types';
	import ParticipantLine from './participantLine.svelte';

	const networker = Networker.getInstance();

	export let canvaId: number;

	let participants: Participant[] = [];
	const getData = async () => {
		const response = await networker.getParticipants(canvaId);
		participants = response.data;
	};

	const removeParticipant = async (event: CustomEvent<number>) => {
		const response: any = await networker.rejectParticipationRequest(event.detail, canvaId);
		updateParticipantList(response.data);
	};

	const acceptRequest = async (event: CustomEvent<number>) => {
		const response: any = await networker.acceptParticipationRequest(event.detail, canvaId);
		updateParticipantList(response.data);
	};

	const updateParticipantList = (data: any) => {
		const index = participants.findIndex((obj) => obj.id == data.id);
		if (index >= 0) {
			participants[index] = data;
		}
	};

	onDestroy(() => {});
	getData();
</script>

<div class="overflow-scroll min-w-64">
	<div class="w-full flex flex-col items-center gap-2 mx-auto custom-scroll pr-4">
		<div class="max-h-72 overflow-y-auto flex flex-col w-full px-4 py-8">
			{#each participants as participant}
				<ParticipantLine
					{participant}
					on:removeParticipant={removeParticipant}
					on:acceptRequest={acceptRequest}
				></ParticipantLine>
			{/each}
		</div>
	</div>
</div>
