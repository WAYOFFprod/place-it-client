<script lang="ts">
	import NumberInput from "../form/numberInput.svelte";
	import TextInput from "../form/textInput.svelte";
	import ToggleInput from "../form/toggleInput.svelte";

	import CanvaTypeToggle from "./canvaTypeToggle.svelte";
</script>

<div class="">
  <!-- header -->
  <div class="border-b-2 border-black py-5 text-center font-sans font-bold text-3xl">
    Create a new Canvas
  </div>
  <!-- container -->
  <div class="flex flex-row gap-[2px] bg-off-white">
    <!-- canvas type -->
    <div class="flex justify-center border-r-2 p-6 border-black">
      <div class="grid grid-cols-2 gap-2 justify-around p-2">
        <CanvaTypeToggle toggleName="canva-type"><img src="icons/custom-canva.png" alt="custom canvas icon" /></CanvaTypeToggle>
        <CanvaTypeToggle toggleName="canva-type"><img src="icons/custom-canva.png" alt="custom canvas icon" /></CanvaTypeToggle>
        <CanvaTypeToggle toggleName="canva-type"><img src="icons/custom-canva.png" alt="custom canvas icon" /></CanvaTypeToggle>
      </div>
    </div>
    <!-- sidebar: canvas settings -->
    <form class="w-64 p-6 flex flex-col gap-4">
      <div>
        <TextInput id="name" label="name"><img src="icons/edit.svg" alt="edit icon"/></TextInput>
      </div>
      <div>
        <label class="block" for="width">Dimensions</label>
        <div class="flex flex-row gap-2">
          <NumberInput id="width" label="W:"></NumberInput>
          <NumberInput id="height" label="H:"></NumberInput>
        </div>
      </div>
      <div>
        <ToggleInput id="community" label="Community" />
      </div>
    </form>
  </div>
</div>