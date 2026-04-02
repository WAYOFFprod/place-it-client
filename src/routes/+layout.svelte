<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { isOnline } from '$lib/stores/onlineStore';
	import { syncPendingCreations } from '$lib/utility/OfflineSync';
	import PwaInstall from '$lib/components/pwaInstall.svelte';

	let previouslyOnline = true;

	onMount(() => {
		const unsub = isOnline.subscribe((online) => {
			if (online && !previouslyOnline) {
				syncPendingCreations();
			}
			previouslyOnline = online;
		});
		return unsub;
	});
</script>

<slot />
<PwaInstall />
