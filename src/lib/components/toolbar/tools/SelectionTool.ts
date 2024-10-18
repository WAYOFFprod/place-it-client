import { ToolType } from "$lib/stores/toolStore";
import Tool from "../ToolClass";
import SelectionIcon from "$lib/icons/selection.svelte"

export default class SelectionTool extends Tool {
  static cursor = "selection"
  static type = ToolType.Selection
  static icon = SelectionIcon

  previousCanvaPosition: Coord = {
    x: 0,
    y: 0
  }
  currentCanvaPosition: Coord = {
    x: 0,
    y: 0
  }
  dragStart: Coord = {
    x: 0,
    y: 0
  }
  dragPrevious: Coord = {
    x: 0,
    y: 0
  }
  dragCurrent: Coord = {
		x: 0,
		y: 0
	};

  keyDown() {

  }

  keyUp() {

  }

  mousePressed(screenOffset: Coord): boolean {
    this.controlManager.screenOffset = screenOffset
    this.dragCurrent.x = this.dragStart.x = this.p5.mouseX - this.controlManager.screenOffset.x;
    this.dragCurrent.y = this.dragStart.y = this.p5.mouseY - this.controlManager.screenOffset.y;
    this.drawRectangle();
    return true;
  }

  mouseReleased() {
    
  }

  mouseMove(isMouseDown: boolean) {
    if(this.dragCurrent.x == 0 && this.dragCurrent.y == 0) return this.controlManager.screenOffset;
    this.dragCurrent.x = this.p5.mouseX - this.controlManager.screenOffset.x;
    this.dragCurrent.y = this.p5.mouseY - this.controlManager.screenOffset.y;
    this.drawRectangle();
    return this.controlManager.screenOffset;
  }

  getType: () => null | typeof Tool = () => {
    return SelectionTool
  }

  protected drawRectangle() {
    console.log("drawRectangle", this.dragPrevious.x, this.dragCurrent.x)
    if(this.dragPrevious.x == this.dragCurrent.x && this.dragPrevious.y == this.dragCurrent.y) return;
    this.controlManager.gridManager.drawRectangleOverlay(this.dragStart, this.dragCurrent, "white");
  }

}