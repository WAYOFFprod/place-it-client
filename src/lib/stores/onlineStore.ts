import { readable } from 'svelte/store';

/**
 * Reactive store that tracks whether the browser currently has network connectivity.
 * Initialises to `navigator.onLine` and updates on the native `online`/`offline` events.
 */
const isOnline = readable<boolean>(
	// SSR guard: navigator is not available server-side
	typeof navigator !== 'undefined' ? navigator.onLine : true,
	(set) => {
		if (typeof window === 'undefined') return;

		const setOnline = () => set(true);
		const setOffline = () => set(false);

		window.addEventListener('online', setOnline);
		window.addEventListener('offline', setOffline);

		return () => {
			window.removeEventListener('online', setOnline);
			window.removeEventListener('offline', setOffline);
		};
	}
);

export { isOnline };
