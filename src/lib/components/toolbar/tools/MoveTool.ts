import { ToolType } from "$lib/stores/toolStore";
import Tool from "../ToolClass";
import HandIcon from "$lib/icons/hand.svelte"

export default class MoveTool extends Tool {
  static cursor = "hand"
  static type = ToolType.Hand
  static icon = HandIcon

	// original position adjusted to screenoffset at the start of dragging
	dragOffset: Coord = {
		x: 0,
		y: 0
	};

  keyDown() {

  }

  keyUp() {
    
  }

  mousePressed(screenOffset: Coord): boolean {
    
    this.controlManager.gridManager.screenOffset = screenOffset
    this.dragOffset.x = this.p5.mouseX - this.controlManager.gridManager.screenOffset.x;
    this.dragOffset.y = this.p5.mouseY - this.controlManager.gridManager.screenOffset.y;
    return true;
  }

  mouseReleased() {
    
  }

  mouseMove(isMouseDown: boolean) {
    if(this.dragOffset.x == 0 && this.dragOffset.y == 0) return this.controlManager.gridManager.screenOffset;
    this.controlManager.gridManager.screenOffset.x = this.p5.mouseX - this.dragOffset.x;
    this.controlManager.gridManager.screenOffset.y = this.p5.mouseY - this.dragOffset.y;
    return this.controlManager.gridManager.screenOffset;
  }

  getType: () => null | typeof Tool = () => {
    return MoveTool
  }

}