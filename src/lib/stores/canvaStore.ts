

// NOTE:NOT USED YET

import { writable } from 'svelte/store';

const activeCanva = writable<number>(-1);
const zoom = writable<number>(1);
const mouseCoord = writable<Coord | undefined>(undefined);
const isReady = writable<boolean>(false);

export {
  activeCanva,
  zoom,
  mouseCoord,
  isReady
}
