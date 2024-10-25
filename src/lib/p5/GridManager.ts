import P5 from 'p5';
import GridSection from './GridSection';
import CanvaOverlay from './CanvaOverlay';
import { graphicToPixels } from '$lib/components/color/utils/converter';

let PIXEL_IN_SECTION: number;



export default class GridManager {
  p5: P5
  canvasId: number
  gridSections: GridSection[];
  overlay: CanvaOverlay;
  canvas: Size2D;
  sectionGrid: {width: number, height: number};
  color: string = '#ffffff';
  pixelsAdded = false;
  imageLoaded = false;
  needsUpdate: boolean = true;
  screenOffset: Coord;
  currentScale: number;
  
  marginBottom: number;

  
  MIN_ZOOM = 0.5
  MAX_ZOOM = 128

  constructor(p5: P5, canvas: Size2D, canvasId: number, marginBottom: number) {
    // pixel per tile
    const MAX_PPT = 16
    const MIN_PPT = 16
    let PPT = (Math.ceil(canvas.width/32) * 32);
    PPT = Math.max(PPT, MIN_PPT)
    PIXEL_IN_SECTION = Math.min(PPT, MAX_PPT)

    // init values
    this.canvasId = canvasId;
    this.marginBottom = marginBottom;
    this.p5 = p5;
    this.gridSections = [];
    this.canvas = canvas;
    this.sectionGrid = {
      width: Math.ceil(this.canvas.width / PIXEL_IN_SECTION),
      height: Math.ceil(this.canvas.height / PIXEL_IN_SECTION)
    }

    // set scaleFactor
    const widthRatio = this.p5.windowWidth / canvas.width;
		const heightRatio = (this.p5.windowHeight - this.marginBottom) / canvas.height;
    this.currentScale = Math.max(widthRatio < heightRatio ? widthRatio : heightRatio, this.MIN_ZOOM);
    


    // get screenCenter
    const screenCenter = {
      x: this.p5.windowWidth / 2,
      y: (this.p5.windowHeight - this.marginBottom) / 2
    };

    // set initial offset to center image
		const x = (canvas.width / 2) * this.currentScale;
		const y = (canvas.height / 2) * this.currentScale;
    
    // set initial offset
    this.screenOffset = {
      x: screenCenter.x - x,
      y: screenCenter.y - y
    };

    this.overlay = new CanvaOverlay(p5, this);

    // create gridSections
    for(let y = 0; y < this.canvas.height / PIXEL_IN_SECTION; y++) {
      for(let x = 0; x < this.canvas.width / PIXEL_IN_SECTION; x++) {
        this.gridSections.push(new GridSection(p5, {
          x: x,
          y: y,
          sectionOffset: 0,
          sectionWidth: PIXEL_IN_SECTION,
          sectionHeight: PIXEL_IN_SECTION
        }))

        
      }
    }
  }

  additionalData: {[key: string]: string} = {};

  loadImage = async (base64Image: string, size: Size2D, data: {[key: string]: string}) => {
    
    this.additionalData = data;
    this.p5.loadImage(base64Image, this.handleImage);
  }

  handleImage = (fullImage: P5.Image) => {
    // load pixel in each section image
    let imageSections: P5.Image[] = [];
    for (let i = 0; i < this.gridSections.length; i++) {
      const coords = this.getCoordFromIndex(i, this.sectionGrid.width);
      imageSections[i] = fullImage.get(
        coords.x * PIXEL_IN_SECTION,
        coords.y * PIXEL_IN_SECTION,
        PIXEL_IN_SECTION,
        PIXEL_IN_SECTION
      );
    }
    
    // initialise each section image
    for (let i = 0; i < this.gridSections.length; i++) {
      if(this.gridSections[i]) {
        this.gridSections[i].initilizeImage(imageSections[i])
      }
    };
    this.imageLoaded = true;

    // add pixels that were on the live server
    this.attemptAddAdditionalPixels(this.additionalData);
  }

  attemptAddAdditionalPixels(additionalData: Pixels = {}) {
    if(!this.pixelsAdded && this.imageLoaded) {
      if(Object.keys(additionalData).length > 0) {
        this.addPixelsToCanvaFromIndex(additionalData)
      }
    }
  }

  updateRectangleOverlay = (start: Coord, end: Coord, color: string) => {
    this.needsUpdate = this.overlay.updateOverlay(start, end, color);;
  }

