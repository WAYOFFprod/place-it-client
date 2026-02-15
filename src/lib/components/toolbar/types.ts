import { ToolType } from '$lib/stores/toolStore';

export interface SelectToolEvent {
	selectTool: SelectTool;
}

export interface SelectTool {
	tool: ToolType;
}
