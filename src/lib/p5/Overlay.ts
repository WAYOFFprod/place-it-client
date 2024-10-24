import P5 from 'p5';
import type GridManager from './GridManager';

export default class Overlay {
  p5: P5
  img: P5.Graphics
  gridManager: GridManager
  overlayRectangleSize: Size2D;

  previousScale: number;
  sel: {
    pos: Coord,
    size: Size2D
  } = {
    pos: {
      x: 0,
      y: 0
    },
    size: {
      width: 0,
      height: 0
    }
  }
  

  constructor(p5: P5, gridManager: GridManager) {
    this.p5 = p5
    this.gridManager = gridManager;
    this.img = this.p5.createGraphics(gridManager.canvas.height * gridManager.currentScale, gridManager.canvas.width * gridManager.currentScale);
    this.previousScale = this.gridManager.currentScale;
    this.overlayRectangleSize = {
      width: 0,
      height: 0
    }
  }

  updateOverlay(start: Coord, end: Coord, color: string): boolean {
    if(this.img == null) return false;
    const startPos = {
      x: start.x > end.x ? end.x : start.x,
      y: start.y > end.y ? end.y : start.y
    };
    const endPos = {
      x: start.x > end.x ? start.x : end.x,
      y: start.y > end.y ? start.y : end.y
    };
    const widthInPixels = Math.abs(Math.round(startPos.x / this.gridManager.currentScale) - Math.round(endPos.x / this.gridManager.currentScale )) + 1;
    const heightInPixels = Math.abs(Math.round(startPos.y / this.gridManager.currentScale) - Math.round(endPos.y / this.gridManager.currentScale)) + 1;

    // don't rerender if the size of rectangle hasn't change
    if(widthInPixels - this.overlayRectangleSize.width == 0 
      && heightInPixels - this.overlayRectangleSize.height == 0) return false;
    this.overlayRectangleSize = {
      width: widthInPixels,
      height: heightInPixels
    }

    this.img.clear();
    this.img.drawingContext.setLineDash([10, 10]);
    this.img.strokeCap(this.p5.SQUARE);
    this.img.noFill();
    this.img.stroke('black');
    this.img.strokeWeight(4);
    
    this.sel.pos = {
      x: Math.round(startPos.x / this.gridManager.currentScale) * this.gridManager.currentScale,
      y: Math.round(startPos.y / this.gridManager.currentScale) * this.gridManager.currentScale
    }

    this.sel.size = {
      width: this.overlayRectangleSize.width * this.gridManager.currentScale,
      height: this.overlayRectangleSize.height * this.gridManager.currentScale
    }

    this.img.rect(
      this.sel.pos.x,
      this.sel.pos.y,
      this.sel.size.width,
      this.sel.size.height
    );
    
    return true;
  }
  getSelection = () => {
    const startCoord: Coord = {
      x: Math.round((this.sel.pos.x) / this.gridManager.currentScale),
      y: Math.round((this.sel.pos.y) / this.gridManager.currentScale)
    };
    const endCoord: Coord = {
      x: Math.round((this.sel.pos.x + this.sel.size.width) / this.gridManager.currentScale),
      y: Math.round((this.sel.pos.y + this.sel.size.height) / this.gridManager.currentScale)
    };
    return {
      start: startCoord,
      end: endCoord
    }
  }

  getStart(): Coord {
    return {
      x: Math.floor((this.sel.pos.x) / this.gridManager.currentScale),
      y: Math.floor((this.sel.pos.y) / this.gridManager.currentScale)
    };
  }

  updateAndGetImg = (): P5.Graphics => {
    const scaleChange = this.gridManager.currentScale / this.previousScale;

    if(scaleChange != 0) {
      this.img.scale(this.gridManager.canvas.width / (this.gridManager.canvas.width * scaleChange));
      this.previousScale = this.gridManager.currentScale;
    }
    return this.img;
  }
  isInSelection = (x: number, y: number): boolean => {
    return x > this.sel.pos.x && x < this.sel.pos.x + this.sel.size.width
      && y > this.sel.pos.y && y < this.sel.pos.y + this.sel.size.height
  }
}