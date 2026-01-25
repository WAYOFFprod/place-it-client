import { ToolType } from '$lib/stores/toolStore';
import Tool from '../ToolClass';
import CursorIcon from '$lib/icons/cursor.svelte';
import Networker from '$lib/utility/Networker';

import { selectedColor } from '$lib/stores/colorStore';
import { get, writable, type Writable } from 'svelte/store';

export default class PointTool extends Tool {
	static cursor = 'pointer';
	static type = ToolType.Cursor;
	static icon = CursorIcon;
	static unsubscribeColors: () => void;
	static color: string | undefined;

	cursorW: Writable<string> = writable<string>(PointTool.cursor);

	networker: Networker = Networker.getInstance();

	pixels: Coord[] = [];

	protected init() {
		this.p5.frameRate(120);
		PointTool.color = get(selectedColor);
		PointTool.unsubscribeColors = selectedColor.subscribe((newColor) => {
			PointTool.color = newColor;
		});
	}

	keyDown() {}

	keyUp() {}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	mousePressed(_mousePressed: Coord) {
		this.placePixel();
		return true;
	}

	mouseReleased() {
		this.pixels = [];
	}

	mouseMove(isMouseDown: boolean) {
		if (!PointTool.color || !isMouseDown) return this.controlManager.gridManager.screenOffset;

		// check if mouse position in on new pixel
		const coords: Coord = {
			x: Math.floor(
				(this.p5.mouseX - this.controlManager.gridManager.screenOffset.x) /
					this.controlManager.gridManager.currentScale
			),
			y: Math.floor(
				(this.p5.mouseY - this.controlManager.gridManager.screenOffset.y) /
					this.controlManager.gridManager.currentScale
			)
		};

		const lastPixel = this.pixels.length > 0 ? this.pixels[this.pixels.length - 1] : undefined;

		if (lastPixel) {
			const points = this.bresenhamLine(lastPixel, coords);
			points.forEach((p) => this.trySavePixel(p));
		} else {
			this.trySavePixel(coords);
		}

		// return save offset in order to not move screen
		return this.controlManager.gridManager.screenOffset;
	}

	private trySavePixel(coords: Coord) {
		if (
			PointTool.color &&
			!this.pixels.find((coord) => coord.x == coords.x && coord.y == coords.y)
		) {
			this.pixels.push(coords);
			this.networker.savePixel(coords, PointTool.color);
		}
	}

	// Bresenham's line algorithm to place points between two coordinates
	private bresenhamLine(p0: Coord, p1: Coord): Coord[] {
		const points: Coord[] = [];
		const dx = Math.abs(p1.x - p0.x);
		const dy = Math.abs(p1.y - p0.y);
		const sx = p0.x < p1.x ? 1 : -1;
		const sy = p0.y < p1.y ? 1 : -1;
		let err = dx - dy;

		let x = p0.x;
		let y = p0.y;

		const maxIterations = dx + dy + 1;
		let iterations = 0;

		while (iterations < maxIterations) {
			points.push({ x, y });

			if (x === p1.x && y === p1.y) break;
			const e2 = 2 * err;
			if (e2 > -dy) {
				err -= dy;
				x += sx;
			}
			if (e2 < dx) {
				err += dx;
				y += sy;
			}
			iterations++;
		}
		return points;
	}

	protected placePixel() {
		if (!PointTool.color) return;
		// calculate on which pixel the mouse is over
		const coords: Coord = {
			x: Math.floor(
				(this.p5.mouseX - this.controlManager.gridManager.screenOffset.x) /
					this.controlManager.gridManager.currentScale
			),
			y: Math.floor(
				(this.p5.mouseY - this.controlManager.gridManager.screenOffset.y) /
					this.controlManager.gridManager.currentScale
			)
		};
		this.pixels.push(coords);
		this.networker.savePixel(coords, PointTool.color);
	}

	getType: () => null | typeof Tool = () => {
		return PointTool;
	};

	destroy() {
		if (PointTool.unsubscribeColors) {
			PointTool.unsubscribeColors();
			this.p5.frameRate(60);
		}
	}
}
