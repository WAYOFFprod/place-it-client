<script lang="ts">
	import { createEventDispatcher, tick, onMount, onDestroy } from 'svelte';
	import Button from './button.svelte';
	import ToggleButton from './toggleButton.svelte';
	import { settingsInputState } from '$lib/stores/settingsInputState';

	const dispatch = createEventDispatcher<SaveFieldEvent>();

	export let id: string;
	export let placeholder: string = '';
	export let label: string;
	export let type: string = 'text';
	export let value: string = '';
	export let field: string;

	let input: HTMLInputElement;

	let editable = false;
	let buttonLabel = 'Modifier';

	const setEditable = async () => {
		await tick();
		input.focus();
	};
	const save = () => {
		const data = { field: field, value: value } as SettingOption;
		dispatch('saveField', data);
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
			disabled={!editable}
			{value}
			class="border-b-2 autofill:border-tea-rose border-black bg-transparent focus:border-fluorescent-cyan-focus w-full pb-1 min-w-5 disabled:border-transparent"
		/>
	</div>
	<ToggleButton
		classInactive="bg-white"
		classActive="bg-fluorescent-cyan-focus"
		label={buttonLabel}
		id="{id}-edit"
		toggle={editable}
		on:change={change}
	></ToggleButton>
</div>
