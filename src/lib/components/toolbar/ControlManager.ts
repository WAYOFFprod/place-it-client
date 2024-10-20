import P5 from 'p5'
import Networker from '$lib/utility/Networker';
import ToolManager from './tools/ToolManager';
import { mouseCoord, zoom } from '$lib/stores/canvaStore';
import { windowSize } from '$lib/stores/tailwindStore';
import type GridManager from '$lib/p5/GridManager';
export default class ControlManager {
  p5: P5
  networker: Networker = Networker.getInstance();;
  toolManager: ToolManager

  gridManager: GridManager

  previousOffset: Coord | undefined = undefined;

  isMouseDown: boolean = false
  isMouseDragging: boolean = false

  MIN_ZOOM = 0.5
  MAX_ZOOM = 128

  static instance: ControlManager

  	// original position on start of dragging
	grabStart: Coord = {
		x: 0,
		y: 0
	};

  scaleFactor = 0;

  static getInstance(p5?: P5, viewOnly?: boolean , gridManager?: GridManager) {
    if(ControlManager.instance != undefined) return ControlManager.instance;
    if(!p5 || viewOnly == null) throw new Error("Can't initialize ControlManager, you need to provide p5, size, viewOnly and marginBottom");
    if(!gridManager) throw new Error("you need to provide gridManager");
    new ControlManager(p5, viewOnly, gridManager);
    return ControlManager.instance
  }

  constructor(p5: P5, viewOnly: boolean, gridManager: GridManager) {
    ControlManager.instance = this;

    this.gridManager = gridManager
    this.p5 = p5;
    // init tailwind store
    windowSize(window)
    
		// this.init(size)
    
    this.toolManager = new ToolManager(p5, viewOnly);

    // initialize scale factor
		
    
		// get scale factor by getting the one from the axies with the least pixels
    
    console.log("this.currentScale", this.gridManager.currentScale)
		// this.currentScale = 1;
		
  }

  checkMousePosition() {
    if(this.isMouseDown) {
      this.toolManager.updateOffset()
    }
    const coords: Coord = {
      x: Math.floor((this.p5.mouseX - this.gridManager.screenOffset.x) / this.gridManager.currentScale),
      y: Math.floor((this.p5.mouseY - this.gridManager.screenOffset.y) / this.gridManager.currentScale)
    };
    mouseCoord.set(coords)
  }

  mousePressed() {
    this.grabStart.x = this.p5.mouseX;
    this.grabStart.y = this.p5.mouseY;
    
    this.isMouseDown = this.toolManager.mousePressed()
  }
  mouseReleased() {
    // if (this.hasMovedSinceDragStart()) return;

    this.toolManager.mouseReleased();
    
    this.isMouseDown = false;
  }

  hasNewScreenOffset() {
    if(!this.previousOffset) return true;
    if(this.previousOffset.x == this.gridManager.screenOffset.x && this.previousOffset.y == this.gridManager.screenOffset.y) return false;
    return true;
  }

  saveScreenOffset() {
    this.previousOffset = {...this.gridManager.screenOffset}
  }

	hasMovedSinceDragStart() {
		if (this.isMouseDown ) {
			this.isMouseDown = false;
			const dragVector = this.p5.createVector(this.grabStart.x, this.grabStart.y);
			const ogVector = this.p5.createVector(this.p5.mouseX, this.p5.mouseY);
			if (dragVector.dist(ogVector) > 5) {
				return true;
			}
		}
		return false;
	};

  scroll(scaleFactor: number) {
    const newCurrentScale = this.gridManager.currentScale * scaleFactor;

    let newScaleFactor = newCurrentScale / this.gridManager.currentScale

    let limitScaleFactor
    if(scaleFactor > 1) {
      limitScaleFactor = Math.min(newCurrentScale, this.MAX_ZOOM)
      newScaleFactor = limitScaleFactor  / this.gridManager.currentScale;
    } else {
      limitScaleFactor = Math.max(newCurrentScale, this.MIN_ZOOM)
      newScaleFactor = limitScaleFactor /  this.gridManager.currentScale;
    }
    
    this.scaleFactor = newScaleFactor
    this.gridManager.currentScale = limitScaleFactor
    // get mouse position relative to canvas zoom
    const relMouse = {
      x: this.p5.mouseX * this.scaleFactor,
      y: this.p5.mouseY * this.scaleFactor
    };

    // get the current screen offset relative to the canvas
    const relOffset = {
      x: this.gridManager.screenOffset.x * this.scaleFactor,
      y: this.gridManager.screenOffset.y * this.scaleFactor
    };

    this.gridManager.screenOffset.x = this.p5.mouseX - relMouse.x + relOffset.x;
    this.gridManager.screenOffset.y = this.p5.mouseY - relMouse.y + relOffset.y;

    const percentScale = newScaleFactor/this.MAX_ZOOM * 100 as number
    zoom.set(percentScale)
  }
  destroy() {
    this.toolManager.destroy();
  }
}