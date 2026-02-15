<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import SettingsTab from './settingsTab.svelte';
	import Account from './settings/account.svelte';
	import Friends from './settings/friends.svelte';
	import Blocked from './settings/blocked.svelte';
	import Notifications from './settings/notifications.svelte';
	import { mdBreak } from '$lib/stores/tailwindStore';
	import { userStore } from '$lib/stores/authStore';

	interface Props {
		close?: () => void;
	}
	let { close }: Props = $props();

	// mobile only
	let isOnNav: boolean = $state(true);

	let selectedTab: string = $state('');

	let userName: string = $state('');
	const unsubscribeUser = userStore.subscribe((newUser) => {
		if (newUser == undefined) return;
		userName = newUser.name;
	});

	let isWindowSmall: boolean | undefined = $state(false);
	let md: number | undefined;

	mdBreak.subscribe((val) => {
		md = val;
		// initial size
		isWindowSmall = window.innerWidth >= md ? false : true;
		selectedTab = isWindowSmall ? '' : 'general';
	});

	let tabForm: HTMLFormElement | undefined = $state();

	const selectTab = () => {
		const formData = new FormData(tabForm);
		selectedTab = formData.get('settings-tab') as string;
		if (isWindowSmall) isOnNav = false;
	};

	const onClose = () => {
		close?.();
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
	<!-- Sidebar -->
	{#if isWindowSmall && isOnNav}
		<div class="w-40 flex flex-col items-center gap-2 mx-auto mt-8 mb-4">
			<div class="rounded-full w-36 h-36 border-2 border-black"></div>
		</div>
		<div class="self-center mb-8 text-xl">{userName}</div>
	{/if}
	<div class="flex flex-col md:flex-row">
		{#if !isWindowSmall || isOnNav}
			<form
				bind:this={tabForm}
				class="flex flex-col items-start md:border-r-2 border-black min-w-full md:min-w-fit h-full md:h-auto"
			>
				<SettingsTab
					className="py-4 px-8 md:px-5 border-t-2 md:border-t-0 border-black"
					value="general"
					selectValue={selectTab}
					selectedValue={selectedTab}
					toggleName="settings-tab"
				>
					{#snippet content()}
						<img src="/svg/cursor.svg" alt="" />
						<span>Général</span>
					{/snippet}
				</SettingsTab>
				<SettingsTab
					className="py-4 px-8 md:px-5"
					value="friends"
					selectValue={selectTab}
					selectedValue={selectedTab}
					toggleName="settings-tab"
				>
					{#snippet content()}
						<img src="/svg/users.svg" alt="" />
						<span>Amis</span>
					{/snippet}
				</SettingsTab>
				<SettingsTab
					className="py-4 px-8 md:px-5"
					value="blocked"
					selectValue={selectTab}
					selectedValue={selectedTab}
					toggleName="settings-tab"
				>
					{#snippet content()}
						<img src="/svg/block.svg" alt="" />
						<span>Compte bloqués</span>
					{/snippet}
				</SettingsTab>
				<SettingsTab
					className="py-4 px-8 md:px-5"
					value="notification"
					selectValue={selectTab}
					selectedValue={selectedTab}
					toggleName="settings-tab"
				>
					{#snippet content()}
						<img src="/svg/alarm.svg" alt="" />
						<span>Notifications</span>
					{/snippet}
				</SettingsTab>
			</form>
		{/if}
		<!-- Window -->
		{#if !isWindowSmall || !isOnNav}
			<div class="flex flex-col w-full md:min-h-0 h-full md:h-auto">
				{#if isWindowSmall && !isOnNav}
					<button
						class="border-black border-b-2 flex justify-between items-center px-4"
						onclick={() => {
							isOnNav = true;
							selectedTab = '';
						}}
					>
						<img class="rotate-180 my-4" src="/svg/chevron-right.svg" alt="" />
						<span>General</span>
					</button>
				{/if}
				{#if selectedTab == 'general'}
					<Account close={onClose}></Account>
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
