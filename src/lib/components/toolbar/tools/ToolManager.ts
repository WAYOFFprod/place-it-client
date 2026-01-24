import P5 from 'p5';
import Tool from '../ToolClass';
import { destroyActiveTool, selectedTool, setToolset } from '$lib/stores/toolStore';
import ControlManager from '../ControlManager';
import { isWindowSmall } from '$lib/stores/tailwindStore';

export default class ToolManager {
	p5: P5;
	activeTool: Tool | undefined;
	activeToolType: typeof Tool = Tool;
	unsubscribeTool: () => void;
	controlManager: ControlManager;
	constructor(p5: P5, viewOnly: boolean) {
		this.controlManager = ControlManager.getInstance();
		this.p5 = p5;
		isWindowSmall.subscribe((isSmall) => {
			if (viewOnly) {
				setToolset('view-only', p5);
			} else if (isSmall === true) {
				setToolset('mobile', p5);
			} else if (isSmall === false) {
				setToolset('desktop', p5);
			} else {
				console.warn('No toolset found');
			}
		});

		this.unsubscribeTool = selectedTool.subscribe((newTool: Tool | undefined) => {
			if (newTool == undefined) return;
			this.activeTool = newTool;
			const type = this.activeTool.getType();
			if (type == null) return;
			this.activeToolType = type;
		});
	}

	updateOffset(isMouseDown: boolean) {
		if (this.activeTool) {
			this.controlManager.gridManager.screenOffset = this.activeTool.mouseMove(isMouseDown);
		}
	}

	// returns boolean representing if tool should toggle mousedown variable
	mousePressed() {
		if (this.activeTool) {
			return this.activeTool.mousePressed(this.controlManager.gridManager.screenOffset);
		}
		return true;
	}

	keyDown() {
		if (this.activeTool) {
			this.activeTool.keyDown();
		}
	}

	keyUp() {
		if (this.activeTool) {
			this.activeTool.keyUp();
		}
	}

	mouseReleased() {
		if (this.activeTool) {
			this.activeTool.mouseReleased();
		}
	}
	destroy() {
		this.unsubscribeTool();
		destroyActiveTool();
	}
}
