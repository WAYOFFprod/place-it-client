import { ToolType } from "$lib/stores/toolStore";

export interface selectToolEvent {
  selectTool: selectTool;
}

export interface selectTool {
  tool: ToolType
}