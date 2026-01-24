import { ToolType } from '$lib/stores/toolStore';
import Tool from '../ToolClass';
import SelectionIcon from '$lib/icons/selection.svelte';
import { writable, type Writable } from 'svelte/store';
import Networker from '$lib/utility/Networker';

export default class RectTool extends Tool {
	static cursor = 'selection';
	static type = ToolType.Rect;
	static icon = SelectionIcon;

	networker: Networker = Networker.getInstance();

	hover = writable<boolean>(false);

	cursorW: Writable<string> = writable<string>(RectTool.cursor);

	isHoveringSelection = false;
	getCursor(): string {
		this.cursorW.subscribe;
		return this.hover ? RectTool.cursor : 'hand';
	}

	dragStart: Coord = {
		x: 0,
		y: 0
	};
	dragPrevious: Coord = {
		x: 0,
		y: 0
	};
	dragCurrent: Coord = {
		x: 0,
		y: 0
	};
	dragEnd: Coord = {
		x: 0,
		y: 0
	};

	keyDown() {}

	keyUp() {}

	mousePressed(screenOffset: Coord): boolean {
		if (this.isHoveringSelection) return false;
		this.controlManager.gridManager.screenOffset = screenOffset;
		this.dragCurrent.x = this.dragStart.x =
			this.p5.mouseX - this.controlManager.gridManager.screenOffset.x;
		this.dragCurrent.y = this.dragStart.y =
			this.p5.mouseY - this.controlManager.gridManager.screenOffset.y;
		this.drawRectangle();
		return true;
	}

	mouseReleased() {
		if (this.isHoveringSelection) return;
		this.dragEnd = { ...this.dragCurrent };
		this.dragPrevious = {
			x: 0,
			y: 0
		};
	}

	mouseMove(isMouseDown: boolean) {
		if (isMouseDown) {
			if (!this.isHoveringSelection) {
				this.dragCurrent.x = this.p5.mouseX - this.controlManager.gridManager.screenOffset.x;
				this.dragCurrent.y = this.p5.mouseY - this.controlManager.gridManager.screenOffset.y;
				this.drawRectangle();
			}
		}
		this.defineCursor(isMouseDown);
		return this.controlManager.gridManager.screenOffset;
	}

	getType: () => null | typeof Tool = () => {
		return RectTool;
	};

	protected drawRectangle() {
		if (this.dragPrevious.x == this.dragCurrent.x && this.dragPrevious.y == this.dragCurrent.y)
			return;
		this.controlManager.gridManager.updateRectangleOverlay(this.dragStart, this.dragCurrent, true);
		this.dragPrevious = { ...this.dragCurrent };
	}

	protected defineCursor(isMouseDown: boolean) {
		if (isMouseDown) {
			this.cursorW.set('selection');
			this.isHoveringSelection = false;
		} else if (this.controlManager.gridManager.isInSelection(this.p5.mouseX, this.p5.mouseY)) {
			this.isHoveringSelection = true;
			this.cursorW.set('hand');
		} else {
			this.isHoveringSelection = false;
			this.cursorW.set('selection');
		}
	}
}
