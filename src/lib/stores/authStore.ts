import { writable } from 'svelte/store';

const authStatus = writable<undefined | boolean>(undefined);
const userStore = writable<undefined | User>(undefined);
const tokenStore = writable<undefined | string>(undefined);
export { authStatus, userStore, tokenStore };
