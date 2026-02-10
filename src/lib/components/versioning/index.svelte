<script lang="ts">
	import Panel from '../layout/panel.svelte';
	import changeLogFile from '../../../data/changelog.json';
	import type { Versioning } from './types';
	import ChangeSection from './ChangeSection.svelte';

	let isClosed = false;
	const modalClosed = () => {
		isClosed = true;
	};
	const changelog: Versioning = changeLogFile;
	// get app version from local storage
	const localAppVersion = localStorage.getItem('appVersion');
	const changelogSinceLastVersion = Object.entries(changelog).filter(
		([version]) => version > (localAppVersion || '0.0.-1')
	);
	if (__APP_VERSION__ == localAppVersion) {
		// do nothing
	} else {
		localStorage.setItem('appVersion', __APP_VERSION__);
	}
</script>

{#if __APP_VERSION__ != localAppVersion && !isClosed}
	<div class="absolute inset-0 z-50 flex justify-center items-center backdrop-blur-sm">
		<Panel title="Update Available" class="m-8 w-fit">
			<div class="p-4 max-h-screen overflow-y-auto">
				<h1 class="mt-2 text-2xl uppercase">Version Update</h1>
				{#each changelogSinceLastVersion as versionDetail}
					<div class="mt-4">
						<h2 class="text-xl font-bold">{versionDetail[0]}</h2>
						<ul class="list-disc list-inside">
							{#each Object.entries(versionDetail[1]) as changeTypeEntry}
								<ChangeSection versionChanges={changeTypeEntry} />
							{/each}
						</ul>
					</div>
				{/each}
			</div>
			<button aria-label="close" class="absolute right-4 top-4" on:click={modalClosed}>
				<img src="/svg/close.svg" alt="" />
			</button>
		</Panel>
	</div>
{/if}
