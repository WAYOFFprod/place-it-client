import { OfflineStorage } from './OfflineStorage';
import { event } from '$lib/stores/eventStore';
import { userStore } from '$lib/stores/authStore';
import { get } from 'svelte/store';
import Networker from './Networker';

/**
 * Fired when the browser transitions from offline → online.
 * Drains the pixel queue and pending canvas creations in order.
 */
export const syncPending = async (): Promise<void> => {
	const networker = Networker.getInstance();
	const user = get(userStore);
	if (!user) return; // only sync when authenticated

	await syncPendingCreations(networker, user.id);
	await syncPixelQueue(networker);

	// Refresh the dashboard so newly-synced canvas appear with real IDs
	event.set('updateCanvas');
};

// ---------------------------------------------------------------------------
// Pending canvas creations
// ---------------------------------------------------------------------------

const syncPendingCreations = async (networker: Networker, userId: number): Promise<void> => {
	const pending = await OfflineStorage.getAllPendingCreations();
	for (const item of pending) {
		try {
			const result: any = await networker.createCanva(item.payload);
			if (result?.status === 201) {
				const realCanvas: CanvaPreviewData = result.response.data;
				await OfflineStorage.replaceTempIdInCanvasList(userId, item.tempId, realCanvas);
				await OfflineStorage.deletePendingCreation(item.key);
			}
		} catch (err) {
			console.warn('[OfflineSync] Failed to sync canvas creation:', err);
		}
	}
};

// ---------------------------------------------------------------------------
// Pixel queue
// ---------------------------------------------------------------------------

const syncPixelQueue = async (networker: Networker): Promise<void> => {
	const user = get(userStore);
	if (!user) return;

	const canvasIds = await OfflineStorage.getAllQueuedCanvasIds();

	for (const canvasId of canvasIds) {
		const entries = await OfflineStorage.drainPixelsForCanvas(canvasId);
		if (entries.length === 0) continue;

		try {
			// Ensure we're connected and in the room
			if (!networker.socket || !networker.socket.connected) {
				await waitForSocket(networker);
			}

			const width = await OfflineStorage.getCanvasWidth(user.id, canvasId);
			if (!width) {
				console.warn(`[OfflineSync] Could not find width for canvas ${canvasId}`);
				continue;
			}

			// Build a pixel map in the format the server expects: { index: "color" }
			const pixels: { [key: string]: string } = {};
			for (const { value } of entries) {
				const index = value.x + width * value.y;
				pixels[index] = value.color;
			}
			networker.placePixelsByIndex(pixels, canvasId)

			// Delete the drained entries
			for (const { key } of entries) {
				await OfflineStorage.deletePixelQueueEntry(key);
			}
		} catch (err) {
			console.warn(`[OfflineSync] Failed to sync pixels for canvas ${canvasId}:`, err);
		}
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
