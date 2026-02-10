<script lang="ts">
	import type { VersionChangeEntry } from './types';

	export let versionChanges: VersionChangeEntry;
</script>

<h2 class="mt-2">{versionChanges[0]}</h2>
<ul class="pl-4 pt-1 list-disc">
	{#each versionChanges[1] as change}
		<li>{change}</li>
	{/each}
</ul>
