<script lang="ts">
	import Login from '$lib/components/auth/login.svelte';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	const close = () => {
		dispatch('close');
	};
</script>

<div class="p-4 max-w-2xl min-w-96 bg-off-white">
	<Login on:close={close} />
</div>
