import { ToolType } from "$lib/stores/toolStore";
import Tool from "../ToolClass";
import CursorIcon from "$lib/icons/cursor.svelte"
import Networker from "$lib/utility/Networker";

import ControlManager from "../ControlManager";
import { selectedColor } from "$lib/stores/colorStore";
import { get } from "svelte/store";

export default class PlaceTool extends Tool {
  static cursor = "pointer"
  static type = ToolType.Place
  static icon = CursorIcon
  static unsubscribeColors: any | undefined = undefined;
  static color: string | undefined;

  interval: any;
  timer: number = 0;
  
  
  networker: Networker = Networker.getInstance();
  
  // original position adjusted to screenoffset at the start of dragging
	dragOffset: Coord = {
		x: 0,
		y: 0
	};

  pixels: Coord[] = [];


  protected init() {
    PlaceTool.color = get(selectedColor);
    PlaceTool.unsubscribeColors = selectedColor.subscribe((newColor) => {
      PlaceTool.color = newColor;
    });
  }

  keyDown() {

  }

  keyUp() {

  }

  mousePressed(screenOffset: Coord) {
    ControlManager.screenOffset = screenOffset
    this.dragOffset.x = this.p5.mouseX - ControlManager.screenOffset.x;
    this.dragOffset.y = this.p5.mouseY - ControlManager.screenOffset.y;
    this.startTimer();
    return true
  }

  startTimer() {
    this.timer = 0;
    this.interval = setInterval(() => this.timer++, 10)
  }
  mouseReleased() {
    if(this.timer < 10) {
      this.placePixel();
      this.pixels = []
    }
    clearInterval(this.interval);
    this.timer = 0;
  }

  mouseMove(isMouseDown: boolean) {
    if(this.dragOffset.x == 0 && this.dragOffset.y == 0) return ControlManager.screenOffset;
    ControlManager.screenOffset.x = this.p5.mouseX - this.dragOffset.x;
    ControlManager.screenOffset.y = this.p5.mouseY - this.dragOffset.y;
    return ControlManager.screenOffset;
  }

  protected placePixel() {
    if(!PlaceTool.color) return;
    // calculate on which pixel the mouse is over
    const coords: Coord = {
      x: Math.floor(((window.innerWidth / 2) -ControlManager.screenOffset.x) / ControlManager.currentScale),
      y: Math.floor(((window.innerHeight / 2) -ControlManager.screenOffset.y) / ControlManager.currentScale)
    };
    this.pixels.push(coords);
    this.networker.placePixel(coords, PlaceTool.color);
  }


  getType: () => null | typeof Tool = () => {
    return PlaceTool
  }

  destroy() {
    if(PlaceTool.unsubscribeColors) {
      PlaceTool.unsubscribeColors();
    }
  }

}