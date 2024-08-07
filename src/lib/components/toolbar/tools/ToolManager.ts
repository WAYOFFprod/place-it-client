import P5 from 'p5'
import Tool from '../ToolClass';
import { ToolType, destroyActiveTool, selectedTool, setTool } from '$lib/stores/toolStore';
import ControlManager from '../ControlManager';

export default class ToolManager {
  p5: P5
  activeTool: Tool | undefined;
  activeToolType: typeof Tool = Tool
  unsubscribeTool: any
  constructor(initialTool: ToolType, p5: P5) {
    this.p5 = p5
    this.setTool(initialTool);

    this.unsubscribeTool = selectedTool.subscribe((newTool: Tool | undefined) => {
      if(newTool == undefined) return;
      this.activeTool = newTool;
      const type = this.activeTool.getType()
      if(type == null) return;
      this.activeToolType = type;
    });
  }

  setTool(newTool: ToolType) {
    setTool(newTool, this.p5)
  }

  updateOffset() {
    if (this.activeTool) {
      ControlManager.screenOffset = this.activeTool.mouseMove(true);
    }
  }

  // returns boolean representing if tool should toggle mousedown variable
  mousePressed() {
    if(this.activeTool) {
      return this.activeTool.mousePressed(ControlManager.screenOffset);
    }
    return true
  }

  mouseReleased() {
    if(this.activeTool) {
      this.activeTool.mouseReleased();
    }
  }
  destroy() {
    this.unsubscribeTool()
    destroyActiveTool();
  }
}