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

	resetAt(screenPos: Coord, scale: number): void {
		this.gridToScreenScale = scale;
		this.selectionGrid.pos = {
			x: Math.round(screenPos.x / this.gridToScreenScale),
			y: Math.round(screenPos.y / this.gridToScreenScale)
		};
		this.selectionGrid.size = {
			width: 1,
			height: 1
		};
	}

	resizeRect(dir: string, newEndScreen: Coord): void {
		if (dir === 'bottom-right') {
			const widthInScreen = newEndScreen.x - this.getScreenPosition().x;
			const heightInScreen = newEndScreen.y - this.getScreenPosition().y;
			const widthInPixels = Math.round(widthInScreen / this.gridToScreenScale) + 1;
			const heightInPixels = Math.round(heightInScreen / this.gridToScreenScale) + 1;

			this.overlayRectangleSize = {
				width: widthInPixels,
				height: heightInPixels
			};

			this.selectionGrid.size = {
				width: this.overlayRectangleSize.width,
				height: this.overlayRectangleSize.height
			};
		}
	}
	// returns true if moved
	moveRect(deltaXScreen: number, deltaYScreen: number): boolean {
		const deltaXGrid = Math.round(deltaXScreen / this.gridToScreenScale);
		const deltaYGrid = Math.round(deltaYScreen / this.gridToScreenScale);
		this.selectionGrid.pos = {
			x: this.selectionGrid.pos.x + deltaXGrid,
			y: this.selectionGrid.pos.y + deltaYGrid
		};

		return deltaXGrid !== 0 || deltaYGrid !== 0;
	}

	updateScale(currentScale: number): void {
		this.gridToScreenScale = currentScale;
	}

	isInSelection = (screen: Coord): boolean => {
		const xGrid = screen.x / this.gridToScreenScale;
		const yGrid = screen.y / this.gridToScreenScale;
		return (
			xGrid > this.selectionGrid.pos.x - 0.5 &&
			xGrid < this.selectionGrid.pos.x - 0.5 + this.selectionGrid.size.width &&
			yGrid > this.selectionGrid.pos.y &&
			yGrid < this.selectionGrid.pos.y + this.selectionGrid.size.height
		);
	};

	getScreenPosition(): Coord {
		return {
			x: this.selectionGrid.pos.x * this.gridToScreenScale,
			y: this.selectionGrid.pos.y * this.gridToScreenScale
		};
	}

	getScreenSize(): Size2D {
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
