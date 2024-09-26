import { ToolType } from "$lib/stores/toolStore";
import Tool from "../ToolClass";
import CursorIcon from "$lib/icons/cursor.svelte"
import Networker from "$lib/utility/Networker";

import ControlManager from "../ControlManager";
import { selectedColor } from "$lib/stores/colorStore";
import { get } from "svelte/store";

export default class PointTool extends Tool {
  static cursor = "pointer"
  static type = ToolType.Cursor
  static icon = CursorIcon
  static unsubscribeColors: any | undefined = undefined;
  static color: string | undefined;


  networker: Networker = Networker.getInstance();

  pixels: Coord[] = [];


  protected init() {
    PointTool.color = get(selectedColor);
    PointTool.unsubscribeColors = selectedColor.subscribe((newColor) => {
      PointTool.color = newColor;
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
    if(!PointTool.color || !isMouseDown) return {
      x: this.screenOffset.x,
      y: this.screenOffset.y
    };

    // check if mouse position in on new pixel
    const coords: Coord = {
      x: Math.floor((this.p5.mouseX - this.screenOffset.x) / this.currentScale),
      y: Math.floor((this.p5.mouseY - this.screenOffset.y) / this.currentScale)
    };

    // if these coords are new in this stroke add it to array and place pixel
    if(!this.pixels.find(coord => coord.x == coords.x && coord.y == coords.y)) {
      this.pixels.push(coords);
      this.networker.placePixel(coords, PointTool.color);
    }

    // return save offset in order to not move screen
    return {
      x: this.screenOffset.x,
      y: this.screenOffset.y
    };
  }

  protected placePixel() {
    if(!PointTool.color) return;
    // calculate on which pixel the mouse is over
    const coords: Coord = {
      x: Math.floor((this.p5.mouseX - this.screenOffset.x) / this.currentScale),
      y: Math.floor((this.p5.mouseY - this.screenOffset.y) / this.currentScale)
    };
    this.pixels.push(coords);
    this.networker.placePixel(coords, PointTool.color);
  }


  getType: () => null | typeof Tool = () => {
    return PointTool
  }

  destroy() {
    if(PointTool.unsubscribeColors) {
      PointTool.unsubscribeColors();
    }
  }

}