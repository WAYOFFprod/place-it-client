import P5 from 'p5'
import Tool from '../ToolClass';
import { ToolType, destroyActiveTool, selectedTool, setToolset } from '$lib/stores/toolStore';
import ControlManager from '../ControlManager';
import { isWindowSmall } from '$lib/stores/tailwindStore';

export default class ToolManager {
  p5: P5
  activeTool: Tool | undefined;
  activeToolType: typeof Tool = Tool
  unsubscribeTool: any
  constructor(initialTool: ToolType, p5: P5) {
    this.p5 = p5
    isWindowSmall.subscribe((isSmall) => {
      if(isSmall) {
        setToolset('mobile', p5)
      } else {
        setToolset('desktop', p5)
      }
    })

    this.unsubscribeTool = selectedTool.subscribe((newTool: Tool | undefined) => {
      if(newTool == undefined) return;
      this.activeTool = newTool;
      const type = this.activeTool.getType()
      if(type == null) return;
      this.activeToolType = type;
    });
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