<script lang="ts">
	import Networker from '$lib/utility/Networker';
	import { onDestroy } from 'svelte';
	import type { Friend } from '../types';
	import BlockedLine from './blockedLine.svelte';

	const networker = Networker.getInstance();

	let accounts: Friend[] = [];
	const getData = async () => {
		const response = await networker.blockedUser();
		accounts = response.data;
	};

	const unblockAccount = async (event: CustomEvent<number>) => {
		const isRemoved = await networker.unblockAccount(event.detail);
		if (isRemoved) {
			const index = accounts.findIndex((obj) => obj.friend_id == event.detail);
			if (index != -1) {
				accounts[index].noDisplay = true;
			}
		}
	};

	onDestroy(() => {});
	getData();
</script>

<div class="overflow-scroll w-full">
	<div class="w-full flex flex-col items-center gap-2 mx-auto custom-scroll pr-4">
		<div class="min-h-60 max-h-96 overflow-y-scroll flex flex-col w-full px-10 py-8">
			{#each accounts as account}
				{#if !account.noDisplay}
					<BlockedLine {account} on:unblockAccount={unblockAccount}></BlockedLine>
				{/if}
			{/each}
		</div>
	</div>
</div>
