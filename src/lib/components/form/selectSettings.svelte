<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte';
	import Select from './select.svelte';
	import ToggleButton from './toggleButton.svelte';
	import { settingsInputState } from '$lib/stores/settingsInputState';

	const dispatch = createEventDispatcher<SaveFieldEvent>();

	export let id: string;
	export let placeholder: string = '';
	export let value: string;
	export let field: string;

	let languages = [
		{ label: 'Francais', value: 'fr' },
		{ label: 'Anglais', value: 'en' }
	];

	let editable = false;
	let buttonLabel = 'Modifier';

	const setEditable = async () => {};
	const save = () => {
		const data = { field: field, value: value } as SettingOption;
	};
	const discard = () => {
		console.log('discard');
	};

	settingsInputState.subscribe((newSetting) => {
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
		class="min-w-36"
		{id}
		{placeholder}
		options={languages}
		disabled={!editable}
		selectedOption={value}
	></Select>
	<ToggleButton
		classInactive="bg-white"
		classActive="bg-fluorescent-cyan-focus"
		label={buttonLabel}
		id="{id}-edit"
		toggle={editable}
		on:change={change}
	></ToggleButton>
</div>
