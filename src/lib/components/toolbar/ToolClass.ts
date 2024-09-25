
import P5 from 'p5';


export enum ToolType {
  Cursor = 'cursor',
  Hand = 'hand',
  Selection = 'selection',
  Eraser = 'eraser',
  Place = 'place'
}

export default class Tool {
  
  static cursor: string = ''
  static type: ToolType 
  static icon: any
  

  scaleFactor = 0;
  currentScale = 1

  isMouseDown = false;
  p5: P5

  constructor(p5: P5) {
    this.p5 = p5
    this.init()
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
    return {
      x: this.p5.mouseX,
      y: this.p5.mouseX
    };
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