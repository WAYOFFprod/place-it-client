import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

interface OfflineDB extends DBSchema {
	/** Cached canvas list per user. Key = userId (number). */
	canvasList: {
		key: number;
		value: { userId: number; canvas: CanvaPreviewData[] };
	};
	/** Cached pixel grid + participation token per canvas. Key = canvasId (number). */
	canvasGrids: {
		key: number;
		value: { canvasId: number; grid: { [key: string]: string }; token: string | undefined };
	};
	/** Queue of pixels to emit when back online. Auto-increment key. */
	pixelQueue: {
		key: number;
		value: { canvasId: number; x: number; y: number; color: string; timestamp: number };
		indexes: { byCanvasId: number };
	};
	/** Canvas creation payloads to POST when back online. Auto-increment key. */
	pendingCreations: {
		key: number;
		value: { tempId: string; payload: CreateCanvaPayload; createdAt: number };
	};
}

// ---------------------------------------------------------------------------
// DB singleton
// ---------------------------------------------------------------------------

let dbPromise: Promise<IDBPDatabase<OfflineDB>> | null = null;

const getDb = (): Promise<IDBPDatabase<OfflineDB>> => {
	if (!dbPromise) {
		dbPromise = openDB<OfflineDB>('place-it-offline', 1, {
			upgrade(db) {
				db.createObjectStore('canvasList', { keyPath: 'userId' });
				db.createObjectStore('canvasGrids', { keyPath: 'canvasId' });
				const pixelQueueStore = db.createObjectStore('pixelQueue', { autoIncrement: true });
				pixelQueueStore.createIndex('byCanvasId', 'canvasId');
				db.createObjectStore('pendingCreations', { autoIncrement: true });
			}
		});
	}
	return dbPromise!;
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const OfflineStorage = {
	// ---- Canvas list --------------------------------------------------------

	async saveCanvasList(userId: number, canvas: CanvaPreviewData[]): Promise<void> {
		const db = await getDb();
		console.log(`save canvas ${canvas.map(canva => canva.id).join(",")} ` )
		await db.put('canvasList', { userId, canvas });
	},

	async loadCanvasList(userId: number): Promise<CanvaPreviewData[]> {
		const db = await getDb();
		const entry = await db.get('canvasList', userId);
		return entry?.canvas ?? [];
	},

	// ---- Pixel cache ---------------------------------------------------

	async savePixelLocally(
		canvasId: number,
		grid: { [key: string]: string },
	): Promise<void> {
		const db = await getDb();
		await db.put('canvasGrids', { canvasId, grid  });
	},

	async loadCanvasCache(
		canvasId: number
	): Promise<{ grid: { [key: string]: string }; token: string | undefined } | null> {
		const db = await getDb();
		const entry = await db.get('canvasGrids', canvasId);
		if (!entry) return null;
		return { grid: entry.grid, token: entry.token };
	},

	// ---- Pixel queue --------------------------------------------------------

	async enqueuePixel(item: { canvasId: number; x: number; y: number; color: string }): Promise<void> {
		const db = await getDb();
		await db.add('pixelQueue', { ...item, timestamp: Date.now() });
	},

	/** Returns all queued pixels for a specific canvas, grouped ready to emit. */
	async getPixelsForCanvas(
		canvasId: number
	): Promise<{ key: number; value: { canvasId: number; x: number; y: number; color: string; timestamp: number } }[]> {
		const db = await getDb();
		const tx = db.transaction('pixelQueue', 'readonly');
		const index = tx.store.index('byCanvasId');
		const entries: {
			key: number;
			value: { canvasId: number; x: number; y: number; color: string; timestamp: number };
		}[] = [];
		let cursor = await index.openCursor(IDBKeyRange.only(canvasId));
		while (cursor) {
			entries.push({ key: cursor.primaryKey, value: cursor.value });
			cursor = await cursor.continue();
		}
		await tx.done;
		return entries;
	},

	async deletePixelQueueEntry(key: number): Promise<void> {
		const db = await getDb();
		await db.delete('pixelQueue', key);
	},

	async hasQueuedPixels(): Promise<boolean> {
		const db = await getDb();
		const count = await db.count('pixelQueue');
		return count > 0;
	},

	async hasQueuedPixelsForCanvas(canvasId: number): Promise<number> {
		const db = await getDb();
		const tx = db.transaction('pixelQueue', 'readonly');
		const index = tx.store.index('byCanvasId');
		const count = await index.count(IDBKeyRange.only(canvasId));
		await tx.done;
		return count;
	},

	async getAllQueuedCanvasIds(): Promise<number[]> {
		const db = await getDb();
		const all = await db.getAll('pixelQueue');
		return [...new Set(all.map((p) => p.canvasId))];
	},

	// ---- Pending creations --------------------------------------------------

	async enqueuePendingCreation(payload: CreateCanvaPayload): Promise<string> {
		const db = await getDb();
		const tempId = `offline_${Date.now()}`;
		await db.add('pendingCreations', { tempId, payload, createdAt: Date.now() });
		return tempId;
	},

	async getAllPendingCreations(): Promise<
		{ key: number; tempId: string; payload: CreateCanvaPayload }[]
	> {
		const db = await getDb();
		const tx = db.transaction('pendingCreations', 'readonly');
		const all = await tx.store.getAll();
		const keys = await tx.store.getAllKeys();
		await tx.done;
		return all.map((val, i) => ({ key: keys[i], ...val }));
	},

	async deletePendingCreation(key: number): Promise<void> {
		const db = await getDb();
		await db.delete('pendingCreations', key);
	},

	async getCanvasWidth(userId: number, canvasId: number): Promise<number | null> {
		const canvas = await this.loadCanvasList(userId);
		const found = canvas.find((c) => c.id === canvasId);
		return found?.width ?? null;
	},

	/** After an offline-created canvas gets a real server ID, update the canvas list. */
	async replaceTempIdInCanvasList(userId: number, tempId: string, realCanvas: CanvaPreviewData): Promise<void> {
		const db = await getDb();
		const entry = await db.get('canvasList', userId);
		if (!entry) return;
		entry.canvas = entry.canvas.map((c) => ((c as any).tempId === tempId ? realCanvas : c));
		await db.put('canvasList', entry);
	}
};
