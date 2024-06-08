import { ToolType } from "$lib/stores/toolStore";
import Tool from "../ToolClass";
import HandIcon from "$lib/icons/hand.svelte"
import ControlManager from "../ControlManager";

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
    ControlManager.screenOffset = screenOffset
    this.dragOffset.x = this.p5.mouseX - ControlManager.screenOffset.x;
    this.dragOffset.y = this.p5.mouseY - ControlManager.screenOffset.y;
    return true;
  }

  mouseReleased() {
    
  }

  mouseMove(isMouseDown: boolean) {
    if(this.dragOffset.x == 0 && this.dragOffset.y == 0) return ControlManager.screenOffset;
    ControlManager.screenOffset.x = this.p5.mouseX - this.dragOffset.x;
    ControlManager.screenOffset.y = this.p5.mouseY - this.dragOffset.y;
    return ControlManager.screenOffset;
  }

  getType: () => null | typeof Tool = () => {
    return MoveTool
  }

}