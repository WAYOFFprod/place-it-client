# Canvas-Scoped Pixel Sync

## Problem

The current `syncPending` in `+layout.svelte` fires globally when going online, but `syncPixelQueue` needs a WebSocket token that is only available when the user is on a canvas page (`/canva?id=<id>`). Attempting to sync pixels without a token fails silently.

## Design

### 1. Split sync triggers

- **Canvas creations** (`syncPendingCreations`): Continue syncing globally from `+layout.svelte` on online transition. These are plain POST requests and don't need a WebSocket token.
- **Pixel queue** (`syncPixelQueue`): Move to the canvas page. Sync only when the user opens a canvas that has pending pixels, after the token has been retrieved.

### 2. Layout changes (`+layout.svelte`)

Remove `syncPending()` call. Replace with a new `syncPendingCreations()` export that only handles canvas creation sync. Keep the `isOnline` subscription for this purpose.

### 3. OfflineSync changes (`OfflineSync.ts`)

- Export `syncPendingCreations` directly (currently private).
- Export `syncPixelQueue` directly (currently private).
- `syncPending` can be removed or kept as a convenience wrapper.

### 4. Canvas page changes (`/canva/+page.svelte`)

After the canvas loads and the token is retrieved from the server:
1. Mount `SyncOverlay` component, passing the canvas ID.
2. The overlay checks for pending pixels and triggers sync if needed.

### 5. New component: `SyncOverlay.svelte`

**Location:** `src/lib/components/SyncOverlay.svelte`

**Props:**
- `canvasId: number` — the current canvas ID

**Behavior:**
1. On mount, calls `OfflineStorage.getAllQueuedCanvasIds()` and checks if `canvasId` is in the list.
2. If no pending pixels: renders nothing.
3. If pending pixels exist:
   - Shows a centered floating overlay with a spinning sync icon.
   - Calls `syncPixelQueue` (scoped to this canvas) automatically.
   - On success: replaces spinner with a checkmark icon for ~1.5s.
   - Then fades out and unmounts.

**Styling:**
- Absolute positioned, centered on the canvas.
- Semi-transparent background behind the icon.
- CSS fade-out transition.

### 6. Data flow

```
User opens /canva?id=X
  -> token retrieved from server (existing flow)
  -> SyncOverlay mounts
  -> checks OfflineStorage for queued pixels for canvas X
  -> if pending: spinner -> syncPixelQueue(X) -> checkmark (1.5s) -> fade out
  -> if none: renders nothing
```

### 7. What stays the same

- `syncPendingCreations` still fires globally from layout on reconnect.
- Pixel queueing in `savePixel()` is unchanged.
- Offline canvas grid caching is unchanged.
- `OfflineStorage` internals stay the same.
