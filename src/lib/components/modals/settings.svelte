<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import SettingsTab from './settingsTab.svelte';
	import Account from './settings/account.svelte';
	import Friends from './settings/friends.svelte';

	const dispatch = createEventDispatcher();

	let tabForm: HTMLFormElement;

	let selectedTab: string = 'general';

	const selectTab = () => {
		const formData = new FormData(tabForm);
		selectedTab = formData.get('settings-tab') as string;
		switch (selectedTab) {
			default:
				break;
		}
	};

	const close = () => {
		dispatch('close');
	};
</script>

<div class="lg:w-[800px]">
	<!-- Header -->
	<div
		class="relative h-14 w-full border-b-2 border-black uppercase flex justify-center items-center"
	>
		<span>Règlage</span>
		<button aria-label="close" class="absolute right-4 top-4" on:click={close}>
			<img src="/svg/close.svg" alt="" />
		</button>
	</div>
	<div class="flex">
		<!-- Sidebar -->
		<form bind:this={tabForm} class="flex flex-col items-start border-r-2 border-black min-w-fit">
			<SettingsTab
				class="py-4 px-5"
				value="general"
				on:selectValue={selectTab}
				selectedValue={selectedTab}
				toggleName="settings-tab"
			>
				<img src="/svg/cursor.svg" alt="" />
				<span>Général</span>
			</SettingsTab>
			<SettingsTab
				class="py-4 px-5"
				value="friends"
				on:selectValue={selectTab}
				selectedValue={selectedTab}
				toggleName="settings-tab"
			>
				<img src="/svg/users.svg" alt="" />
				<span>Amis</span>
			</SettingsTab>
			<SettingsTab
				class="py-4 px-5"
				value="blocked"
				on:selectValue={selectTab}
				selectedValue={selectedTab}
				toggleName="settings-tab"
				disabled={true}
			>
				<img src="/svg/block.svg" alt="" />
				<span>Compte bloqués</span>
			</SettingsTab>
			<SettingsTab
				class="py-4 px-5"
				value="notification"
				on:selectValue={selectTab}
				selectedValue={selectedTab}
				toggleName="settings-tab"
				disabled={true}
			>
				<img src="/svg/alarm.svg" alt="" />
				<span>Notifications</span>
			</SettingsTab>
		</form>
		<!-- Window -->
		{#if selectedTab == 'general'}
			<Account on:close={close}></Account>
		{:else if selectedTab == 'friends'}
			<Friends on:close={close}></Friends>
		{/if}
	</div>
</div>
