<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from '$lib/components/form/button.svelte';
	import Networker from '$lib/utility/Networker';
	import { event } from '$lib/stores/eventStore';

	export let canvaId: number;
	const dispatch = createEventDispatcher();

	const networker = Networker.getInstance();

	const join = async () => {
		await networker.joinCanva(canvaId);
		event.set('updateCanvas');
		close();
	};
	const close = () => {
		dispatch('close');
	};
</script>

<div class="flex flex-col gap-6 items-center p-4 max-w-xs">
	<div class="uppercase text-center">Voulez-vous demander a rejoindre le Canva ?</div>
	<div class="flex flex-col gap-4">
		<Button
			type="button"
			classColor="bg-fluorescent-cyan hover:bg-fluorescent-cyan-focus"
			on:click={join}>Envoyer la demande</Button
		>
		<Button type="button" classColor="bg-tea-rose hover:bg-tea-rose-focus" on:click={close}
			>Annuler</Button
		>
	</div>
</div>
