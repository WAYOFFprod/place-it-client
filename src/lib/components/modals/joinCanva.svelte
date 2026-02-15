<script lang="ts">
	import Button from '$lib/components/form/button.svelte';
	import Networker from '$lib/utility/Networker';
	import { event } from '$lib/stores/eventStore';

	interface Props {
		canvaId: number;
		close?: () => void;
	}

	let { canvaId, close }: Props = $props();

	const networker = Networker.getInstance();

	const join = async () => {
		await networker.requestAccess(canvaId);
		event.set('updateCanvas');
		clickClose();
	};
	const clickClose = () => {
		close?.();
	};
</script>

<div class="flex flex-col gap-6 items-center p-4 max-w-xs">
	<div class="uppercase text-center">Voulez-vous demander a rejoindre le Canva ?</div>
	<div class="flex flex-col gap-4">
		<Button
			type="button"
			classColor="bg-fluorescent-cyan hover:bg-fluorescent-cyan-focus"
			click={join}
		>
			{#snippet content()}
				Envoyer la demande
			{/snippet}
		</Button>
		<Button type="button" classColor="bg-tea-rose hover:bg-tea-rose-focus" click={clickClose}>
			{#snippet content()}
				Annuler
			{/snippet}
		</Button>
	</div>
</div>
