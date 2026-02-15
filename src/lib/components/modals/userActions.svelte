<script lang="ts">
	import Button from '$lib/components/form/button.svelte';
	import Networker from '$lib/utility/Networker';

	interface Props {
		userId?: number;
		userName?: string;
		close?: () => void;
	}

	let { userId = -1, userName = '', close }: Props = $props();

	const networker = Networker.getInstance();

	const addAsFriend = async () => {
		const response = await networker.requestFriend(userId);
		console.log(response);
	};
	const block = async () => {
		const response = await networker.blockUser(userId);
		console.log(response);
	};
	const onClose = () => {
		close?.();
	};
</script>

<div class="flex flex-col gap-4 m-6 min-w-40 md:min-w-64 bg-off-white">
	<div class="flex justify-center items-center gap-2 mb-2">
		<img src="/svg/user.svg" alt="" />{userName}
	</div>
	<Button classColor="bg-fluorescent-cyan hover:bg-fluorescent-cyan-focus" disabled={true}>
		{#snippet content()}
			<img src="/svg/cursor.svg" alt="" />Suivre le curseur
		{/snippet}
	</Button>
	<Button click={addAsFriend}
		>{#snippet content()}
			<img src="/svg/plus.svg" alt="" />Ajouter en ami
		{/snippet}
	</Button>
	<Button disabled={true}
		>{#snippet content()}
			<img src="/svg/plus.svg" alt="" />Ajouter sur Discord
		{/snippet}
	</Button>
	<Button click={block} classColor="bg-bittersweet-red hover:bg-bittersweet-red-focus">
		{#snippet content()}
			<img src="/svg/block.svg" alt="" />Bloquer
		{/snippet}
	</Button>
	<Button classColor="bg-bittersweet-red hover:bg-bittersweet-red-focus" disabled={true}>
		{#snippet content()}
			<img src="/svg/signal.svg" alt="" />Signaler
		{/snippet}
	</Button>
	<Button classColor="bg-tea-rose hover:bg-tea-rose-focus" click={onClose}>
		{#snippet content()}
			<img src="/svg/close.svg" alt="" />Annuler
		{/snippet}
	</Button>
</div>
