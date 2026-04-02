<script lang="ts">
	import { onMount } from 'svelte';
	import { OfflineStorage } from '$lib/utility/OfflineStorage';
	import { syncPixelQueueForCanvas } from '$lib/utility/OfflineSync';

	interface Props {
		canvasId: number;
	}

	let { canvasId }: Props = $props();

	type SyncState = 'idle' | 'syncing' | 'done' | 'hidden';
	let state: SyncState = $state('idle');

	onMount(() => {
		checkAndSync();
	});

	const checkAndSync = async () => {
		const hasPending = await OfflineStorage.hasQueuedPixelsForCanvas(canvasId);
		if (!hasPending) {
			state = 'hidden';
			return;
		}

		state = 'syncing';
		try {
			await syncPixelQueueForCanvas(canvasId);
			state = 'done';
			setTimeout(() => {
				state = 'hidden';
			}, 1500);
		} catch (err) {
			console.warn('[SyncOverlay] Sync failed:', err);
			state = 'hidden';
		}
	};
</script>

{#if state !== 'idle' && state !== 'hidden'}
	<div
		class="absolute inset-0 flex items-center justify-center pointer-events-none z-50 transition-opacity duration-500"
		class:opacity-0={state === 'done'}
	>
		<div class="bg-black/60 rounded-2xl p-6 flex flex-col items-center gap-3">
			{#if state === 'syncing'}
				<svg class="w-10 h-10 text-white animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 12a9 9 0 1 1-6.22-8.56" stroke-linecap="round" />
				</svg>
				<span class="text-white text-sm">Synchronisation...</span>
			{:else if state === 'done'}
				<svg class="w-10 h-10 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				<span class="text-white text-sm">Synchronisé</span>
			{/if}
		</div>
	</div>
{/if}
