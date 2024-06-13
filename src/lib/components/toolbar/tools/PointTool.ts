import { ToolType } from "$lib/stores/toolStore";
import Tool from "../ToolClass";
import CursorIcon from "$lib/icons/cursor.svelte"
import Networker from "$lib/utility/Networker";

import ControlManager from "../ControlManager";
import { selectedColor } from "$lib/stores/colorStore";

export default class PointTool extends Tool {
  static cursor = "pointer"
  static type = ToolType.Cursor
  static icon = CursorIcon

  color: string | undefined;

  networker: Networker = Networker.getInstance();


  init() {
    selectedColor.subscribe((newColor) => {
      this.color = newColor;
    });
  }

  keyDown() {

  }

  keyUp() {

  }

  mouseReleased() {
    
    this.placePixel();
  }

  protected placePixel() {
    if(!this.color) return;
      // calculate on which pixel the mouse is over
    const coords: Coord = {
      x: Math.floor((this.p5.mouseX - ControlManager.screenOffset.x) / ControlManager.currentScale),
      y: Math.floor((this.p5.mouseY - ControlManager.screenOffset.y) / ControlManager.currentScale)
    };
    this.networker.placePixel(coords, this.color);
  }

  getType: () => null | typeof Tool = () => {
    return PointTool
  }

}