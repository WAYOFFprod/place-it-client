import { ToolType } from "$lib/stores/toolStore";
import Tool from "../ToolClass";
import CursorIcon from "$lib/icons/cursor.svelte"
import Networker from "$lib/utility/Networker";
import { PUBLIC_WEBSOCKET_URL, PUBLIC_SERVER_URL } from '$env/static/public';

export default class PointTool extends Tool {
  static cursor = "pointer"
  static type = ToolType.Cursor
  static icon = CursorIcon

  networker: Networker = new Networker(PUBLIC_SERVER_URL, PUBLIC_WEBSOCKET_URL);

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
    // this.dragOffset.x = this.p5.mouseX - this.screenOffset.x;
    // this.dragOffset.y = this.p5.mouseY - this.screenOffset.y;
  // }

  mouseReleased() {

    // const coords: Coord = {
    //   x: Math.floor((this.p5.mouseX - this.screenOffset.x) / this.currentScale),
    //   y: Math.floor((this.p5.mouseY - this.screenOffset.y) / this.currentScale)
    // };
    // this.networker.placePixel(coords, color);
  }

  // mouseMove(isMouseDown: boolean) {
    
  // }

  getType: () => null | typeof Tool = () => {
    return PointTool
  }

}