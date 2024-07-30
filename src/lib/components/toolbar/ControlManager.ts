import P5 from 'p5'
import Tool from "$lib/components/toolbar/ToolClass";
import { ToolType, selectedTool} from '$lib/stores/toolStore';
import Networker from '$lib/utility/Networker';
import ToolManager from './tools/ToolManager';
import { mouseCoord, zoom } from '$lib/stores/canvaStore';
export default class ControlManager {
  p5: P5
  networker: Networker = Networker.getInstance();;
  toolManager: ToolManager

  previousOffset: Coord | undefined = undefined;

  isMouseDown: boolean = false
  isMouseDragging: boolean = false

  marginBottom: number = 0

  static screenOffset: Coord
  static currentScale:number

  static MIN_ZOOM = 0.5
  static MAX_ZOOM = 128

  	// original position on start of dragging
	grabStart: Coord = {
		x: 0,
		y: 0
	};

  scaleFactor = 0;


  constructor(p5: P5, size: Size2D, viewOnly: boolean, marginBottom:number) {
    this.p5 = p5;
    this.marginBottom = marginBottom;
    if(viewOnly) {
      this.toolManager = new ToolManager(ToolType.Hand, p5);
    } else {
      this.toolManager = new ToolManager(ToolType.Cursor, p5);
    }

		this.init(size)
  }

  init(size: Size2D) {
    // initialize scale factor
		const widthRatio = this.p5.windowWidth / size.width;
		const heightRatio = (this.p5.windowHeight - this.marginBottom) / size.height;
    
		// get scale factor by getting the one from the axies with the least pixels
    ControlManager.currentScale = Math.max(widthRatio < heightRatio ? widthRatio : heightRatio, ControlManager.MIN_ZOOM);
		// ControlManager.currentScale = 1;
		// set initial offset to center image
		const x = (size.width / 2) * ControlManager.currentScale;
		const y = (size.height / 2) * ControlManager.currentScale;
    
    const screenCenter = {
      x: this.p5.windowWidth / 2,
      y: (this.p5.windowHeight - this.marginBottom) / 2
    };
    
    ControlManager.screenOffset = {
      x: screenCenter.x - x,
      y: screenCenter.y - y
    };
  }

  checkMousePosition() {
    if(this.isMouseDown) {
      this.toolManager.updateOffset()
    }
    const coords: Coord = {
      x: Math.floor((this.p5.mouseX - ControlManager.screenOffset.x) / ControlManager.currentScale),
      y: Math.floor((this.p5.mouseY - ControlManager.screenOffset.y) / ControlManager.currentScale)
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
    if(this.previousOffset.x == ControlManager.screenOffset.x && this.previousOffset.y == ControlManager.screenOffset.y) return false;
    return true;
  }

  saveScreenOffset() {
    this.previousOffset = {...ControlManager.screenOffset}
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
    const newCurrentScale = ControlManager.currentScale * scaleFactor;

    let newScaleFactor = newCurrentScale / ControlManager.currentScale

    let limitScaleFactor
    if(scaleFactor > 1) {
      limitScaleFactor = Math.min(newCurrentScale, ControlManager.MAX_ZOOM)
      newScaleFactor = limitScaleFactor  / ControlManager.currentScale;
    } else {
      limitScaleFactor = Math.max(newCurrentScale, ControlManager.MIN_ZOOM)
      newScaleFactor = limitScaleFactor /  ControlManager.currentScale;
    }
    
    this.scaleFactor = newScaleFactor
    ControlManager.currentScale = limitScaleFactor
    // get mouse position relative to canvas zoom
    const relMouse = {
      x: this.p5.mouseX * this.scaleFactor,
      y: this.p5.mouseY * this.scaleFactor
    };

    // get the current screen offset relative to the canvas
    const relOffset = {
      x: ControlManager.screenOffset.x * this.scaleFactor,
      y: ControlManager.screenOffset.y * this.scaleFactor
    };

    ControlManager.screenOffset.x = this.p5.mouseX - relMouse.x + relOffset.x;
    ControlManager.screenOffset.y = this.p5.mouseY - relMouse.y + relOffset.y;

    const percentScale = newScaleFactor/ControlManager.MAX_ZOOM * 100 as number
    zoom.set(percentScale)
  }
  destroy() {
    this.toolManager.destroy();
  }
}