<script lang="ts">
	import Select from './select.svelte';
	import ToggleButton from './toggleButton.svelte';
	import { settingsInputState } from '$lib/stores/settingsInputState';

	interface Props {
		id: string;
		placeholder: string;
		value?: string;
		field: string;
		saveField: (data: SettingOption) => void;
	}
	let { id, placeholder = '', value = '', field, saveField }: Props = $props();

	let languages = [
		{ label: 'Francais', value: 'fr' },
		{ label: 'Anglais', value: 'en' }
	];

	let editable = $state(false);
	let buttonLabel = $state('Modifier');

	const setEditable = async () => {};

	const save = () => {
		const data = { field: field, value: value } as SettingOption;
		saveField(data);
	};

	const discard = () => {
		console.log('discard');
	};

	settingsInputState.subscribe((newSetting: string) => {
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
</script>

<div class="flex justify-between">
	<Select
		className="min-w-36"
		{id}
		{placeholder}
		options={languages}
		disabled={!editable}
		selectedOption={value}
	></Select>
	<ToggleButton
		classInactive="bg-white"
		classActive="bg-fluorescent-cyan-focus"
		id="{id}-edit"
		toggle={editable}
		{change}
	>
		{#snippet content()}
			<span>{buttonLabel}</span>
		{/snippet}
	</ToggleButton>
</div>
