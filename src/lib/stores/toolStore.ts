import { writable } from 'svelte/store';
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

let toolClasses = writable<Tools>(desktopToolClasses); 
let tools: Tools = desktopToolClasses;
let mobileToolClasses: Tools = {
  [ToolType.Hand]: MoveTool,
  // [ToolType.Eraser]: EraserTool,
  [ToolType.Place]: PlaceTool,
}

let readOnlytoolClasses: Tools = {
  [ToolType.Hand]: MoveTool,
  // [ToolType.Selection]: SelectionTool
}

let activeToolType: typeof Tool = tools[ToolType.Cursor]
let activeTool: Tool | undefined

let savedTool: Tool | undefined = activeTool
let p5: P5 | undefined

const selectedTool = writable<Tool | undefined>();


const initTools = (viewOnly: boolean) => {
  if(viewOnly) {
    toolClasses.set(readOnlytoolClasses);
    tools = readOnlytoolClasses;
  } else {
    toolClasses.set(desktopToolClasses);
    tools = desktopToolClasses;
  }
  setTool(ToolType.Cursor);
}

const destroyActiveTool = () => {
  if(activeTool != undefined) {
    activeTool.destroy();
  }
}

const setTool = (toolType: ToolType) => {
  if(activeToolType != tools[toolType]) {
    destroyActiveTool();
  }
  activeToolType = tools[toolType];
  if(p5 == undefined) return;
  activeTool = new activeToolType(p5);
  selectedTool.set(activeTool);
}

const setToolset = (type: 'mobile' | 'desktop', p5js: P5) => {
  p5 = p5js
  if(type == 'mobile') {
    toolClasses.set(mobileToolClasses);
    tools = mobileToolClasses;
    setTool(ToolType.Place);
  } else {
    toolClasses.set(desktopToolClasses);
    tools = desktopToolClasses;
    setTool(ToolType.Cursor);
  }
}

toolClasses.subscribe((newClasses) => {
  tools = newClasses;
})

const setTempTool = (toolType: ToolType, p5: P5) => {
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
  initTools,
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