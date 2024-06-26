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

	const dispatch = createEventDispatcher();
	let form: HTMLFormElement;
	let customPalette = true;
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

	const validate = async () => {
		const formData = new FormData(form);
		console.log([...formData.entries()]);
		const width = formData.get('width') as string;
		const height = formData.get('height') as string;
		const name = formData.get('name') as string;
		const joinRequest = formData.get('joinRequest') as string;
		const community = formData.get('community') as string;
		const category = formData.get('gameType') as string;
		if (width == null || height == null) return;
		const payload = {
			name: name,
			category: category,
			access: joinRequest ? 'request_only' : 'closed',
			visibility: community ? 'public' : 'private',
			width: parseInt(width),
			height: parseInt(height),
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
		const canva = await networker.createCanva(payload);
		dispatch('close');
		event.set('clearCanva');
	};
</script>

<div class="">
	<!-- header -->
	<div class="border-b-2 border-black py-5 text-center font-sans font-bold text-3xl uppercase">
		Créer un nouveau canva
	</div>
	<!-- container -->
	<div class="flex flex-row gap-[2px] bg-off-white justify-stretch">
		<!-- canvas type -->
		<div class="flex justify-center border-r-2 p-6 border-black">
			<div class="grid grid-cols-2 gap-2 justify-around p-2">
				<CanvaTypeToggle toggleName="canva-type"
					><img src="/svg/custom-canva.png" alt="custom canvas icon" /></CanvaTypeToggle
				>
				<CanvaTypeToggle toggleName="canva-type"
					><img src="/svg/custom-canva.png" alt="custom canvas icon" /></CanvaTypeToggle
				>
				<CanvaTypeToggle toggleName="canva-type"
					><img src="/svg/custom-canva.png" alt="custom canvas icon" /></CanvaTypeToggle
				>
			</div>
		</div>
		<!-- sidebar: canvas settings -->
		<form bind:this={form} class="w-64 p-6 flex flex-col gap-4" on:submit|preventDefault={validate}>
			<TextInput id="name" label="Nom"><img src="/svg/edit.svg" alt="edit icon" /></TextInput>
			<div>
				<label class="block mb-3" for="width">Dimensions</label>
				<div class="flex flex-row gap-2">
					<NumberInput id="width" label="W:" inputValue={64}></NumberInput>
					<NumberInput id="height" label="H:" inputValue={64}></NumberInput>
				</div>
			</div>
			<ToggleInput id="community" label="Community" />
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
					></Select>
				</div>
			</Accordion>
			<div class="grow justify-self-stretch flex items-end">
				<Button type="submit" class="" on:click={validate}>
					<img src="/svg/canva-plus.svg" alt="create canvas icon" />
					<span>Créer</span>
				</Button>
			</div>
		</form>
	</div>
</div>
