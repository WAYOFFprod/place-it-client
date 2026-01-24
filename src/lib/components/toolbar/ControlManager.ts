import P5 from 'p5';
import Networker from '$lib/utility/Networker';
import ToolManager from './tools/ToolManager';
import { mouseCoord, zoom } from '$lib/stores/canvaStore';
import { windowSize } from '$lib/stores/tailwindStore';
export default class ControlManager {
	p5: P5;
	networker: Networker = Networker.getInstance();
	toolManager: ToolManager;

	previousOffset: Coord | undefined = undefined;

	isMouseDown: boolean = false;
	isMouseDragging: boolean = false;

	marginBottom: number = 0;

	screenOffset: Coord;
	currentScale: number;

	MIN_ZOOM = 0.5;
	MAX_ZOOM = 128;

	static instance: ControlManager;

	// original position on start of dragging
	grabStart: Coord = {
		x: 0,
		y: 0
	};

	scaleFactor = 0;

	static getInstance(p5?: P5, size?: Size2D, viewOnly?: boolean, marginBottom?: number) {
		if (ControlManager.instance != undefined) return ControlManager.instance;
		if (!p5 || !size || viewOnly == null || !marginBottom)
			throw new Error(
				"Can't initialize ControlManager, you need to provide p5, size, viewOnly and marginBottom"
			);
		new ControlManager(p5, size, viewOnly, marginBottom);
		return ControlManager.instance;
	}

	constructor(p5: P5, size: Size2D, viewOnly: boolean, marginBottom: number) {
		ControlManager.instance = this;

		this.p5 = p5;
		this.marginBottom = marginBottom;
		// init tailwind store
		windowSize(window);

		// this.init(size)

		this.toolManager = new ToolManager(p5, viewOnly);

		// initialize scale factor
		const widthRatio = this.p5.windowWidth / size.width;
		const heightRatio = (this.p5.windowHeight - this.marginBottom) / size.height;

		// get scale factor by getting the one from the axies with the least pixels
		this.currentScale = Math.max(
			widthRatio < heightRatio ? widthRatio : heightRatio,
			this.MIN_ZOOM
		);
		console.log('this.currentScale', this.currentScale);
		// this.currentScale = 1;
		// set initial offset to center image
		const x = (size.width / 2) * this.currentScale;
		const y = (size.height / 2) * this.currentScale;

		const screenCenter = {
			x: this.p5.windowWidth / 2,
			y: (this.p5.windowHeight - this.marginBottom) / 2
		};

		this.screenOffset = {
			x: screenCenter.x - x,
			y: screenCenter.y - y
		};
	}

	checkMousePosition() {
		if (this.isMouseDown) {
			this.toolManager.updateOffset();
		}
		const coords: Coord = {
			x: Math.floor((this.p5.mouseX - this.screenOffset.x) / this.currentScale),
			y: Math.floor((this.p5.mouseY - this.screenOffset.y) / this.currentScale)
		};
		mouseCoord.set(coords);
	}

	mousePressed() {
		this.grabStart.x = this.p5.mouseX;
		this.grabStart.y = this.p5.mouseY;

		this.isMouseDown = this.toolManager.mousePressed();
	}
	mouseReleased() {
		// if (this.hasMovedSinceDragStart()) return;

		this.toolManager.mouseReleased();

		this.isMouseDown = false;
	}

	hasNewScreenOffset() {
		if (!this.previousOffset) return true;
		if (
			this.previousOffset.x == this.screenOffset.x &&
			this.previousOffset.y == this.screenOffset.y
		)
			return false;
		return true;
	}

	saveScreenOffset() {
		this.previousOffset = { ...this.screenOffset };
	}

	hasMovedSinceDragStart() {
		if (this.isMouseDown) {
			this.isMouseDown = false;
			const dragVector = this.p5.createVector(this.grabStart.x, this.grabStart.y);
			const ogVector = this.p5.createVector(this.p5.mouseX, this.p5.mouseY);
			if (dragVector.dist(ogVector) > 5) {
				return true;
			}
		}
		return false;
	}

	scroll(scaleFactor: number) {
		const newCurrentScale = this.currentScale * scaleFactor;

		let newScaleFactor = newCurrentScale / this.currentScale;

		let limitScaleFactor;
		if (scaleFactor > 1) {
			limitScaleFactor = Math.min(newCurrentScale, this.MAX_ZOOM);
			newScaleFactor = limitScaleFactor / this.currentScale;
		} else {
			limitScaleFactor = Math.max(newCurrentScale, this.MIN_ZOOM);
			newScaleFactor = limitScaleFactor / this.currentScale;
		}

		this.scaleFactor = newScaleFactor;
		this.currentScale = limitScaleFactor;
		// get mouse position relative to canvas zoom
		const relMouse = {
			x: this.p5.mouseX * this.scaleFactor,
			y: this.p5.mouseY * this.scaleFactor
		};

		// get the current screen offset relative to the canvas
		const relOffset = {
			x: this.screenOffset.x * this.scaleFactor,
			y: this.screenOffset.y * this.scaleFactor
		};

		this.screenOffset.x = this.p5.mouseX - relMouse.x + relOffset.x;
		this.screenOffset.y = this.p5.mouseY - relMouse.y + relOffset.y;

		const percentScale = ((newScaleFactor / this.MAX_ZOOM) * 100) as number;
		zoom.set(percentScale);
	}
	destroy() {
		this.toolManager.destroy();
	}
}
