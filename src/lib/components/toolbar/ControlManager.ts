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

  isMouseDown: boolean = false
  isMouseDragging: boolean = false

  static screenOffset: Coord
  static currentScale:number

  static MIN_ZOOM = 0.7
  static MAX_ZOOM = 20

  	// original position on start of dragging
	grabStart: Coord = {
		x: 0,
		y: 0
	};

  scaleFactor = 0;


  constructor(p5: P5, size: Size2D, viewOnly: boolean) {
    this.p5 = p5;
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
		const heightRatio = this.p5.windowHeight / size.height;
    
		// get scale factor by getting the one from the axies with the least pixels
    ControlManager.currentScale = Math.max(widthRatio < heightRatio ? widthRatio : heightRatio, ControlManager.MIN_ZOOM);
		// ControlManager.currentScale = 1;
    
		// set initial offset to center image
		const x = (size.width / 2) * ControlManager.currentScale;
		const y = (size.height / 2) * ControlManager.currentScale;
    
    const screenCenter = {
      x: this.p5.windowWidth / 2,
      y: this.p5.windowHeight / 2
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
    // adjust for ZoomMovement
    // this.scaleFactor = scaleFactor

    // ControlManager.currentScale = ControlManager.currentScale * this.scaleFactor;
    const newCurrentScale = ControlManager.currentScale * scaleFactor;
    const limitedCurrentScale = Math.min(Math.max(newCurrentScale, ControlManager.MIN_ZOOM), ControlManager.MAX_ZOOM);
    const limitedScaleFactor = limitedCurrentScale / ControlManager.currentScale

    this.scaleFactor = limitedScaleFactor
    ControlManager.currentScale = limitedCurrentScale
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

    const percentScale = limitedCurrentScale/ControlManager.MAX_ZOOM * 100 as number
    zoom.set(percentScale)
  }
}