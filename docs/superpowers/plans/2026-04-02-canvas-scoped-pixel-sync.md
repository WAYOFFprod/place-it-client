# Canvas-Scoped Pixel Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move pixel sync from global layout to per-canvas scope, with a centered sync overlay showing spinner → checkmark → fade.

**Architecture:** Split `syncPending` so canvas creations sync globally (layout) and pixel queue syncs per-canvas (canvas page). New `SyncOverlay.svelte` component handles the visual feedback.

**Tech Stack:** SvelteKit (Svelte 5 runes), Tailwind CSS, IndexedDB via `idb`

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/lib/utility/OfflineSync.ts` | Export `syncPendingCreations` and `syncPixelQueueForCanvas` separately |
| Modify | `src/routes/+layout.svelte` | Call only `syncPendingCreations` on reconnect |
| Create | `src/lib/components/SyncOverlay.svelte` | Centered overlay: spinner → checkmark → fade |
| Modify | `src/lib/utility/OfflineStorage.ts` | Add `hasQueuedPixelsForCanvas(canvasId)` method |
| Modify | `src/routes/canva/+page.svelte` | Mount `SyncOverlay` when canvas is loaded |

---

### Task 1: Add `hasQueuedPixelsForCanvas` to OfflineStorage

**Files:**
- Modify: `src/lib/utility/OfflineStorage.ts:122-132`

- [ ] **Step 1: Add the method to OfflineStorage**

Add after `hasQueuedPixels` (line 127) in the `OfflineStorage` object:

```typescript
async hasQueuedPixelsForCanvas(canvasId: number): Promise<boolean> {
    const db = await getDb();
    const tx = db.transaction('pixelQueue', 'readonly');
    const index = tx.store.index('byCanvasId');
    const count = await index.count(IDBKeyRange.only(canvasId));
    await tx.done;
    return count > 0;
},
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd place-it-client && npx tsc --noEmit`
Expected: No errors related to OfflineStorage

- [ ] **Step 3: Commit**

```bash
git add src/lib/utility/OfflineStorage.ts
git commit -m "feat: add hasQueuedPixelsForCanvas to OfflineStorage"
```

---

### Task 2: Split OfflineSync exports

**Files:**
- Modify: `src/lib/utility/OfflineSync.ts`

- [ ] **Step 1: Export `syncPendingCreations` as a standalone public function**

Replace the current file content with:

```typescript
import { OfflineStorage } from './OfflineStorage';
import { event } from '$lib/stores/eventStore';
import { userStore } from '$lib/stores/authStore';
import { get } from 'svelte/store';
import Networker from './Networker';

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
	const networker = Networker.getInstance();
	const user = get(userStore);
	if (!user) return;

	const entries = await OfflineStorage.drainPixelsForCanvas(canvasId);
	if (entries.length === 0) return;

	try {
		if (!networker.socket || !networker.socket.connected) {
			await waitForSocket(networker);
		}

		const width = await OfflineStorage.getCanvasWidth(user.id, canvasId);
		if (!width) {
			console.warn(`[OfflineSync] Could not find width for canvas ${canvasId}`);
			return;
		}

		const pixels: { [key: string]: string } = {};
		for (const { value } of entries) {
			const index = value.x + width * value.y;
			pixels[index] = value.color;
		}
		networker.placePixelsByIndex(pixels, canvasId);

		for (const { key } of entries) {
			await OfflineStorage.deletePixelQueueEntry(key);
		}
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
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd place-it-client && npx tsc --noEmit`
Expected: No errors in OfflineSync.ts

- [ ] **Step 3: Commit**

```bash
git add src/lib/utility/OfflineSync.ts
git commit -m "refactor: split OfflineSync into creation and per-canvas pixel sync"
```

---

### Task 3: Update layout to only sync creations

**Files:**
- Modify: `src/routes/+layout.svelte`

- [ ] **Step 1: Replace `syncPending` import and call with `syncPendingCreations`**

Replace the full `<script>` block:

```svelte
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
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd place-it-client && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/routes/+layout.svelte
git commit -m "refactor: layout only syncs canvas creations on reconnect"
```

---

### Task 4: Create SyncOverlay component

**Files:**
- Create: `src/lib/components/SyncOverlay.svelte`

- [ ] **Step 1: Create the component**

Create `src/lib/components/SyncOverlay.svelte`:

```svelte
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
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd place-it-client && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/SyncOverlay.svelte
git commit -m "feat: add SyncOverlay component with spinner and checkmark states"
```

---

### Task 5: Mount SyncOverlay in canvas page

**Files:**
- Modify: `src/routes/canva/+page.svelte`

- [ ] **Step 1: Add SyncOverlay import**

Add after the existing imports (line 10):

```typescript
import SyncOverlay from '$lib/components/SyncOverlay.svelte';
```

- [ ] **Step 2: Add the SyncOverlay inside the canvas block**

Replace the `{#if canva}` block (line 89) with:

```svelte
		{#if canva}
			<SyncOverlay canvasId={canva.id} />
			<Canva {canva} viewOnly={false} marginBottom={52}></Canva>
```

This places the overlay as a sibling of the `<Canva>` component inside the `relative` flex container, so it centers over the canvas area.

- [ ] **Step 3: Verify no TypeScript errors**

Run: `cd place-it-client && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Manual test**

1. Open the app, go to a canvas, place some pixels
2. Go offline (DevTools Network → Offline), place more pixels
3. Go back online — verify no global sync fires
4. Navigate away and back to the canvas — verify the overlay shows spinner → checkmark → fades
5. Open a canvas with no pending pixels — verify no overlay appears

- [ ] **Step 5: Commit**

```bash
git add src/routes/canva/+page.svelte
git commit -m "feat: mount SyncOverlay on canvas page for per-canvas pixel sync"
```
