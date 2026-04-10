import { OfflineStorage } from './OfflineStorage';
import { event } from '$lib/stores/eventStore';
import { userStore } from '$lib/stores/authStore';
import { get } from 'svelte/store';
import Networker from './Networker';
import type { CanvaPreviewData } from '$lib/components/types';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Syncs pending canvas creations only.
 * Safe to call globally — uses plain HTTP, no WebSocket token needed.
 */
export const syncPendingCreations = async (): Promise<void> => {
	const networker = Networker.getInstance();
	const user = get(userStore);
	if (!user) return;

	const pending = await OfflineStorage.getAllPendingCreations();
	for (const item of pending) {
		try {
			const result: any = await networker.createCanva(item.payload);
			if (result?.status === 201) {
				const realCanvas: CanvaPreviewData = result.response.data;
				await OfflineStorage.replaceTempIdInCanvasList(user.id, item.tempId, realCanvas);
				await OfflineStorage.deletePendingCreation(item.key);
			}
		} catch (err) {
			console.warn('[OfflineSync] Failed to sync canvas creation:', err);
		}
	}

	// Refresh the dashboard so newly-synced canvas appear with real IDs
	event.set('updateCanvas');
};

/**
 * Syncs the pixel queue for a single canvas.
 * Must be called when on a canvas page with a valid WebSocket connection + token.
 */
export const syncPixelQueueForCanvas = async (canvasId: number): Promise<void> => {
	console.log("syncPixelQueueForCanvas")
	const networker = Networker.getInstance();
	const user = get(userStore);
	if (!user) return;

	const cachedPixels = await OfflineStorage.loadCanvasCache(canvasId);
	if(Object.keys(cachedPixels ?? {}).length === 0) return;

	try {
		if (!networker.socket || !networker.socket.connected) {
			await waitForSocket(networker);
		}

		const width = await OfflineStorage.getCanvasWidth(user.id, canvasId);
		if (!width) {
			console.warn(`[OfflineSync] Could not find width for canvas ${canvasId}`);
			return;
		}
		
		networker.placePixelsByIndex(cachedPixels, canvasId);

		console.log("clear pixel cach for", canvasId);
		OfflineStorage.clearCachedPixels(canvasId);

	} catch (err) {
		console.warn(`[OfflineSync] Failed to sync pixels for canvas ${canvasId}:`, err);
	}
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Waits up to 5 s for the socket to connect. */
const waitForSocket = (networker: Networker): Promise<void> => {
	return new Promise((resolve, reject) => {
		if (networker.socket?.connected) {
			resolve();
			return;
		}
		const timeout = setTimeout(() => reject(new Error('socket timeout')), 5000);
		networker.socket?.once('connect', () => {
			clearTimeout(timeout);
			resolve();
		});
	});
};
