<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { isOnline } from '$lib/stores/onlineStore';
	import { syncPending } from '$lib/utility/OfflineSync';
	import PwaInstall from '$lib/components/pwaInstall.svelte';

	let previouslyOnline = true;

	onMount(() => {
		// Trigger a sync every time we come back online
		const unsub = isOnline.subscribe((online) => {
			if (online && !previouslyOnline) {
				syncPending();
			}
			previouslyOnline = online;
		});
		return unsub;
	});
</script>

<slot />
<PwaInstall />
