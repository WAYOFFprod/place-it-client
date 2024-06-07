import { ToolType } from "$lib/stores/toolStore";
import Tool from "../ToolClass";
import CursorIcon from "$lib/icons/cursor.svelte"

export default class PointTool extends Tool {
  static cursor = "pointer"
  static type = ToolType.Cursor
  static icon = CursorIcon

  // dragOffset: Coord = {
	// 	x: 0,
	// 	y: 0
	// };
  // screenOffset: Coord = {
	// 	x: 0,
	// 	y: 0
	// };

  keyDown() {

  }

  keyUp() {

  }

  // mousePressed() {
  //   this.dragOffset.x = this.p5.mouseX - this.screenOffset.x;
  //   this.dragOffset.y = this.p5.mouseY - this.screenOffset.y;
  // }

  mouseReleased() {

  }

  // mouseMove(isMouseDown: boolean) {
    
  // }

  getType: () => null | typeof Tool = () => {
    return PointTool
  }

}