import { writable } from 'svelte/store';

const state = writable('');
const modalState = writable(open);

export {
  state,
  modalState
}