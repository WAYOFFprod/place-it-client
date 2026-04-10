import type { CanvaPreviewData } from '$lib/components/types';
import type { CreateCanvaPayload } from '$lib/p5/types';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------


interface PixelData	{
	canvasId: number;
	x: number;
	y: number;
	color: string
}
interface OfflinePixel extends PixelData {
	timestamp: number
}
interface CachedPixels {
	canvasId: number;
	pixels: {
		[key: string]: string
	};
}

interface OfflineDB extends DBSchema {
	/** Cached canvas list per user. Key = userId (number). */
	canvasList: {
		key: number;
		value: { userId: number; canvas: CanvaPreviewData[] };
	};
	/** Cached pixels per canvas. Key = canvasId (number). */
	cachedPixels: {
		key: number;
		value: CachedPixels;
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
		dbPromise = openDB<OfflineDB>('place-it-offline', 2, {
			upgrade(db, oldVersion: number) {
				if (oldVersion < 1) {
					db.createObjectStore('canvasList', { keyPath: 'userId' });
					const pixelQueueStore = db.createObjectStore('pixelQueue', { autoIncrement: true });
					pixelQueueStore.createIndex('byCanvasId', 'canvasId');
					db.createObjectStore('pendingCreations', { autoIncrement: true });
				}
				if (oldVersion < 2) {
					db.createObjectStore('cachedPixels', { keyPath: 'canvasId' });
				}
			}
		});
	}
	return dbPromise!;
};

// ---------------------------------------------------------------------------
// In-memory pixel buffer — batches writes, flushes to IndexedDB periodically
// ---------------------------------------------------------------------------

const FLUSH_INTERVAL_MS = 3000;

const pendingPixels: Map<number, { [key: string]: string }> = new Map();
let flushTimer: ReturnType<typeof setInterval> | null = null;

function startFlushTimer(): void {
	if (flushTimer) return;
	flushTimer = setInterval(flushPendingPixels, FLUSH_INTERVAL_MS);
}

async function flushPendingPixels(): Promise<void> {
	if (pendingPixels.size === 0) return;
	const db = await getDb();
	for (const [canvasId, pixels] of pendingPixels) {
		try {
			const existing = await db.get('cachedPixels', canvasId);
			const merged = { ...existing?.pixels, ...pixels };
			await db.put('cachedPixels', { canvasId, pixels: merged });
		} catch {
			await db.put('cachedPixels', { canvasId, pixels });
		}
	}
	pendingPixels.clear();
}

if (typeof window !== 'undefined') {
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'hidden') flushPendingPixels();
	});
	window.addEventListener('beforeunload', () => flushPendingPixels());
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const OfflineStorage = {
	// ---- Canvas list --------------------------------------------------------

	async saveCanvasList(userId: number, canvas: CanvaPreviewData[]): Promise<void> {
		const db = await getDb();
		console.lddog(`save canvas ${canvas.map(canva => canva.id).join(",")} ` )
		await db.put('canvasList', { userId, canvas });
	},

	async loadCanvasList(userId: number): Promise<CanvaPreviewData[]> {
		const db = await getDb();
		const entry = await db.get('canvasList', userId);
		return entry?.canvas ?? [];
	},

	// ---- Pixel cache ---------------------------------------------------

	savePixelLocally(
		canvasId: number,
		pixels: { [key: string]: string },
	): void {
		const existing = pendingPixels.get(canvasId) ?? {};
		pendingPixels.set(canvasId, { ...existing, ...pixels });
		startFlushTimer();
	},

	
	async loadCanvasCache(
		canvasId: number
	): Promise<{ [key: string]: string }> {
		try {
			const db = await getDb();
			const entry = await db.get('cachedPixels', canvasId);
			const stored = entry?.pixels ?? {};
			const buffered = pendingPixels.get(canvasId) ?? {};
			return { ...stored, ...buffered };
		} catch {
			return {};
		}
	},

	async hasCachedPixels(canvasId: number): Promise<number> {
		const buffered = pendingPixels.get(canvasId);
		if (buffered && Object.keys(buffered).length > 0) return Object.keys(buffered).length;
		try {
			const db = await getDb();
			const entry = await db.get('cachedPixels', canvasId);
			return entry ? Object.keys(entry.pixels).length : 0;
		} catch {
			return 0;
		}
	},
	
	
	flushPixelBuffer: flushPendingPixels,

	async clearCachedPixels(canvasId: number): Promise<void> {
		const db = await getDb();
		await db.delete('cachedPixels', canvasId);
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
		return all.map((val: { tempId: string; payload: CreateCanvaPayload; createdAt: number }, i: number) => ({ key: keys[i], ...val }));
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
		entry.canvas = entry.canvas.map((c: CanvaPreviewData) => ('tempId' in c && c.tempId === tempId ? realCanvas : c));
		await db.put('canvasList', entry);
	}
};
