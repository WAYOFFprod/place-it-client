import { ToolType } from "$lib/stores/toolStore";
import Tool from "../ToolClass";
import SelectionIcon from "$lib/icons/selection.svelte"
import { writable, type Writable } from "svelte/store";

export default class SelectionTool extends Tool {
  static cursor = "selection"
  static type = ToolType.Selection
  static icon = SelectionIcon

  hover = writable<boolean>(false);

  cursorW: Writable<string> = writable<string>(SelectionTool.cursor);

  isHoveringSelection = false;
  getCursor(): string {
    this.cursorW.subscribe
    return this.hover ? SelectionTool.cursor : "hand"
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
  dragEnd: Coord = {
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
  }

  mousePressed(screenOffset: Coord): boolean {
    if(this.isHoveringSelection) return false;
    this.controlManager.gridManager.screenOffset = screenOffset
    this.dragCurrent.x = this.dragStart.x = this.p5.mouseX - this.controlManager.gridManager.screenOffset.x;
    this.dragCurrent.y = this.dragStart.y = this.p5.mouseY - this.controlManager.gridManager.screenOffset.y;
    this.drawRectangle();
    return true;
  }

  mouseReleased() {
    if(this.isHoveringSelection) return;
    this.dragEnd = {...this.dragCurrent};
    this.dragPrevious = {
      x: 0,
      y: 0
    };
  }

  mouseMove(isMouseDown: boolean) {
    if(isMouseDown) {
      if(!this.isHoveringSelection) {
        this.dragCurrent.x = this.p5.mouseX - this.controlManager.gridManager.screenOffset.x;
        this.dragCurrent.y = this.p5.mouseY - this.controlManager.gridManager.screenOffset.y;
        this.drawRectangle();
      }
    }
    this.defineCursor(isMouseDown)
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

  protected defineCursor(isMouseDown: boolean) {
    if(isMouseDown) {
      this.cursorW.set('selection')
      this.isHoveringSelection = false;
    } else if(this.controlManager.gridManager.isInSelection(this.p5.mouseX, this.p5.mouseY)) {
      this.isHoveringSelection = true;
      this.cursorW.set('hand')
    } else {
      this.isHoveringSelection = false;
      this.cursorW.set('selection')
    }
  }

}