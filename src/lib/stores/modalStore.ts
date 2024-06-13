import { writable } from 'svelte/store';

const openedModal = writable('');

export {
  openedModal
}