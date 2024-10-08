import { writable, type Writable } from 'svelte/store';
import P5 from 'p5';

import Tool, { ToolType } from '$lib/components/toolbar/ToolClass'

import MoveTool from "$lib/components/toolbar/tools/MoveTool";
import PointTool from "$lib/components/toolbar/tools/PointTool";
import EraserTool from '$lib/components/toolbar/tools/EraserTool';
import PlaceTool from '$lib/components/toolbar/tools/PlaceTool';


interface Tools {
  [key: string]: typeof Tool
}

let desktopToolClasses: Tools = {
  [ToolType.Hand]: MoveTool,
  [ToolType.Cursor]: PointTool,
  [ToolType.Eraser]: EraserTool,
}

let toolClasses: Writable<Tools | undefined> = writable<Tools>(undefined); 
let tools: Tools | undefined

let mobileToolClasses: Tools = {
  [ToolType.Hand]: MoveTool,
  // [ToolType.Eraser]: EraserTool,
  [ToolType.Place]: PlaceTool,
}

let readOnlytoolClasses: Tools = {
  [ToolType.Hand]: MoveTool,
  // [ToolType.Selection]: SelectionTool
}

let activeToolType: typeof Tool | undefined
let activeTool: Tool | undefined

let savedTool: Tool | undefined = activeTool
let p5: P5 | undefined

const selectedTool = writable<Tool | undefined>();

const destroyActiveTool = () => {
  if(activeTool != undefined) {
    activeTool.destroy();
  }
}

const setTool = (toolType: ToolType) => {
  if(tools == undefined) return;
  if(activeToolType != tools[toolType]) {
    destroyActiveTool();
  }
  activeToolType = tools[toolType];
  if(p5 == undefined) return;
  activeTool = new activeToolType(p5);
  selectedTool.set(activeTool);
}

const setToolset = (type: 'mobile' | 'desktop' | 'view-only', p5js: P5) => {
  if(toolClasses == undefined) return;
  p5 = p5js
  if(type == 'mobile') {
    toolClasses.set(mobileToolClasses);
    tools = mobileToolClasses;
    setTool(ToolType.Place);
  } else if(type == 'desktop') {
    toolClasses.set(desktopToolClasses);
    tools = desktopToolClasses;
    setTool(ToolType.Cursor);
  } else if(type == 'view-only') {
    toolClasses.set(readOnlytoolClasses);
    tools = readOnlytoolClasses;
    setTool(ToolType.Hand);
  }
}

const setTempTool = (toolType: ToolType, p5: P5) => {
  if(tools == undefined) return;
  savedTool = activeTool;
  activeToolType = tools[toolType];
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
  setToolset,
  setTool,
  ToolType,
  toolClasses,
  readOnlytoolClasses,
  destroyActiveTool
}