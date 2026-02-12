<script lang="ts">
	interface Props {
		color: string;
		selected?: boolean;
		edit?: boolean;
		onclick: (event: MouseEvent) => void;
	}

	let { color, selected = false, edit = false, onclick }: Props = $props();
</script>

<button
	title={color}
	class="h-6 w-6 border-2"
	style="background-color: {color}; border-color:{!selected ? 'black' : edit ? '#49E8E0' : color}"
	{onclick}
></button>
