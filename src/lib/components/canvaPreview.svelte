<script lang="ts">
	import Button from './form/button.svelte';
	import Panel from './layout/panel.svelte';

	export let canva: CanvaPreviewData;

	const onView = () => {};
	const onEdit = () => {};
	const onDelete = () => {};
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
			<div class="h-5 border-t-2 border-black bg-white flex justify-between">
				<span>Catégorie</span>
				<div>
					1/2 <span class="w-1.5 h-1.5 rounded-full border border-black bg-fluorescent-cyan"></span>
				</div>
			</div>
			<!-- Hover -->
			<div
				class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center px-28 gap-4"
			>
				{#if canva.mode == 'playable'}
					<Button
						type="link"
						link="/canva?id={canva.id}"
						classColor="bg-fluorescent-cyan hover:bg-fluorescent-cyan-focus">Jouer</Button
					>
				{:else if canva.mode == 'view_only'}
					<Button
						type="button"
						on:click={onView}
						classColor="bg-naples-yellow hover:bg-naples-yellow-focus">Regarder</Button
					>
				{/if}
				{#if canva.owned}
					<Button
						type="button"
						on:click={onEdit}
						classColor="bg-naples-yellow hover:bg-naples-yellow-focus">Modifier</Button
					>
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
