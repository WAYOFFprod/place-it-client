<script lang="ts">
	import { tick, onDestroy } from 'svelte';
	import ToggleButton from './toggleButton.svelte';
	import { settingsInputState } from '$lib/stores/settingsInputState';

	interface Props {
		id: string;
		label: string;
		placeholder?: string;
		type?: string;
		value?: string;
		field: string;
		disabled?: boolean;
		saveField: (data: SettingOption) => void;
	}

	let {
		id,
		placeholder = '',
		label,
		type = 'text',
		value = '',
		field,
		disabled = false,
		saveField
	}: Props = $props();

	let input: HTMLInputElement;

	let editable = $state(false);
	let buttonLabel = $state('Modifier');

	const setEditable = async () => {
		await tick();
		input.focus();
	};
	const save = () => {
		const data = { field: field, value: value } as SettingOption;
		saveField(data);
	};
	const discard = () => {
		console.log('discard');
	};

	const unsubscribeSettingsInput = settingsInputState.subscribe((newSetting) => {
		if (newSetting == id) {
			buttonLabel = 'Enregistrer';
			setEditable();
			editable = true;
		} else {
			if (editable) {
				editable = false;
				buttonLabel = 'Modifier';
				if (newSetting == '') {
					save();
				} else {
					discard();
				}
			}
		}
	});

	const change = async () => {
		if (editable) {
			settingsInputState.set('');
			buttonLabel = 'Modifier';
		} else {
			settingsInputState.set(id);
			buttonLabel = 'Enregistrer';
		}
	};

	onDestroy(() => {
		unsubscribeSettingsInput();
	});
</script>

<div class="flex justify-between">
	<div>
		<label class="block mb-2" for={id}>{label}</label>
		<input
			bind:this={input}
			{id}
			name={id}
			{type}
			{placeholder}
			disabled={!editable || disabled}
			{value}
			class="border-b-2 autofill:border-tea-rose border-black bg-transparent focus:border-fluorescent-cyan-focus w-full pb-1 min-w-5 disabled:border-transparent"
		/>
	</div>
	<ToggleButton
		classInactive="bg-white"
		classActive="bg-fluorescent-cyan-focus"
		id="{id}-edit"
		toggle={editable}
		{disabled}
		{change}
	>
		{#snippet content()}
			<span>{buttonLabel}</span>
		{/snippet}
	</ToggleButton>
</div>
