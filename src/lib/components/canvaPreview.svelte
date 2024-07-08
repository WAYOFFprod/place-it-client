<script lang="ts">
	import Networker from '$lib/utility/Networker';
	import Button from './form/button.svelte';
	import Panel from './layout/panel.svelte';
	import { event } from '$lib/stores/eventStore';
	import { openedModal } from '$lib/stores/modalStore';
	import Accordion from './layout/accordion.svelte';
	import { authStatus } from '$lib/stores/authStore';

	export let canva: CanvaPreviewData;

	let conenctionStatus: undefined | boolean;
	const networker = Networker.getInstance();

	const onEdit = () => {};
	const onRequest = () => {
		openedModal.set({
			name: 'joinRequest',
			data: {
				id: canva.id
			}
		});
	};

	authStatus.subscribe((newStatus) => {
		conenctionStatus = newStatus;
	});

	const onDelete = async () => {
		await networker.deleteCanva(canva.id);
		event.set('updateCanvas');
	};

	const getUserCount = () => {
		switch (canva.access) {
			case 'open':
				return '0';
				break;
			case 'request_only':
				return '0/' + canva.participants;
				break;

			default:
				break;
		}
	};

	$: getCategory = () => {
		switch (canva.category) {
			case 'pixelwar':
				return 'Pixelwar';
				break;
			case 'artistic':
				return 'Oeuvre Collaborative';
				break;
			case 'free':
				return 'Libre';
				break;

			default:
				break;
		}
		return;
	};
</script>

<div class="group">
	<Panel class="w-full">
		<!-- Overlay -->
		<div class="absolute inset-0 flex flex-col justify-between h-full">
			<!-- Top section -->
			<div class="flex justify-between p-4">
				<button>
					<slot name="icon">
						{#if canva.access == 'open'}
							<img class="test-black" src="/svg/earth.svg" alt="community icon" />
						{:else if canva.access == 'request_only'}
							<img class="test-black" src="/svg/users.svg" alt="community icon" />
						{/if}
					</slot>
				</button>
				<button>
					<img class="test-black" src="/svg/heart.svg" alt="favorit Icon" />
				</button>
			</div>
			<!-- Bottom Section -->
			{#if canva.visibility != 'private'}
				<div class="h-6 border-t-2 border-black bg-white flex justify-between text-lg px-1">
					<span>{getCategory()}</span>
					<div class="flex items-center gap-1">
						<span>{getUserCount()} </span>
						<span class="w-2.5 h-2.5 rounded-full border-2 border-black bg-fluorescent-cyan"></span>
					</div>
				</div>
			{/if}
			<!-- Hover -->
			<div
				class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center px-28 gap-4"
			>
				{#if (canva.access != 'closed' || canva.owned) && conenctionStatus}
					{#if canva.participationStatus == 'accepted'}
						<Button
							type="link"
							link="/canva?id={canva.id}"
							classColor="bg-fluorescent-cyan hover:bg-fluorescent-cyan-focus">Jouer</Button
						>
					{:else if canva.participationStatus == 'sent'}
						<Button
							type="button"
							disabled={true}
							link="/canva?id={canva.id}"
							classColor="bg-fluorescent-cyan hover:bg-fluorescent-cyan-focus disabled:bg-white"
							>Demande Envoyée</Button
						>
					{:else if canva.participationStatus == null}
						<Button
							type="button"
							on:click={onRequest}
							classColor="bg-fluorescent-cyan hover:bg-fluorescent-cyan-focus">Rejoindre</Button
						>
					{/if}
				{/if}
				{#if canva.access != 'closed'}
					<Button
						type="link"
						link="/canva/view?id={canva.id}"
						classColor="bg-naples-yellow hover:bg-naples-yellow-focus">Regarder</Button
					>
				{/if}
				{#if canva.owned}
					{#if canva.access == 'closed'}
						<Button
							type="button"
							on:click={onEdit}
							classColor="bg-naples-yellow hover:bg-naples-yellow-focus">Modifier</Button
						>
					{/if}
					<Button
						type="button"
						on:click={onDelete}
						classColor="bg-bittersweet-red hover:bg-bittersweet-red-focus">Supprimer</Button
					>
				{/if}
			</div>
		</div>
		<!-- Image -->
		<img
			class="w-full h-64 disable-blur object-cover aspect-7/5"
			src={canva.image}
			alt="canva {canva.id}"
		/>
	</Panel>
</div>
