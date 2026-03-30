<script lang="ts">
	import Networker from '$lib/utility/Networker';
	import Button from './form/button.svelte';
	import Panel from './layout/panel.svelte';
	import Heart from '$lib/icons/heart.svelte';
	import HeartFill from '$lib/icons/heart-fill.svelte';
	import { event } from '$lib/stores/eventStore';
	import { openedModal } from '$lib/stores/modalStore';
	import { authStatus } from '$lib/stores/authStore';
	import { onDestroy, type Snippet } from 'svelte';

	let { canva, icon, isOffline = false }: { canva: CanvaPreviewData; icon?: Snippet; isOffline?: boolean } = $props();

	/** Card is locked offline: not a private canvas owned by the current user. */
	let isLockedOffline = $derived(isOffline && !(canva.visibility === 'private' && canva.owned));
	/** Card is privately editable offline. */
	let isEditableOffline = $derived(isOffline && canva.visibility === 'private' && canva.owned);

	let isLiked: boolean = $state(canva.isLiked);

	let conenctionStatus: undefined | boolean = $state(undefined);
	const networker = Networker.getInstance();

	const onEdit = () => {
		openedModal.set({
			name: 'modifyCanva',
			data: {
				id: canva.id,
				name: canva.name
			}
		});
	};
	const onRequest = () => {
		openedModal.set({
			name: 'joinRequest',
			data: {
				id: canva.id
			}
		});
	};

	const unsubscribeStatus = authStatus.subscribe((newStatus) => {
		conenctionStatus = newStatus;
	});

	const onDelete = async () => {
		await networker.deleteCanva(canva.id);
		event.set('updateCanvas');
	};

	const toggleLike = async () => {
		isLiked = canva.isLiked = await networker.likeCanva(canva.id);
	};

	const dateOptions: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric'
	};

	onDestroy(() => {
		unsubscribeStatus();
	});

	let getDate = $derived.by(() => {
		const date = new Date(canva.created_at);
		return date.toLocaleDateString('fr-CH', dateOptions);
	});

	let getCategory = $derived.by(() => {
		switch (canva.category) {
			case 'pixelwar':
				return 'Pixelwar';
			case 'artistic':
				return 'Oeuvre Collaborative';
			case 'free':
				return 'Libre';

			default:
				break;
		}
		return;
	});

	let getUserCount = $derived.by(() => {
		switch (canva.access) {
			case 'open':
				return canva.currentPlayers;
			case 'request_only':
				return canva.currentPlayers + '/' + canva.participants;
			default:
				break;
		}
	});
</script>

<div class="group" id="canva-preview-{canva.id}">
	<Panel className="w-full">
		{#snippet content()}
			<!-- Overlay -->
			<div class="absolute inset-0 flex flex-col justify-between h-full">
				<!-- Top section -->
				<div class="flex justify-between p-4 z-20">
					<button>
						{#if icon}
							{@render icon()}
						{:else if canva.access == 'open'}
							<img class="text-black" src="/svg/earth.svg" alt="community icon" />
						{:else if canva.access == 'request_only'}
							<img class="text-black" src="/svg/users.svg" alt="community icon" />
						{/if}
					</button>
					<div class="flex items-center gap-2">
						{#if isEditableOffline}
							<span class="inline-flex items-center gap-1 rounded-full bg-bittersweet-red px-2 py-0.5 text-xs text-white">
								<span class="h-1.5 w-1.5 rounded-full bg-white"></span>
								Hors-ligne
							</span>
						{/if}
						<button class="group/favorit relative" onclick={toggleLike} disabled={isOffline}>
							<Heart class="text-black absolute"></Heart>
							<HeartFill
								className="text-transparent group-hover/favorit:text-off-white z-20 data-[liked=true]:text-naples-yellow"
								dataLiked={isLiked}
							></HeartFill>
						</button>
					</div>
				</div>
				<!-- Bottom Section -->
				{#if canva.visibility != 'private'}
					<div class="h-6 border-t-2 border-black bg-white flex justify-between text-lg px-1">
						<span>{getCategory}</span>
						<div class="flex items-center gap-1">
							<span>{getUserCount}</span>
							<span class="w-2.5 h-2.5 rounded-full border-2 border-black bg-fluorescent-cyan"
							></span>
						</div>
					</div>
				{/if}
				<!-- Hover -->
				<div
					class="absolute invisible inset-0 bg-black/50 opacity-0 group-hover:opacity-100 px-16 md:px-28 group-hover:visible"
				>
					<div class="relative flex flex-col justify-center items-center gap-4 h-full z-30">
						{#if isLockedOffline}
							<span class="text-white text-center text-sm uppercase">Privé uniquement<br />hors-ligne</span>
						{:else if (canva.access != 'closed' || canva.owned) && conenctionStatus}
							{#if canva.participationStatus == 'accepted'}
								<Button
									type="link"
									link="/canva?id={canva.id}"
									classColor="bg-fluorescent-cyan hover:bg-fluorescent-cyan-focus"
								>
									{#snippet content()}Jouer{/snippet}</Button
								>
							{:else if canva.participationStatus == 'sent'}
								<Button
									type="button"
									disabled={true}
									link="/canva?id={canva.id}"
									classColor="bg-fluorescent-cyan hover:bg-fluorescent-cyan-focus disabled:bg-white"
									>{#snippet content()}Demande Envoyée{/snippet}</Button
								>
							{:else if canva.participationStatus == null}
								<Button
									type="button"
									click={onRequest}
									classColor="bg-fluorescent-cyan hover:bg-fluorescent-cyan-focus"
									>{#snippet content()}Rejoindre{/snippet}</Button
								>
							{/if}
						{:else if isEditableOffline && canva.participationStatus == 'accepted'}
							<!-- Own private canvas — allow editing offline -->
							<Button
								type="link"
								link="/canva?id={canva.id}"
								classColor="bg-fluorescent-cyan hover:bg-fluorescent-cyan-focus"
							>
								{#snippet content()}Jouer (hors-ligne){/snippet}</Button
							>
						{/if}
						{#if canva.access != 'closed' && !isLockedOffline}
							<Button
								type="link"
								link="/canva/view?id={canva.id}"
								classColor="bg-naples-yellow hover:bg-naples-yellow-focus"
								>{#snippet content()}Regarder{/snippet}</Button
							>
						{/if}
						{#if canva.owned && !isOffline}
							<Button
								id="modify"
								type="button"
								click={onEdit}
								classColor="bg-naples-yellow hover:bg-naples-yellow-focus"
								>{#snippet content()}Modifier{/snippet}</Button
							>
							<Button
								type="button"
								click={onDelete}
								classColor="bg-bittersweet-red hover:bg-bittersweet-red-focus"
								>{#snippet content()}Supprimer{/snippet}</Button
							>
						{/if}
					</div>
				</div>
			</div>
			<!-- Image -->
			<img class="w-96 h-64 disable-blur object-cover" src={canva.image} alt="canva {canva.id}" />
		{/snippet}
	</Panel>
	<div class="flex flex-col gap-1 mt-4">
		<div>{canva.name}</div>
		<div class="text-lg">
			Crée le {getDate}
		</div>
	</div>
</div>
