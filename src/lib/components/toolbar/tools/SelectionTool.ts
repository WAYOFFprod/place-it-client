import { ToolType } from "$lib/stores/toolStore";
import Tool from "../ToolClass";
import SelectionIcon from "$lib/icons/selection.svelte"

export default class SelectionTool extends Tool {
  static cursor = "selection"
  static type = ToolType.Selection
  static icon = SelectionIcon

  previousCanvaPosition: Coord = {
    x: 0,
    y: 0
  }
  currentCanvaPosition: Coord = {
    x: 0,
    y: 0
  }
  dragStart: Coord = {
    x: 0,
    y: 0
  }
  dragPrevious: Coord = {
    x: 0,
    y: 0
  }
  dragCurrent: Coord = {
		x: 0,
		y: 0
	};

  keyDown() {

  }

  keyUp() {
    // TODO: support CMD on mac instead of CTRL
    switch(this.p5.keyCode) {
      case 67: // C
        this.p5.keyIsDown(this.p5.CONTROL) ? this.copySelection() : null;
        break;
      case 86: // V
          this.p5.keyIsDown(this.p5.CONTROL) ? this.pasteClipboard() : null;
        break;
    }
    console.log(this.p5.keyCode)
  }

  mousePressed(screenOffset: Coord): boolean {
    this.controlManager.gridManager.screenOffset = screenOffset
    this.dragCurrent.x = this.dragStart.x = this.p5.mouseX - this.controlManager.gridManager.screenOffset.x;
    this.dragCurrent.y = this.dragStart.y = this.p5.mouseY - this.controlManager.gridManager.screenOffset.y;
    this.drawRectangle();
    return true;
  }

  mouseReleased() {
    this.dragPrevious = {
      x: 0,
      y: 0
    };
  }

  mouseMove(isMouseDown: boolean) {
    this.dragCurrent.x = this.p5.mouseX - this.controlManager.gridManager.screenOffset.x;
    this.dragCurrent.y = this.p5.mouseY - this.controlManager.gridManager.screenOffset.y;
    this.drawRectangle();
    return this.controlManager.gridManager.screenOffset;
  }

  getType: () => null | typeof Tool = () => {
    return SelectionTool
  }

  clipboard:any = null;
  protected copySelection() {
    this.clipboard = this.controlManager.gridManager.copySelection();
  }

  protected pasteClipboard() {
    this.controlManager.gridManager.pasteClipboard()
  }

  protected drawRectangle() {
    if(this.dragPrevious.x == this.dragCurrent.x && this.dragPrevious.y == this.dragCurrent.y) return;
    this.controlManager.gridManager.updateRectangleOverlay(this.dragStart, this.dragCurrent, "black");
    this.dragPrevious = {...this.dragCurrent};
  }

}