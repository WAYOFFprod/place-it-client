import { toolClasses, ToolType } from "$lib/stores/toolStore";
import Tool from "../ToolClass";
import PlusIcon from "$lib/icons/plus.svelte"
import Networker from "$lib/utility/Networker";

import ControlManager from "../ControlManager";
import { selectedColor } from "$lib/stores/colorStore";
import { get } from "svelte/store";

export default class PlaceTool extends Tool {
  static cursor = "place"
  static type = ToolType.Place
  static icon = PlusIcon
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
  // distance between fingers from the previous frame
  pinchDistance: number = 0;

  pixels: Coord[] = [];


  protected init() {
    try {
      this.controlManager = ControlManager.getInstance();
    } catch(e) {
      console.error("ControlManager not initialized", e);
    }
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
    const distance = this.p5.dist(this.p5.touches[0].x, this.p5.touches[0].y, 0, 0);
    this.pinchDistance = distance;
    console.log("this.controlManager.screenOffset", this.controlManager.screenOffset)
    this.controlManager.screenOffset = screenOffset
    this.dragOffset.x = this.p5.touches[0].x - screenOffset.x;
    this.dragOffset.y = this.p5.touches[0].y - screenOffset.y;
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
    if(this.dragOffset.x == 0 && this.dragOffset.y == 0) return this.controlManager.screenOffset;
    if(this.p5.touches.length >= 2) {
      // zoom
      const distance = this.p5.dist(this.p5.touches[0].x, this.p5.touches[0].y, this.p5.touches[1].x, this.p5.touches[1].y);
      const scaleFactor = distance / this.pinchDistance;
      console.log("scaleFactor", scaleFactor);
      const newCurrentScale = this.controlManager.currentScale * scaleFactor;
      let newScaleFactor =  newCurrentScale / this.controlManager.currentScale
      this.controlManager.scroll(newScaleFactor)

      this.pinchDistance = distance;
    } else {
      // drag
      this.controlManager.screenOffset.x = this.p5.mouseX - this.dragOffset.x;
      this.controlManager.screenOffset.y = this.p5.mouseY - this.dragOffset.y;
    }
    
    // to move KEEP
    return this.controlManager.screenOffset;
  }

  protected placePixel() {
    if(!PlaceTool.color) return;
    // calculate on which pixel the mouse is over
    const coords: Coord = {
      x: Math.floor(((window.innerWidth / 2) -this.controlManager.screenOffset.x) / this.controlManager.currentScale),
      y: Math.floor((((window.innerHeight - 56) / 2 ) -this.controlManager.screenOffset.y) / this.controlManager.currentScale)
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