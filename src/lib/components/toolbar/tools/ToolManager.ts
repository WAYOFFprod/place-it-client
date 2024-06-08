import P5 from 'p5'
import Tool from '../ToolClass';
import { ToolType, selectedTool, setTool } from '$lib/stores/toolStore';
import ControlManager from '../ControlManager';

export default class ToolManager {
  p5: P5
  activeTool: Tool | undefined;
  activeToolType: typeof Tool = Tool

  constructor(initialTool: ToolType, p5: P5) {
    this.p5 = p5
    this.setTool(initialTool);

    selectedTool.subscribe((newTool: Tool | undefined) => {
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
}