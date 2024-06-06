import P5 from 'p5';
import GridSection from './GridSection';

const PIXEL_IN_SECTION = 10;



export default class GridManager {
  p5: P5
  gridSections: GridSection[];
  canvas: {width: number, height: number};
  sectionGrid: {width: number, height: number};
  color: string = '#ffffff';
  pixelsAdded = false;

  constructor(p5: P5, canvas: Size2D) {
    // init values
    this.p5 = p5;
    this.gridSections = [];
    this.canvas = canvas;
    this.sectionGrid = {
      width: Math.floor(this.canvas.width / PIXEL_IN_SECTION),
      height: Math.floor(this.canvas.height / PIXEL_IN_SECTION)
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

    // add pixels that were on the live server
    this.attemptAddAdditionalPixels(this.additionalData);
  }

  attemptAddAdditionalPixels(additionalData: {[key: string]: string} = {}) {
    if(!this.pixelsAdded) {
      if(Object.keys(additionalData).length > 0) {
        for (const [id, color] of Object.entries(additionalData)) {
          const absolutePosition = this.getCoordFromIndex(parseInt(id), this.canvas.width);
          const gridIndex = this.getGridSectionIndex(absolutePosition);
          const relPosition = this.getRelativePixelPosition(absolutePosition);
          this.gridSections[gridIndex].drawPixel(relPosition, color);
          console.log("COORD", relPosition)
        }
        console.log("pixel added", additionalData);
        this.pixelsAdded = true
      }
    }
  }

  drawPixelsFromIndex = (data: {[key: string]: string}) => {
    if(data != null) {
      for (const [id, color] of Object.entries(data)) {
        const index = parseInt(id);
        const absolutePosition = this.getCoordFromIndex(index, this.canvas.width)
        const gridIndex = this.getGridSectionIndex(absolutePosition);
        const relPosition = this.getRelativePixelPosition(absolutePosition);
        this.gridSections[gridIndex].drawPixel(relPosition, color);
      }
    }
  }

  drawPixelOnCanvas = (absolutePosition: Coord, color: string) => {
    if(!this.isSectionIndexInBound(absolutePosition)) {
      return
    }
    
    const relPosition = this.getRelativePixelPosition(absolutePosition);
    const i = this.getGridSectionIndex(absolutePosition);
    this.gridSections[i].drawPixel(relPosition, color);
    return this.getAbsolutePixelPosition(absolutePosition);
  }

  updateCanvasPosition = () => {
    this.p5.fill(this.color)
    this.p5.noStroke()
    this.p5.rect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.gridSections.length; i++) {
      this.gridSections[i].updateCanvasPosition()
    }
  }

  private getGridSectionIndex(position: Coord): number {
    const gridX = Math.floor(position.x / PIXEL_IN_SECTION)
    const gridY = Math.floor(position.y / PIXEL_IN_SECTION)
    return gridX + (this.sectionGrid.width * gridY)
  }

  private getAbsolutePixelPosition(position: Coord): number {
    return position.x + (this.canvas.width * position.y)
  }

  /* return the position of a pixel as if all grid start at 0 */
  private getRelativePixelPosition(absolutePosition: Coord): Coord {
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