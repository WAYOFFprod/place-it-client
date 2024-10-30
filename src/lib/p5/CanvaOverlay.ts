import P5 from 'p5';
import type GridManager from './GridManager';
import { selectedColor } from '$lib/stores/colorStore';
import type { Unsubscriber } from 'svelte/motion';
import SelectionRect from './Overlay/SelectionRect';



export default class CanvaOverlay {
  p5: P5
  img: P5.Graphics
  gridManager: GridManager
  selectionRect: SelectionRect
  // color
  unsubscribeSelectedColor: Unsubscriber | undefined;
  savedColor: string = '';
  fill: boolean = false;

  previousScale: number;
  

  constructor(p5: P5, gridManager: GridManager) {
    this.selectionRect = new SelectionRect();
    this.p5 = p5
    this.gridManager = gridManager;
    this.img = this.p5.createGraphics(gridManager.canvas.height * gridManager.currentScale, gridManager.canvas.width * gridManager.currentScale);
    this.previousScale = this.gridManager.currentScale;

    this.unsubscribeSelectedColor = selectedColor.subscribe((newColor) => {
      this.savedColor = newColor;
      console.log('new color', newColor);
      this.drawRectangle();
      this.gridManager.update();
    });
  }

  refreshOverlay = () => {
    const scaleChange = this.gridManager.currentScale / this.previousScale;

    if(scaleChange != 0) {
      this.img.scale(this.gridManager.canvas.width / (this.gridManager.canvas.width * scaleChange));
      this.previousScale = this.gridManager.currentScale;
    }
    this.p5.image(this.img, 0, 0, this.gridManager.canvas.width, this.gridManager.canvas.height);
  }

  updateRectangleOverlay(start: Coord, end: Coord, color: string, fill: boolean | undefined): boolean {
    if(this.img == null) return false;
    this.fill = fill || false;

    this.selectionRect.updateOverlay(start, end, this.gridManager.currentScale);

    this.drawRectangle();
    
    return true;
  }

  protected drawRectangle() {
    this.img.clear();
    this.img.drawingContext.setLineDash([10, 10]);
    this.img.strokeCap(this.p5.SQUARE);
    if(this.fill) {
      this.img.fill(this.savedColor);
    } else {
      this.img.noFill();
    }
    this.img.stroke('black');
    this.img.strokeWeight(4);

    console.log('drawing rectangle', this.selectionRect);
    const pos = this.selectionRect.selection.pos;
    const size = this.selectionRect.selection.size;
    this.img.rect(
      pos.x,
      pos.y,
      size.width,
      size.height
    );
  }

  getImageSection = (start: Coord, end: Coord) => {
    return this.img.get(start.x, start.y, end.x - start.x, end.y - start.y);
  }

  // Selection Rectangle
  getSelection = () => {
    return this.selectionRect.getSelection(this.gridManager.currentScale);
  }

  getStart(): Coord {
    return this.selectionRect.getStart(this.gridManager.currentScale);
  }

  isInSelection = (x: number, y: number): boolean => {
    return this.selectionRect.isInSelection(x, y);
  }

  // not called yet
  destroy() {
    if(this.unsubscribeSelectedColor) {
      this.unsubscribeSelectedColor();
    }
  }
}