  clipboard: P5.Graphics[] = []
  copySelection = () => {
    const {start, end} = this.overlay.getSelection();

    // init clipboard and graphic
    this.clipboard = [];
    const graphic = this.p5.createGraphics(end.x -start.x, end.y - start.y);
    graphic.pixelDensity(1);
    const copyOffset = {
      x: start.x,
      y: start.y
    }

    // for each concerned section, copy the content
    const sections = this.getConcernedSections(start, end);
    sections.forEach((sectionIndex) => {
      // get the relative start and end of the section
      const relStart = this.gridSections[sectionIndex].closestStartInBound(start);
      const relEnd = this.gridSections[sectionIndex].closestEndInBound(end);
      // get the section of the graphic
      const graphicSection = this.gridSections[sectionIndex].copyContent(relStart, relEnd);

      // get the relative position of the section to save it in the cliboard graphic
      const x = relStart.x - copyOffset.x;
      const y = relStart.y - copyOffset.y;
      graphic.set(x, y, graphicSection);
    });
    this.clipboard.push(graphic);
  }

  pasteClipboard = (): Pixels => {
    if(this.clipboard.length === 0) {
      console.warn("no clipboard to paste");
      return {};
    }

    const {start} = this.overlay.getSelection();
    const pixels = graphicToPixels(this.clipboard[0], start, this.canvas);
    
    this.needsUpdate = true;
    return pixels;
  }

  addPixelsToCanvaFromIndex = (data: Pixels) => {
    if(data != null) {
      for (const [id, color] of Object.entries(data)) {
        const index = parseInt(id);
        const absolutePosition = this.getCoordFromIndex(index, this.canvas.width)
        const gridIndex = this.getGridSectionIndex(absolutePosition);
        const relPosition = this.getPositionRelativeToSection(absolutePosition);

        this.gridSections[gridIndex].addPixelToImage(relPosition, color);
      }
    }
  }

  addPixelOnCanvas = (absolutePosition: Coord, color: string) => {
    if(!this.isSectionIndexInBound(absolutePosition)) {
      return false
    }
    
    const relPosition = this.getPositionRelativeToSection(absolutePosition);
    const i = this.getGridSectionIndex(absolutePosition);
    this.gridSections[i].addPixelToImage(relPosition, color);
    this.needsUpdate = true;
    
    return this.getPixelPositionIndex(absolutePosition);
  }

  refreshCanva = () => {
    this.p5.fill(this.color)
    this.p5.noStroke()
    this.p5.rect(0, 0, this.canvas.width, this.canvas.height);
    // tell each section to update
    for (let i = 0; i < this.gridSections.length; i++) {
      this.gridSections[i].updateCanvasPosition()
    }
    // update overlay
    this.overlay.refreshOverlay();
  }

  isInSelection = (x: number, y: number): boolean => {
    const mouseX = x - this.screenOffset.x;
    const mouseY = y - this.screenOffset.y;
    return this.overlay.isInSelection(mouseX, mouseY);
  }

  private getGridSectionIndex(position: Coord): number {
    const gridX = Math.floor(position.x / PIXEL_IN_SECTION)
    const gridY = Math.floor(position.y / PIXEL_IN_SECTION)
    return gridX + (this.sectionGrid.width * gridY)
  }

  private getPixelPositionIndex(position: Coord): number {
    return position.x + (this.canvas.width * position.y)
  }

  /* return the position of a pixel as if all grid start at 0 */
  private getPositionRelativeToSection(absolutePosition: Coord): Coord {
    return {
      x: absolutePosition.x % PIXEL_IN_SECTION,
      y: absolutePosition.y % PIXEL_IN_SECTION
    }
  }

  private getCoordFromIndex(index: number, width: number): Coord {
    return {
      x: index % width,
      y: Math.floor(index / width)
    }
  }

  private getConcernedSections(start: Coord, end: Coord): number[] {
    const startSection = this.getGridSectionIndex(start);
    const endSection = this.getGridSectionIndex(end);
    const sections = [];
    for (let i = startSection; i <= endSection; i++) {
      if(this.gridSections[i].isIntersecting(start, end)) {
        sections.push(i)
      } 
    }
    return sections
  }

  // check if pixel is in bound of canva
  private isSectionIndexInBound(coord: Coord): boolean {
    if(coord.x < 0 || coord.x >= this.canvas.width) {
      console.error("grid section not in bound x", coord.x);
      return false;
    } else if(coord.y < 0 || coord.y >= this.canvas.height) {
      console.error("grid section not in bound y", coord.y);
      return false;
    }
    return true;
  }
  
}