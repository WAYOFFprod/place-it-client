
import P5 from 'p5';


export enum ToolType {
  Cursor = 'cursor',
  Hand = 'hand',
  Selection = 'selection'
}

export default class Tool {
  
  static cursor: string = ''
  static type: ToolType 
  static icon: any


  screenOffset: Coord = {
		x: 0,
		y: 0
	};

  isMouseDown = false;
  p5: P5
  constructor(p5: P5) {
    this.p5 = p5
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

  mousePressed(mousePressed: Coord): boolean {
    return false
  }

  mouseReleased() {

  }


  getType: () => null | typeof Tool = () => {
    return null
  }

}