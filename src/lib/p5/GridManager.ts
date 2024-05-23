import P5 from 'p5';
import GridSection from './GridSection';

const PIXEL_IN_GRID = 128;

export default class GridManager {
  p5: P5
  gridSections: GridSection[];
  canvas: {width: number, height: number};
  sectionGrid: {width: number, height: number};

  constructor(p5: P5, canvas: {width: number, height: number}) {
    // init values
    this.p5 = p5;
    this.gridSections = [];
    this.canvas = canvas;
    this.sectionGrid = {
      width: Math.floor(this.canvas.width / PIXEL_IN_GRID),
      height: Math.floor(this.canvas.height / PIXEL_IN_GRID)
    }


    // create gridSections
    for(let y = 0; y < this.canvas.width / PIXEL_IN_GRID; y++) {
      for(let x = 0; x < this.canvas.width / PIXEL_IN_GRID; x++) {
        this.gridSections.push(new GridSection(p5, {
          x: x,
          y: y,
          sectionOffset: 0,
          sectionWidth: PIXEL_IN_GRID,
        }))
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
  }

  updateCanvasPosition = () => {
    for (let i = 0; i < this.gridSections.length; i++) {
      this.gridSections[i].updateCanvasPosition()
    }
  }

  private getGridSectionIndex(position: Coord): number {
    const gridX = Math.floor(position.x / PIXEL_IN_GRID)
    const gridY = Math.floor(position.y / PIXEL_IN_GRID)
    return gridX + (this.sectionGrid.width * gridY)
  }
  /* return the position of a pixel as if all grid start at 0 */
  private getRelativePixelPosition(absolutePosition: Coord): Coord {
    return {
      x: absolutePosition.x % PIXEL_IN_GRID,
      y: absolutePosition.y % PIXEL_IN_GRID
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