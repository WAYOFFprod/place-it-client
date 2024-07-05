<script lang="ts">
	import Networker from '$lib/utility/Networker';
	import Button from './form/button.svelte';
	import Panel from './layout/panel.svelte';
	import { event } from '$lib/stores/eventStore';
	import Accordion from './layout/accordion.svelte';

	export let canva: CanvaPreviewData;

	const networker = Networker.getInstance();

	const onView = () => {};
	const onEdit = () => {};
	const onDelete = async () => {
		await networker.deleteCanva(canva.id);
		event.set('updateCanvas');
	};

	const getCategory = () => {
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

	const getUserCount = () => {
		switch (canva.access) {
			case 'open':
				return '0';
				break;
			case 'request_only':
				return '0/x';
				break;

			default:
				break;
		}
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
						<img class="test-black" src="/svg/earth.svg" alt="community icon" />
					</slot>
				</button>
				<button>
					<img class="test-black" src="/svg/heart.svg" alt="favorit Icon" />
				</button>
			</div>
			<!-- Bottom Section -->
			{#if canva.access != 'closed'}
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
				{#if canva.access == 'open' || canva.owned}
					<Button
						type="link"
						link="/canva?id={canva.id}"
						classColor="bg-fluorescent-cyan hover:bg-fluorescent-cyan-focus">Jouer</Button
					>
				{/if}
				{#if canva.access != 'closed'}
					<Button
						type="button"
						on:click={onView}
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
