import { writable } from 'svelte/store';

const chatMessages = writable<Message[]>([]);

export { chatMessages };
