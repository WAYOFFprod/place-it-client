<script lang="ts">
	import { tokenStore, userStore } from '$lib/stores/authStore';
	import { chatMessages } from '$lib/stores/chatStore';
	import Networker from '$lib/utility/Networker';

	const networker = Networker.getInstance();
	let isOpen = false;

	let message: string = '';

	let entries: Message[] = [];
	let respondTo: string | null = null;

	let input: HTMLInputElement;

	chatMessages.subscribe((newMessages: Message[]) => {
		entries = newMessages;
	});

	let userData: undefined | User;
	userStore.subscribe((newUserData) => {
		userData = newUserData;
	});

	let canvaToken: string | undefined;
	tokenStore.subscribe((newToken) => {
		canvaToken = newToken;
	});

	const sendMessage = () => {
		if (userData == undefined || canvaToken == undefined) {
			console.warn('not autheticated: cant send message');
			return;
		}

		const date = new Date();
		let msg: Message = {
			id: userData.id,
			time: Date.parse(date.toUTCString()),
			user: userData.name,
			message: message,
			token: canvaToken
		};
		if (respondTo) {
			msg.respondTo = respondTo;
			respondTo = null;
		}
		networker.sendMessage(msg);
	};

	window.addEventListener('keydown', (e: KeyboardEvent) => {
		if (e.key == 'Enter') {
			sendMessage();
			message = '';
			if (!isOpen) isOpen = true;
		}
	});

	const respond = (userName: string) => {
		respondTo = userName;
		input.focus();
	};

	const clearRespondTo = () => {
		respondTo = null;
	};

	const getDate = (time: number) => {
		const date = new Date(time);
		return date.getHours() + ':' + date.getMinutes();
	};
</script>

<div
	class="chat border-2 border-black rounded bg-off-white/50 flex flex-col overflow-hidden pointer-events-auto {$$props.class}"
>
	<!-- chat window -->
	<div class="h-full px-4">
		<button
			type="button"
			on:click={() => (isOpen = !isOpen)}
			class="flex justify-between items-center h-12 uppercase w-full"
		>
			<h3>chat</h3>
			<button type="button"><img src="/svg/chevron-down.svg" alt="down icon" /></button>
		</button>
		<!-- sroll area -->
		<div
			class="{isOpen
				? 'max-h-32 pt-2'
				: 'max-h-0 pt-0'} overflow-y-scroll pr-3 -mr-2 flex flex-col-reverse"
		>
			{#each [...entries].reverse() as entry}
				<div class="flex items-start gap-2 pb-1">
					<span class="text-md font-normal w-6 shrink-0 pt-0.5">{getDate(entry.time)}</span>
					<span
						class="text-lg font-bold max-w-20 overflow-hidden text-ellipsis whitespace-nowrap shrink-0"
						>{entry.user}</span
					>

					<div class="relative text-md font-normal grow">
						<span
							class="text-lg font-bold pr-1 max-w-20 overflow-hidden text-ellipsis whitespace-nowrap shrink-0"
						>
							{#if entry.respondTo}
								@{entry.respondTo}:
							{/if}
						</span>
						<span class="pt-0.5">{entry.message}</span>
					</div>
					<button class="w-fit shrink-0 cursor-not-allowed" disabled
						><img class="w-4 self-end" src="/svg/heart.svg" alt="favorit" /></button
					>
					<button
						on:click={() => respond(entry.user)}
						class="w-4 shrink-0 group"
						disabled={networker.shortClientId == entry.user}
					>
						{#if networker.shortClientId != entry.user}
							<img class="w-4 self-end" src="/svg/reply.svg" alt="reply" />
						{/if}
					</button>
				</div>
			{/each}
		</div>
	</div>
	<!-- typing area -->
	<div class="h-10 rounded-b border-t-2 border-black flex items-center bg-off-white">
		<button
			on:click={clearRespondTo}
			class="px-2 text-medium max-w-20 overflow-hidden text-ellipsis whitespace-nowrap"
		>
			{#if respondTo}
				@{respondTo}:
			{/if}
		</button>
		<input
			class="placeholder:text-black px-2 h-10 w-full bg-transparent inline"
			placeholder="Ecrire un message..."
			bind:value={message}
			bind:this={input}
		/>
	</div>
</div>
