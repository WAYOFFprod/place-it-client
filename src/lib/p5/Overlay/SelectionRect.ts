export default class SelectionRect {
	overlayRectangleSize: Size2D;
	selectionGrid: {
		pos: Coord;
		size: Size2D;
	};
	gridToScreenScale: number = 1;
	constructor() {
		this.overlayRectangleSize = {
			width: 0,
			height: 0
		};
		this.selectionGrid = {
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

	updateRectCalc(startScreen: Coord, endScreen: Coord, currentScale: number): void {
		this.gridToScreenScale = currentScale;
		const startScreenPos = {
			x: startScreen.x > endScreen.x ? endScreen.x : startScreen.x,
			y: startScreen.y > endScreen.y ? endScreen.y : startScreen.y
		};
		const endScreenPos = {
			x: startScreen.x > endScreen.x ? startScreen.x : endScreen.x,
			y: startScreen.y > endScreen.y ? startScreen.y : endScreen.y
		};

		const widthInScreen = endScreenPos.x - startScreenPos.x;
		const heightInScreen = endScreenPos.y - startScreenPos.y;
		const widthInPixels = Math.round(widthInScreen / this.gridToScreenScale) + 1;
		const heightInPixels = Math.round(heightInScreen / this.gridToScreenScale) + 1;

		// don't update if the size and position of rectangle hasn't change
		if (
			widthInPixels - this.overlayRectangleSize.width == 0 &&
			heightInPixels - this.overlayRectangleSize.height == 0 &&
			Math.round(this.selectionGrid.pos.x / this.gridToScreenScale) ==
				Math.round(startScreenPos.x / this.gridToScreenScale) &&
			Math.round(this.selectionGrid.pos.y / this.gridToScreenScale) ==
				Math.round(startScreenPos.y / this.gridToScreenScale)
		) {
			return;
		}

		this.overlayRectangleSize = {
			width: widthInPixels,
			height: heightInPixels
		};

		// divide by this.gridToScreenScale then round to avoid sub-pixel rendering, then multiply back

		this.selectionGrid.pos = {
			x: Math.round(startScreenPos.x / this.gridToScreenScale),
			y: Math.round(startScreenPos.y / this.gridToScreenScale)
		};

		this.selectionGrid.size = {
			width: this.overlayRectangleSize.width,
			height: this.overlayRectangleSize.height
		};
	}

	updateScale(currentScale: number): void {
		this.gridToScreenScale = currentScale;
	}

	isInSelection = (xScreen: number, yScreen: number): boolean => {
		const xGrid = xScreen / this.gridToScreenScale;
		const yGrid = yScreen / this.gridToScreenScale;
		return (
			xGrid > this.selectionGrid.pos.x &&
			xGrid < this.selectionGrid.pos.x + this.selectionGrid.size.width &&
			yGrid > this.selectionGrid.pos.y &&
			yGrid < this.selectionGrid.pos.y + this.selectionGrid.size.height
		);
	};

	getPosition(): Coord {
		return {
			x: this.selectionGrid.pos.x * this.gridToScreenScale,
			y: this.selectionGrid.pos.y * this.gridToScreenScale
		};
	}
	getSize(): Size2D {
		return {
			width: this.selectionGrid.size.width * this.gridToScreenScale,
			height: this.selectionGrid.size.height * this.gridToScreenScale
		};
	}
	getSelection = () => {
		const endCoord: Coord = {
			x: this.selectionGrid.pos.x + this.selectionGrid.size.width,
			y: this.selectionGrid.pos.y + this.selectionGrid.size.height
		};
		return {
			start: this.selectionGrid.pos,
			end: endCoord
		};
	};
}
