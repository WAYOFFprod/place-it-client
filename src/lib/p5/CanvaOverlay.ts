import P5 from 'p5';
import type GridManager from './GridManager';
import { selectedColor } from '$lib/stores/colorStore';
import type { Unsubscriber } from 'svelte/motion';
import SelectionRect from './Overlay/SelectionRect';

// the overlay is used to draw selection rectangle
// and other temporary shapes
// it uses p5.Graphics to draw on an offscreen buffer
// and then draw that buffer on the main canvas
// this way we can clear the overlay without clearing the main canvas
export default class CanvaOverlay {
	p5: P5;
	img: P5.Graphics;
	gridManager: GridManager;
	// color
	selectionRect?: SelectionRect;
	unsubscribeSelectedColor: Unsubscriber | undefined;
	savedColor: string = '';
	fill: boolean = false;

	previousScale: number;

	constructor(p5: P5, gridManager: GridManager) {
		this.p5 = p5;
		this.gridManager = gridManager;
		this.img = this.p5.createGraphics(
			gridManager.canvas.height * gridManager.currentScale,
			gridManager.canvas.width * gridManager.currentScale
		);
		this.previousScale = this.gridManager.currentScale;

		this.unsubscribeSelectedColor = selectedColor.subscribe((newColor) => {
			this.savedColor = newColor;
			this.drawRectangle();
			this.gridManager.update();
		});
	}

	addSelectionRect = (selectionRect: SelectionRect) => {
		this.selectionRect = selectionRect;
	};
	removeSelectionRect = () => {
		this.selectionRect = undefined;
		this.img.clear();
		this.gridManager.update();
	};

	refreshOverlay = () => {
		const scaleChange = this.gridManager.currentScale / this.previousScale;
		if (scaleChange != 0) {
			this.img.scale(this.gridManager.canvas.width / (this.gridManager.canvas.width * scaleChange));
			this.previousScale = this.gridManager.currentScale;
		}
		this.drawRectangle();
		this.p5.image(this.img, 0, 0, this.gridManager.canvas.width, this.gridManager.canvas.height);
	};

	onScaleChange() {
		this.selectionRect?.updateScale(this.gridManager.currentScale);
	}

	protected drawRectangle() {
		this.img.clear();
		this.img.drawingContext.setLineDash([10, 10]);
		this.img.strokeCap(this.p5.SQUARE);
		if (this.fill) {
			this.img.fill(this.savedColor);
		} else {
			this.img.noFill();
		}
		this.img.stroke('black');
		this.img.strokeWeight(4);
		if (!this.selectionRect) console.warn('No selection rect to draw');
		const pos = this.selectionRect?.getScreenPosition();
		const size = this.selectionRect?.getScreenSize();
		if (pos && size) {
			this.img.rect(pos.x, pos.y, size.width, size.height);
		}
	}

	getImageSection = (start: Coord, end: Coord) => {
		return this.img.get(start.x, start.y, end.x - start.x, end.y - start.y);
	};

	// Selection Rectangle
	getSelection = () => {
		return this.selectionRect?.getSelection() || { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };
	};

	// not called yet
	destroy() {
		if (this.unsubscribeSelectedColor) {
			this.unsubscribeSelectedColor();
		}
	}
}
