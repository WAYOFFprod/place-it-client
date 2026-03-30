<script lang="ts">
	import { onMount } from 'svelte';

	interface BeforeInstallPromptEvent extends Event {
		prompt(): Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
	}

	let installPrompt: BeforeInstallPromptEvent | null = null;
	let showBanner = $state(false);
	let dismissed = $state(false);

	onMount(() => {
		const handleBeforeInstall = (e: Event) => {
			e.preventDefault();
			installPrompt = e as BeforeInstallPromptEvent;
			showBanner = true;
		};

		const handleAppInstalled = () => {
			showBanner = false;
			installPrompt = null;
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstall);
		window.addEventListener('appinstalled', handleAppInstalled);

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
			window.removeEventListener('appinstalled', handleAppInstalled);
		};
	});

	async function install() {
		if (!installPrompt) return;
		await installPrompt.prompt();
		const { outcome } = await installPrompt.userChoice;
		if (outcome === 'accepted') {
			showBanner = false;
		}
		installPrompt = null;
	}

	function dismiss() {
		dismissed = true;
		showBanner = false;
	}
</script>

{#if showBanner && !dismissed}
	<div
		class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-white border-2 border-black rounded shadow-[3px_3px_0px_#000]"
	>
		<img src="/icons/icon-192x192.png" alt="Place-it icon" class="w-8 h-8" />
		<span class="text-sm font-semibold">Install Place-it</span>
		<button
			onclick={install}
			class="px-3 py-1 text-sm font-bold bg-[#F4DE5B] border-2 border-black rounded hover:bg-[#f0d43a] active:translate-y-px"
		>
			Install
		</button>
		<button
			onclick={dismiss}
			aria-label="Dismiss install banner"
			class="text-gray-500 hover:text-black text-lg leading-none"
		>
			✕
		</button>
	</div>
{/if}
