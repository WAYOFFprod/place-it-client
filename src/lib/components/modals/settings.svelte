<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import SettingsTab from './settingsTab.svelte';
	import Account from './settings/account.svelte';
	import Friends from './settings/friends.svelte';
	import Blocked from './settings/blocked.svelte';
	import Notifications from './settings/notifications.svelte';
	import { mdBreak } from '$lib/stores/tailwindStore';
	import { userStore } from '$lib/stores/authStore';

	const dispatch = createEventDispatcher();
	// mobile only
	let isOnNav: boolean = true;

	let selectedTab: string = '';

	let userName: string = '';
	const unsubscribeUser = userStore.subscribe((newUser) => {
		if (newUser == undefined) return;
		userName = newUser.name;
	});

	let isWindowSmall: boolean | undefined = false;
	let md: number | undefined;

	mdBreak.subscribe((val) => {
		md = val;
		// initial size
		isWindowSmall = window.innerWidth >= md ? false : true;
		selectedTab = isWindowSmall ? '' : 'general';
	});

	let tabForm: HTMLFormElement;

	const selectTab = () => {
		const formData = new FormData(tabForm);
		selectedTab = formData.get('settings-tab') as string;
		if (isWindowSmall) isOnNav = false;
	};

	const close = () => {
		dispatch('close');
	};

	const onResize = () => {
		if (md) isWindowSmall = window.innerWidth >= md ? false : true;
	};

	onMount(() => {
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
		};
	});

	onDestroy(() => {
		unsubscribeUser();
	});
</script>

<div class="md:w-[800px]">
	<!-- Header -->
	<div
		class="relative h-14 w-full border-b-2 border-black uppercase flex justify-center items-center"
	>
		<span>Règlage</span>
		<button aria-label="close" class="absolute right-4 top-4" on:click={close}>
			<img src="/svg/close.svg" alt="" />
		</button>
	</div>
	<div
		class="overflow-scroll flex flex-col md:flex-row"
		style={isWindowSmall ? 'height: calc(100vh - 56px);' : ''}
	>
		<!-- Sidebar -->
		{#if isWindowSmall && isOnNav}
			<div class="w-40 flex flex-col items-center gap-2 mx-auto mt-8 mb-4">
				<div class="rounded-full w-36 h-36 border-2 border-black"></div>
			</div>
			<div class="self-center mb-8 text-xl">{userName}</div>
		{/if}
		{#if !isWindowSmall || isOnNav}
			<form
				bind:this={tabForm}
				class="flex flex-col items-start md:border-r-2 border-black min-w-full md:min-w-fit h-full md:h-auto"
			>
				<SettingsTab
					class="py-4 px-8 md:px-5 border-t-2 md:border-t-0 border-black"
					value="general"
					on:selectValue={selectTab}
					selectedValue={selectedTab}
					toggleName="settings-tab"
				>
					<img src="/svg/cursor.svg" alt="" />
					<span>Général</span>
				</SettingsTab>
				<SettingsTab
					class="py-4 px-8 md:px-5"
					value="friends"
					on:selectValue={selectTab}
					selectedValue={selectedTab}
					toggleName="settings-tab"
				>
					<img src="/svg/users.svg" alt="" />
					<span>Amis</span>
				</SettingsTab>
				<SettingsTab
					class="py-4 px-8 md:px-5"
					value="blocked"
					on:selectValue={selectTab}
					selectedValue={selectedTab}
					toggleName="settings-tab"
				>
					<img src="/svg/block.svg" alt="" />
					<span>Compte bloqués</span>
				</SettingsTab>
				<SettingsTab
					class="py-4 px-8 md:px-5"
					value="notification"
					on:selectValue={selectTab}
					selectedValue={selectedTab}
					toggleName="settings-tab"
				>
					<img src="/svg/alarm.svg" alt="" />
					<span>Notifications</span>
				</SettingsTab>
			</form>
		{/if}
		<!-- Window -->
		{#if !isWindowSmall || !isOnNav}
			<div class="flex flex-col w-full min-h-screen md:min-h-0 h-full md:h-auto">
				{#if isWindowSmall && !isOnNav}
					<button
						class="border-black border-b-2 flex justify-between items-center px-4"
						on:click={() => {
							isOnNav = true;
							selectedTab = '';
						}}
					>
						<img class="rotate-180 my-4" src="/svg/chevron-right.svg" alt="" />
						<span>General</span>
					</button>
				{/if}
				{#if selectedTab == 'general'}
					<Account on:close={close}></Account>
				{:else if selectedTab == 'friends'}
					<Friends></Friends>
				{:else if selectedTab == 'blocked'}
					<Blocked></Blocked>
				{:else if selectedTab == 'notification'}
					<Notifications></Notifications>
				{/if}
			</div>
		{/if}
	</div>
</div>
