import { ToolType } from '$lib/stores/toolStore';
import Tool from '../ToolClass';
import SelectionIcon from '$lib/icons/selection.svelte';
import { writable, type Writable } from 'svelte/store';
import Networker from '$lib/utility/Networker';
import SelectionRect from '$lib/p5/Overlay/SelectionRect';

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

	selectionRect: SelectionRect = new SelectionRect();

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
		this.dragCurrent = this.relativePositionOnCanvas();

		// if hovering selection, start moving it
		if (this.isHoveringSelection) {
			this.dragPrevious = { ...this.dragCurrent };
			this.isMovingSelection = true;
			return true;
		}

		// start new selection
		if (!this.isMovingSelection) {
			this.selectionRect.resetAt(this.dragCurrent, this.controlManager.gridManager.currentScale);
			this.controlManager.gridManager.addRectToOverlay(this.selectionRect);
			this.updateSelection();
			return true;
		}
		return false;
	}

	mouseMove(isMouseDown: boolean) {
		if (isMouseDown) {
			this.dragCurrent = this.relativePositionOnCanvas();
			// move selection if needed
			if (this.isMovingSelection) {
				const deltaXScreen = this.dragCurrent.x - this.dragPrevious.x;
				const deltaYScreen = this.dragCurrent.y - this.dragPrevious.y;
				const hasMoved = this.selectionRect.moveRect(deltaXScreen, deltaYScreen);

				if (hasMoved) this.updateSelection();
			}

			// update selection size of rectangle if not moving selection
			if (!this.isHoveringSelection && !this.isMovingSelection) {
				this.dragPrevious = { x: 0, y: 0 };
				this.selectionRect.resizeRect('bottom-right', this.dragCurrent);
				this.updateSelection();
			}
		}

		this.defineCursor(isMouseDown);
		return this.controlManager.gridManager.screenOffset;
	}

	mouseReleased() {
		if (this.isMovingSelection) {
			this.isMovingSelection = false;
			return;
		}

		if (this.isHoveringSelection) return;
		this.dragPrevious = {
			x: 0,
			y: 0
		};
	}

	getType: () => null | typeof Tool = () => {
		return SelectionTool;
	};

	protected relativePositionOnCanvas(): Coord {
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

	protected updateSelection() {
		// Make sure there is an actual change
		if (this.dragPrevious.x == this.dragCurrent.x && this.dragPrevious.y == this.dragCurrent.y)
			return;
		// make sure the selection is at least 1 pixel wide and high
		this.controlManager.gridManager.updateOverlay();
		this.dragPrevious = { ...this.dragCurrent };
	}

	protected defineCursor(isMouseDown: boolean) {
		if (isMouseDown) {
			this.cursorW.set('selection');
			this.isHoveringSelection = false;
		} else if (this.selectionRect.isInSelection(this.relativePositionOnCanvas())) {
			this.isHoveringSelection = true;
			this.cursorW.set('hand');
		} else {
			this.isHoveringSelection = false;
			this.cursorW.set('selection');
		}
	}

	destroy() {
		this.controlManager.gridManager.removeRectFromOverlay();
	}
}
