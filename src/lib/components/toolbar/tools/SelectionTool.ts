import { ToolType } from '$lib/stores/toolStore';
import Tool from '../ToolClass';
import SelectionIcon from '$lib/icons/selection.svelte';
import { writable, type Writable } from 'svelte/store';
import Networker from '$lib/utility/Networker';

export default class SelectionTool extends Tool {
	static cursor = 'selection';
	static type = ToolType.Selection;
	static icon = SelectionIcon;

	networker: Networker = Networker.getInstance();

	hover = writable<boolean>(false);

	cursorW: Writable<string> = writable<string>(SelectionTool.cursor);

	isHoveringSelection = false;
	isMovingSelection = false;
	getCursor(): string {
		this.cursorW.subscribe;
		return this.hover ? SelectionTool.cursor : 'hand';
	}

	selectionStart: Coord = {
		x: 0,
		y: 0
	};
	selectionEnd: Coord = {
		x: 0,
		y: 0
	};
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

	init() {
		document.addEventListener('copy', (event) => {
			this.copySelection();
			event.preventDefault();
		});
		document.addEventListener('paste', (event) => {
			this.pasteClipboard();
			event.preventDefault();
		});
	}

	keyDown() {}

	keyUp() {}

	mousePressed(screenOffset: Coord): boolean {
		this.controlManager.gridManager.screenOffset = screenOffset;
		this.dragCurrent = this.calculatePositionOnCanvas();
		this.dragStart = { ...this.dragCurrent };
		if (this.isHoveringSelection) {
			this.dragPrevious = { ...this.dragCurrent };
			this.isMovingSelection = true;
			return true;
		}

		if (!this.isMovingSelection) {
			this.selectionStart.x = this.selectionEnd.x = this.dragCurrent.x;
			this.selectionStart.y = this.selectionEnd.y = this.dragCurrent.y;
		}

		this.updateSelection();
		return true;
	}

	mouseReleased() {
		if (this.isMovingSelection) {
			this.isMovingSelection = false;
			return;
		}
		if (this.isHoveringSelection) return;
		this.selectionEnd = { ...this.dragCurrent };
		this.dragPrevious = {
			x: 0,
			y: 0
		};
	}

	mouseMove(isMouseDown: boolean) {
		if (isMouseDown) {
			this.dragCurrent = this.calculatePositionOnCanvas();
			if (this.isMovingSelection) {
				const pxDeltaX = this.dragCurrent.x - this.dragPrevious.x;
				const pxDeltaY = this.dragCurrent.y - this.dragPrevious.y;
				this.moveSelectionByDelta(pxDeltaX, pxDeltaY);
			}

			if (!this.isHoveringSelection && !this.isMovingSelection) {
				this.selectionEnd = this.dragCurrent;
				this.updateSelection();
			}
		}
		this.defineCursor(isMouseDown);
		return this.controlManager.gridManager.screenOffset;
	}

	getType: () => null | typeof Tool = () => {
		return SelectionTool;
	};

	protected calculatePositionOnCanvas() {
		return {
			x: this.p5.mouseX - this.controlManager.gridManager.screenOffset.x,
			y: this.p5.mouseY - this.controlManager.gridManager.screenOffset.y
		};
	}

	clipboard: unknown = null;
	protected copySelection() {
		this.clipboard = this.controlManager.gridManager.copySelection();
	}

	protected pasteClipboard() {
		const pixels = this.controlManager.gridManager.pasteClipboard();
		this.controlManager.gridManager.addPixelsToCanvaFromIndex(pixels);
		this.networker.placePixelsByIndex(pixels);
	}

	protected moveSelectionByDelta(pxDeltaX: number, pxDeltaY: number) {
		this.selectionStart.x += pxDeltaX;
		this.selectionStart.y += pxDeltaY;
		this.selectionEnd.x += pxDeltaX;
		this.selectionEnd.y += pxDeltaY;
		this.updateSelection();
	}

	protected updateSelection() {
		// Make sure there is an actual change
		if (this.dragPrevious.x == this.dragCurrent.x && this.dragPrevious.y == this.dragCurrent.y)
			return;
		// make sure the selection is at least 1 pixel wide and high
		this.controlManager.gridManager.updateRectangleOverlay(
			this.selectionStart,
			this.selectionEnd,
			false
		);
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
