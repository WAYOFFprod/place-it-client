import { setTool, ToolType } from "$lib/stores/toolStore";
import Tool from "../ToolClass";
import EraseIcon from "$lib/icons/erase.svelte"
import Networker from "$lib/utility/Networker";
import { selectedColor } from "$lib/stores/colorStore";
import type { Unsubscriber } from "svelte/motion";
import { writable, type Writable } from "svelte/store";

export default class EraserTool extends Tool {
  static cursor = "eraser"
  static type = ToolType.Eraser
  static icon = EraseIcon
  // color
  static unsubscribeSelectedColor: Unsubscriber | undefined;
  static init: boolean = false
  static savedColor: string = '';

  cursorW: Writable<string> = writable<string>(EraserTool.cursor);

  networker: Networker = Networker.getInstance();

  pixels: Coord[] = [];

  protected init() {
    EraserTool.unsubscribeSelectedColor = selectedColor.subscribe((newColor) => {
      if(EraserTool.init) {
        if(newColor != '') {
          EraserTool.savedColor = ''
          setTool(ToolType.Cursor);
        }
      } else {
        EraserTool.savedColor = newColor;
        EraserTool.init = true;
        selectedColor.set('')
      }
    });
  }

  keyDown() {

  }

  keyUp() {

  }

  mousePressed(_mousePressed: Coord) {
    this.placePixel();
    return true
  }

  mouseReleased() {
    this.pixels = []
  }

  mouseMove(isMouseDown: boolean) {
    if(!isMouseDown) return this.controlManager.gridManager.screenOffset;

    // check if mouse position in on new pixel
    const coords: Coord = {
      x: Math.floor((this.p5.mouseX - this.controlManager.gridManager.screenOffset.x) / this.controlManager.gridManager.currentScale),
      y: Math.floor((this.p5.mouseY - this.controlManager.gridManager.screenOffset.y) / this.controlManager.gridManager.currentScale)
    };

    // if these coords are new in this stroke add it to array and place pixel
    if(!this.pixels.find(coord => coord.x == coords.x && coord.y == coords.y)) {
      this.pixels.push(coords);
      this.networker.savePixel(coords, '#ffffff');
    }

    // return save offset in order to not move screen
    return {
      x: this.controlManager.gridManager.screenOffset.x,
      y: this.controlManager.gridManager.screenOffset.y
    };
  }

  protected Pixel() {
    // calculate on which pixel the mouse is over
    const coords: Coord = {
      x: Math.floor((this.p5.mouseX - this.controlManager.gridManager.screenOffset.x) / this.controlManager.gridManager.currentScale),
      y: Math.floor((this.p5.mouseY - this.controlManager.gridManager.screenOffset.y) / this.controlManager.gridManager.currentScale)
    };
    this.pixels.push(coords);
    this.networker.savePixel(coords, '#ffffff');
  }


  getType: () => null | typeof Tool = () => {
    return EraserTool
  }

  destroy() {
    EraserTool.init = false;
    if(EraserTool.unsubscribeSelectedColor) {
      EraserTool.unsubscribeSelectedColor();
    }
    if(EraserTool.savedColor != '') {
      selectedColor.set(EraserTool.savedColor);
    }
  }

}