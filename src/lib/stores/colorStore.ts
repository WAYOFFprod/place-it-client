import { writable } from 'svelte/store';

const selectedColor = writable('');
const storedColors = writable<string[]>([]);

export { selectedColor, storedColors };
