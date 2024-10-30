
import P5 from 'p5';
import ControlManager from './ControlManager';
import { writable, type Writable } from 'svelte/store';


export enum ToolType {
  Cursor = 'cursor',
  Hand = 'hand',
  Selection = 'selection',
  Eraser = 'eraser',
  Place = 'place',
  Rect = 'rect'
}

export default class Tool {
  
  static cursor: string = 'pointer'
  static type: ToolType 
  static icon: any

  cursorW: Writable<string> = writable<string>(Tool.cursor);
  getCursor(): string {
    return Tool.cursor;
  }
  

  scaleFactor = 0;

  isMouseDown = false;
  p5: P5
  controlManager: ControlManager;

  constructor(p5: P5) {
    this.p5 = p5
    this.init()
    this.controlManager =  ControlManager.getInstance();
  }


  protected init() {
    // do something if need for tool initialisation
  }

  keyDown() {
    this.isMouseDown = true;
    console.log(`keyup with cursor-${Tool.cursor}`)
  }

  keyUp() {
    this.isMouseDown = false;
    console.log(`keydown with cursor-${Tool.cursor}`)
  }

  mouseMove(isMouseDown: boolean): Coord {
    if(isMouseDown) return {
      x: this.p5.mouseX,
      y: this.p5.mouseX
    };
    return this.controlManager.gridManager.screenOffset
  }

  // returns: boolean that represent if pressing down should be saved
  mousePressed(_mousePressed: Coord): boolean {
    return false
  }

  // returns: boolean that represent if it should place pixel
  mouseReleased() {

  }


  getType: () => null | typeof Tool = () => {
    return null
  }

  destroy() {

  }

}