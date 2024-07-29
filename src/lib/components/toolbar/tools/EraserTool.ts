import { ToolType } from "$lib/stores/toolStore";
import Tool from "../ToolClass";
import EraseIcon from "$lib/icons/erase.svelte"
import ControlManager from "../ControlManager";
import Networker from "$lib/utility/Networker";

export default class EraserTool extends Tool {
  static cursor = "eraser"
  static type = ToolType.Eraser
  static icon = EraseIcon


  networker: Networker = Networker.getInstance();

  pixels: Coord[] = [];


  protected init() {
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
    if(!isMouseDown) return {
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
      this.networker.placePixel(coords, '#ffffff');
    }

    // return save offset in order to not move screen
    return {
      x: ControlManager.screenOffset.x,
      y: ControlManager.screenOffset.y
    };
  }

  protected placePixel() {
    // calculate on which pixel the mouse is over
    const coords: Coord = {
      x: Math.floor((this.p5.mouseX - ControlManager.screenOffset.x) / ControlManager.currentScale),
      y: Math.floor((this.p5.mouseY - ControlManager.screenOffset.y) / ControlManager.currentScale)
    };
    this.pixels.push(coords);
    this.networker.placePixel(coords, '#ffffff');
  }


  getType: () => null | typeof Tool = () => {
    return EraserTool
  }

  destroy() {
    
  }

}