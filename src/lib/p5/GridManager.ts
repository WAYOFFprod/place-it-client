import P5 from 'p5';
import GridSection from './GridSection';

let PIXEL_IN_SECTION: number;



export default class GridManager {
  p5: P5
  canvasId: number
  gridSections: GridSection[];
  canvas: {width: number, height: number};
  sectionGrid: {width: number, height: number};
  color: string = '#ffffff';
  pixelsAdded = false;
  imageLoaded = false;
  needsUpdate: boolean = true;
  screenOffset: Coord;
  previousScale: number;
  currentScale: number;
  
  marginBottom: number;
  
  overlay: P5.Graphics | null = null;
  overlayRectangleSize: Size2D;

  sel: {
    pos: Coord,
    size: Size2D
  } = {
    pos: {
      x: 0,
      y: 0
    },
    size: {
      width: 0,
      height: 0
    }
  }

  
  MIN_ZOOM = 0.5
  MAX_ZOOM = 128

  constructor(p5: P5, canvas: Size2D, canvasId: number, marginBottom: number) {
    // pixel per tile
    const MAX_PPT = 512
    const MIN_PPT = 32
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
    this.previousScale = this.currentScale = Math.max(widthRatio < heightRatio ? widthRatio : heightRatio, this.MIN_ZOOM);
    


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

    this.overlay = this.p5.createGraphics(this.canvas.height * this.currentScale, this.canvas.width * this.currentScale);
    this.overlayRectangleSize = {
      width: 0,
      height: 0
    }
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

  attemptAddAdditionalPixels(additionalData: {[key: string]: string} = {}) {
    if(!this.pixelsAdded && this.imageLoaded) {
      if(Object.keys(additionalData).length > 0) {
        this.addPixelsFromIndex(additionalData)
      }
    }
  }

  updateRectangleOverlay = (start: Coord, end: Coord, color: string) => {
    if(this.overlay == null) return;
    const startPos = {
      x: start.x > end.x ? end.x : start.x,
      y: start.y > end.y ? end.y : start.y
    };
    const endPos = {
      x: start.x > end.x ? start.x : end.x,
      y: start.y > end.y ? start.y : end.y
    };
    const widthInPixels = Math.abs(Math.round(startPos.x / this.currentScale) - Math.round(endPos.x / this.currentScale )) + 1;
    const heightInPixels = Math.abs(Math.round(startPos.y / this.currentScale) - Math.round(endPos.y / this.currentScale)) + 1;

    // don't rerender if the size of rectangle hasn't change
    if(widthInPixels - this.overlayRectangleSize.width == 0 
      && heightInPixels - this.overlayRectangleSize.height == 0) return;
    this.overlayRectangleSize = {
      width: widthInPixels,
      height: heightInPixels
    }

    this.overlay.clear();
    this.overlay.drawingContext.setLineDash([10, 10]);
    this.overlay.strokeCap(this.p5.SQUARE);
    this.overlay.noFill();
    this.overlay.stroke('black');
    this.overlay.strokeWeight(4);
    
    this.sel.pos = {
      x: Math.round(startPos.x / this.currentScale) * this.currentScale,
      y: Math.round(startPos.y / this.currentScale) * this.currentScale
    }

    this.sel.size = {
      width: this.overlayRectangleSize.width * this.currentScale,
      height: this.overlayRectangleSize.height * this.currentScale
    }

    this.overlay.rect(
      this.sel.pos.x,
      this.sel.pos.y,
      this.sel.size.width,
      this.sel.size.height
    );
    
    this.needsUpdate = true;
  }

  clipboard: P5.Image[] = []
  copySelection = () => {
    console.log("copy selection", this.sel);
    const startCoord: Coord = {
      x: Math.round((this.sel.pos.x) / this.currentScale),
      y: Math.round((this.sel.pos.y) / this.currentScale)
    };
    const endCoord: Coord = {
      x: Math.round((this.sel.pos.x + this.sel.size.width) / this.currentScale),
      y: Math.round((this.sel.pos.y + this.sel.size.height) / this.currentScale)
    };
    const startSection = this.getGridSectionIndex({
      x: startCoord.x,
      y: startCoord.y
    });
    const endSection = this.getGridSectionIndex({
      x: endCoord.x,
      y: endCoord.y
    });
    // let clipboard = [];
    this.clipboard = [];
    for (let index = startSection; index <= endSection; index++) {
      const start = this.getPositionRelativeToSection(startCoord)
      const end = this.getPositionRelativeToSection(endCoord)
      this.clipboard.push(this.gridSections[index].copyContent(start, end));
    }
    // console.log(clipboard[0])
  }

  pasteClipboard = () => {
    const startCoord: Coord = {
      x: Math.floor((this.sel.pos.x) / this.currentScale),
      y: Math.floor((this.sel.pos.y) / this.currentScale)
    };
    // const startSection = this.getGridSectionIndex({
    //   x: startCoord.x,
    //   y: startCoord.y
    // });

    const start = this.getPositionRelativeToSection(startCoord)
    this.gridSections[0].pasteContent(start, this.clipboard[0])
    this.needsUpdate = true;
  }

  addPixelsFromIndex = (data: {[key: string]: string}) => {
    if(data != null) {
      for (const [id, color] of Object.entries(data)) {
        const index = parseInt(id);
        const absolutePosition = this.getCoordFromIndex(index, this.canvas.width)
        const gridIndex = this.getGridSectionIndex(absolutePosition);
        const relPosition = this.getPositionRelativeToSection(absolutePosition);

        this.gridSections[gridIndex].storePixel(relPosition, color);
      }
    }
  }

  addPixelOnCanvas = (absolutePosition: Coord, color: string) => {
    if(!this.isSectionIndexInBound(absolutePosition)) {
      return false
    }
    
    const relPosition = this.getPositionRelativeToSection(absolutePosition);
    const i = this.getGridSectionIndex(absolutePosition);
    this.gridSections[i].storePixel(relPosition, color);
    this.needsUpdate = true;

    return this.getPixelPositionIndex(absolutePosition);
  }

  updateCanvasPosition = () => {
    this.p5.fill(this.color)
    this.p5.noStroke()
    this.p5.rect(0, 0, this.canvas.width, this.canvas.height);
    // tell each section to update
    for (let i = 0; i < this.gridSections.length; i++) {
      this.gridSections[i].updateCanvasPosition()
    }
    // update overlay
    if(this.overlay != null) {
      const scaleChange = this.currentScale/ this.previousScale;

      if(scaleChange != 0) {
        this.overlay.scale(this.canvas.width / (this.canvas.width * scaleChange));
        this.previousScale = this.currentScale;
      }
      this.p5.image(this.overlay, 0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private getGridSectionIndex(position: Coord): number {
    console.log("position", position);
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