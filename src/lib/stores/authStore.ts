import { writable } from "svelte/store";

const authStatus = writable<undefined | boolean>(undefined)
const userStore = writable<User>(undefined)
export {
  authStatus,
  userStore
}