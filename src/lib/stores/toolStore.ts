import { writable } from 'svelte/store';
import P5 from 'p5';

import Tool, { ToolType } from '$lib/components/toolbar/ToolClass'

import MoveTool from "$lib/components/toolbar/tools/MoveTool";
import PointTool from "$lib/components/toolbar/tools/PointTool";
import SelectionTool from "$lib/components/toolbar/tools/SelectionTool";


interface Tools {
  [key: string]: typeof Tool
}

let toolClasses: Tools = {
  [ToolType.Hand]: MoveTool,
  [ToolType.Cursor]: PointTool,
  // [ToolType.Selection]: SelectionTool
}

let activeToolType: typeof Tool = toolClasses[ToolType.Cursor]
let activeTool: Tool | undefined

let savedTool: Tool | undefined = activeTool

const selectedTool = writable<Tool | undefined>();

const setTool = (toolType: ToolType, p5: P5) => {
  activeToolType = toolClasses[toolType];
  activeTool = new activeToolType(p5);
  selectedTool.set(activeTool);
}

const setTempTool = (toolType: ToolType, p5: P5) => {
  savedTool = activeTool;
  activeToolType = toolClasses[toolType];
  activeTool = new activeToolType(p5);
  selectedTool.set(activeTool);
}

const backToTool = () => {
  activeTool = savedTool
  selectedTool.set(savedTool);
}

export {
  selectedTool,
  setTempTool,
  backToTool,
  setTool,
  ToolType,
  toolClasses
}