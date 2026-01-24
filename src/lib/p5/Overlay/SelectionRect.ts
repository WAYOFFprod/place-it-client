export default class SelectionRect {
	overlayRectangleSize: Size2D;
	selection: {
		pos: Coord;
		size: Size2D;
	};
	constructor() {
		this.overlayRectangleSize = {
			width: 0,
			height: 0
		};
		this.selection = {
			pos: {
				x: 0,
				y: 0
			},
			size: {
				width: 0,
				height: 0
			}
		};
	}
	updateOverlay(start: Coord, end: Coord, currentScale: number): void {
		const startPos = {
			x: start.x > end.x ? end.x : start.x,
			y: start.y > end.y ? end.y : start.y
		};
		const endPos = {
			x: start.x > end.x ? start.x : end.x,
			y: start.y > end.y ? start.y : end.y
		};

		const widthInPixels =
			Math.abs(Math.round(startPos.x / currentScale) - Math.round(endPos.x / currentScale)) + 1;
		const heightInPixels =
			Math.abs(Math.round(startPos.y / currentScale) - Math.round(endPos.y / currentScale)) + 1;
		// don't rerender if the size and position of rectangle hasn't change
		if (
			widthInPixels - this.overlayRectangleSize.width == 0 &&
			heightInPixels - this.overlayRectangleSize.height == 0 &&
			Math.round(this.selection.pos.x / currentScale) == Math.round(startPos.x / currentScale) &&
			Math.round(this.selection.pos.y / currentScale) == Math.round(startPos.y / currentScale)
		) {
			return;
		}
		this.overlayRectangleSize = {
			width: widthInPixels,
			height: heightInPixels
		};

		this.selection.pos = {
			x: Math.round(startPos.x / currentScale) * currentScale,
			y: Math.round(startPos.y / currentScale) * currentScale
		};

		this.selection.size = {
			width: this.overlayRectangleSize.width * currentScale,
			height: this.overlayRectangleSize.height * currentScale
		};
	}
	isInSelection = (x: number, y: number): boolean => {
		return (
			x > this.selection.pos.x &&
			x < this.selection.pos.x + this.selection.size.width &&
			y > this.selection.pos.y &&
			y < this.selection.pos.y + this.selection.size.height
		);
	};
	getStart(currentScale: number): Coord {
		return {
			x: Math.floor(this.selection.pos.x / currentScale),
			y: Math.floor(this.selection.pos.y / currentScale)
		};
	}
	getSelection = (currentScale: number) => {
		const startCoord: Coord = {
			x: Math.round(this.selection.pos.x / currentScale),
			y: Math.round(this.selection.pos.y / currentScale)
		};
		const endCoord: Coord = {
			x: Math.round((this.selection.pos.x + this.selection.size.width) / currentScale),
			y: Math.round((this.selection.pos.y + this.selection.size.height) / currentScale)
		};
		return {
			start: startCoord,
			end: endCoord
		};
	};
}
