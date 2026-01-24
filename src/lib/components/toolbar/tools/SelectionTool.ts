import { ToolType } from '$lib/stores/toolStore';
import Tool from '../ToolClass';
import SelectionIcon from '$lib/icons/selection.svelte';

export default class SelectionTool extends Tool {
	static cursor = 'selection';
	static type = ToolType.Selection;
	static icon = SelectionIcon;
	keyDown() {}

	keyUp() {}

	moveMouse(isMouseDown: boolean) {}

	getType: () => null | typeof Tool = () => {
		return SelectionTool;
	};
}
