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

  pixels: Coord[] = []

  init() {
    selectedColor.subscribe((newColor) => {
      this.color = newColor;
    });
  }

  keyDown() {

  }

  keyUp() {

  }

  mousePressed(mousePressed: Coord) {
    this.placePixel();
    return true
  }

  mouseReleased() {
    this.pixels = []
  }

  mouseMove(isMouseDown: boolean) {
    if(!this.color || !isMouseDown) return {
      x: ControlManager.screenOffset.x,
      y: ControlManager.screenOffset.y
    };

    // check if mouse position in on new pixel
    const coords: Coord = {
      x: Math.floor((this.p5.mouseX - ControlManager.screenOffset.x) / ControlManager.currentScale),
      y: Math.floor((this.p5.mouseY - ControlManager.screenOffset.y) / ControlManager.currentScale)
    };

    // if these coords are new in this stroke add it to array and place pixel
    if(!this.pixels.find(coord => coord.x == coords.x && coord.y == coords.y)) {
      this.pixels.push(coords);
      this.networker.placePixel(coords, this.color);
    }

    // return save offset in order to not move screen
    return {
      x: ControlManager.screenOffset.x,
      y: ControlManager.screenOffset.y
    };
  }

  protected placePixel() {
    if(!this.color) return;
    // calculate on which pixel the mouse is over
    const coords: Coord = {
      x: Math.floor((this.p5.mouseX - ControlManager.screenOffset.x) / ControlManager.currentScale),
      y: Math.floor((this.p5.mouseY - ControlManager.screenOffset.y) / ControlManager.currentScale)
      };
    this.pixels.push(coords);
    this.networker.placePixel(coords, this.color);
  }


  getType: () => null | typeof Tool = () => {
    return PointTool
  }

}