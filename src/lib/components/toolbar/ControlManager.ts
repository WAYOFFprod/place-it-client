import P5 from 'p5'
import Tool from "$lib/components/toolbar/ToolClass";
import { ToolType, backToTool, selectedTool, setTempTool, setTool, toolClasses } from '$lib/stores/toolStore';
import type Networker from '$lib/utility/Networker';
import { selectedColor } from '$lib/stores/colorStore';
export default class ControlManager {
  p5: P5
  activeTool: Tool | undefined;
  activeToolType: typeof Tool = Tool
  networker: Networker

  isMouseDown: boolean = false
  isMouseDragging: boolean = false

  static screenOffset: Coord

  	// original position on start of dragging
	grabStart: Coord = {
		x: 0,
		y: 0
	};

  scaleFactor = 0;
  currentScale:number

  color: string | undefined

  constructor(initialTool: ToolType, p5: P5, initialOffset: Coord, currentScale: number, networker: Networker) {
    this.p5 = p5;
    ControlManager.screenOffset = initialOffset;
    this.networker = networker;
    this.setTool(initialTool);
    this.currentScale = currentScale;
    
    selectedTool.subscribe((newTool: Tool | undefined) => {
      if(newTool == undefined) return;
      this.activeTool = newTool;
      const type = this.activeTool.getType()
      if(type == null) return;
      this.activeToolType = type;
    });

    selectedColor.subscribe((newColor) => {
      this.color = newColor;
    });
  }

  setTool(newTool: ToolType) {
    setTool(newTool, this.p5)
  }

  updateOffset() {
    if (this.isMouseDown) {
      if (this.activeTool) {
        ControlManager.screenOffset = this.activeTool.mouseMove(this.isMouseDown);
      }
    }
    return ControlManager.screenOffset
  }
  getScale() {
    return this.currentScale
  }

  mousePressed() {

    this.grabStart.x = this.p5.mouseX;
    this.grabStart.y = this.p5.mouseY;

    this.isMouseDown = true;
    if(this.activeTool) {
      this.isMouseDown = this.activeTool.mousePressed(ControlManager.screenOffset);
    }
  }
  mouseReleased() {
    if (this.hasMovedSinceDragStart()) return;

    if(this.activeTool) {
      this.activeTool.mouseReleased();
    }
    
    this.isMouseDown = false;

    const coords: Coord = {
      x: Math.floor((this.p5.mouseX - ControlManager.screenOffset.x) / this.currentScale),
      y: Math.floor((this.p5.mouseY - ControlManager.screenOffset.y) / this.currentScale)
    };

    if(this.color)
    this.networker.placePixel(coords, this.color);
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
    if(this.activeTool) {
      // adjust for ZoomMovement
      this.scaleFactor = scaleFactor
      
      this.currentScale = this.currentScale * this.scaleFactor;

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
    }
  }

  placePixel(color: string | null) {
    
  }
}