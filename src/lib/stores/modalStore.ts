import { writable } from 'svelte/store';

const openedModal = writable<ModalData>({ name: '' });

export { openedModal };
