import { writable } from 'svelte/store';

const selectedColor = writable('');

export {
  selectedColor
}