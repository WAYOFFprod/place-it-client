<script lang="ts">
	import NumberInput from '../form/numberInput.svelte';
	import TextInput from '../form/textInput.svelte';
	import Button from '../form/button.svelte';
	import ToggleInput from '../form/toggleInput.svelte';
	import Select from '../form/select.svelte';
	import Accordion from '../layout/accordion.svelte';

	import CanvaTypeToggle from './canvaTypeToggle.svelte';
	import Networker from '$lib/utility/Networker';

	import { createEventDispatcher } from 'svelte';
	import { event } from '$lib/stores/eventStore';
	import { error } from '@sveltejs/kit';
	import type { Errors } from './types';

	const dispatch = createEventDispatcher();
	let form: HTMLFormElement;
	let presetForm: HTMLFormElement;
	let errors: null | Errors;
	let customPalette = true;
	let isCommunity = false;

	// default values
	let selectedPreset: string = 'small';
	let width: number = 64;
	let height: number = 64;
	let customSize: boolean = false;
	let community = false;

	const gameTypeOptions = [
		{
			label: 'Libre',
			value: 'free'
		},
		{
			label: 'Pixelwar',
			value: 'pixelwar'
		},
		{
			label: 'Oeuvre Collaborative',
			value: 'artistic'
		}
	] as options[];

	const selectedOption = {
		label: 'Libre',
		value: 'free'
	};

	const validate = async () => {
		const formData = new FormData(form);
		const formWidth = formData.get('width') as string;
		const formHeight = formData.get('height') as string;
		const saveWidth = customSize ? parseInt(formWidth) : width;
		const saveHeight = customSize ? parseInt(formHeight) : height;
		const name = formData.get('name') as string;
		const joinRequest = formData.get('joinRequest') as string;
		const community = formData.get('community') as string;
		const category = formData.get('gameType') as string;

		const payload = {
			name: name,
			category: category,
			access: joinRequest == 'on' ? 'request_only' : community ? 'open' : 'invite_only',
			visibility: community ? 'public' : 'private',
			width: saveWidth,
			height: saveHeight,
			colors: [
				'#ffd887',
				'#eb9361',
				'#da5e4e',
				'#ab2330',
				'#dfffff',
				'#b5de89',
				'#6aab7c',
				'#26616b',
				'#a2dceb',
				'#759ed0',
				'#434ea8',
				'#2a2140',
				'#e1a7c5',
				'#ab7ac6',
				'#735bab',
				'#3b3772'
			]
		} as CreateCanvaPayload;
		const networker = Networker.getInstance();
		const canva: any = await networker.createCanva(payload);

		if (canva?.status == 422) {
			errors = canva.response.errors as Errors;
		}
		if (canva?.status == 201) {
			dispatch('close');
			event.set('updateCanvas');
		}
	};

	const selectPreset = () => {
		const formData = new FormData(presetForm);
		selectedPreset = formData.get('canva-type') as string;
		switch (selectedPreset) {
			case 'small':
				width = 64;
				height = 64;
				customSize = false;
				break;
			case 'big':
				width = 512;
				height = 512;
				customSize = false;
				break;
			default:
				width = 64;
				height = 64;
				customSize = true;
				break;
		}
	};

	const toggleCommunity = () => {
		isCommunity = !isCommunity;
	};

	const close = () => {
		dispatch('close');
	};

	$: getError = (value: string) => {
		if (errors?.[value]) {
			return errors[value]?.[0];
		}
		return null;
	};
</script>

<div class="">
	<!-- header -->
	<div
		class="relative border-b-2 border-black py-5 text-center font-sans font-bold text-3xl uppercase"
	>
		<span>Créer un nouveau canva</span>
		<button class="absolute right-4 top-4" on:click={close}>
			<img src="/svg/close.svg" alt="" />
		</button>
	</div>
	<!-- container -->
	<div class="flex flex-row gap-[2px] bg-off-white justify-stretch">
		<!-- canvas type -->
		<div class="flex justify-center border-r-2 p-6 xl:px-10 border-black">
			<form bind:this={presetForm} class="grid grid-cols-2 gap-8 justify-around p-2">
				<CanvaTypeToggle
					toggleName="canva-type"
					value="small"
					selectedValue={selectedPreset}
					on:selectValue={selectPreset}
				>
					<img src="/svg/small-canva.svg" alt="" class="mb-2" />
					<span>Petit Canva</span>
					<span class="text-md">64 x 64</span>
				</CanvaTypeToggle>
				<CanvaTypeToggle
					toggleName="canva-type"
					value="big"
					selectedValue={selectedPreset}
					on:selectValue={selectPreset}
				>
					<img src="/svg/big-canva.svg" alt="" class="mb-2" />
					<span>Grand Canva</span>
					<span class="text-md">512 x 512</span>
				</CanvaTypeToggle>
				<CanvaTypeToggle
					toggleName="canva-type"
					disabled
					value="infinit"
					selectedValue={selectedPreset}
					on:selectValue={selectPreset}
				>
					<img src="/svg/infinit.svg" alt="" class="mb-2" />
					<span>Infini</span>
				</CanvaTypeToggle>
				<CanvaTypeToggle
					toggleName="canva-type"
					value="custom"
					selectedValue={selectedPreset}
					on:selectValue={selectPreset}
				>
					<img src="/svg/custom-canva.png" alt="" class="mb-2" />
					<span>Personalisé</span>
				</CanvaTypeToggle>
			</form>
		</div>
		<!-- sidebar: canvas settings -->
		<form bind:this={form} class="w-64 p-6 flex flex-col gap-4" on:submit|preventDefault={validate}>
			<TextInput id="name" label="Nom" error={getError('name')}
				><img src="/svg/edit.svg" alt="" /></TextInput
			>
			<div>
				<label class="block mb-3" for="width">Dimensions</label>
				<div class="flex flex-row gap-2">
					<NumberInput id="width" label="W" inputValue={width} disabled={!customSize}></NumberInput>
					<NumberInput id="height" label="H" inputValue={height} disabled={!customSize}
					></NumberInput>
				</div>
				{#if getError('height') || getError('width')}
					<span class="text-red-500 text-sm">{getError('height')}</span>
					<span class="text-red-500 text-sm">{getError('width')}</span>
				{/if}
			</div>
			<ToggleInput id="community" label="Community" on:change={toggleCommunity} />
			{#if isCommunity}
				<Accordion>
					<div slot="heading">Options Avancée</div>
					<div slot="content" class="flex flex-col gap-4">
						<ToggleInput id="joinRequest" label="Joindre sur demande" toggle={false} />
						<ToggleInput
							id="limitedPalette"
							label="Palette limitée"
							toggle={customPalette}
							on:change={() => (customPalette = !customPalette)}
						/>
						<Select
							id="gameType"
							label="Catégorie du canva"
							placeholder="Type de canva"
							options={gameTypeOptions}
							selectedOption={selectedOption.value}
							error={getError('category')}
						></Select>
					</div>
				</Accordion>
			{/if}
			<div class="grow justify-self-stretch flex items-end">
				<Button type="submit" class="" on:click={validate}>
					<img src="/svg/canva-plus.svg" alt="" />
					<span>Créer</span>
				</Button>
			</div>
		</form>
	</div>
</div>
