<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from '$lib/components/form/button.svelte';
	import Networker from '$lib/utility/Networker';

	export let userId: number = -1;
	export let userName: string = '';
	const dispatch = createEventDispatcher();

	const networker = Networker.getInstance();

	const addAsFriend = async () => {
		const response = await networker.requestFriend(userId);
		console.log(response);
	};
	const block = async () => {
		const response = await networker.blockUser(userId);
		console.log(response);
	};
	const close = () => {
		dispatch('close');
	};
</script>

<div class="flex flex-col gap-4 m-6 min-w-40 md:min-w-64 bg-off-white">
	<div class="flex justify-center items-center gap-2 mb-2">
		<img src="/svg/user.svg" alt="username icon" />{userName}
	</div>
	<Button classColor="bg-fluorescent-cyan hover:bg-fluorescent-cyan-focus" disabled={true}
		><img src="/svg/cursor.svg" alt="cursor icon" /> Suivre le curseur</Button
	>
	<Button on:click={addAsFriend}><img src="/svg/plus.svg" alt="add icon" />Ajouter en ami</Button>
	<Button disabled={true}><img src="/svg/plus.svg" alt="add icon" />Ajouter sur Discord</Button>
	<Button on:click={block} classColor="bg-bittersweet-red hover:bg-bittersweet-red-focus"
		><img src="/svg/block.svg" alt="block icon" />Bloquer</Button
	>
	<Button classColor="bg-bittersweet-red hover:bg-bittersweet-red-focus" disabled={true}
		><img src="/svg/signal.svg" alt="signal icon" />Signaler</Button
	>
	<Button classColor="bg-tea-rose hover:bg-tea-rose-focus" on:click={close}
		><img src="/svg/close.svg" alt="close icon" />Annuler</Button
	>
</div>
