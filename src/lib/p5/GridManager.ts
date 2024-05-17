import P5 from 'p5';
import GridSection from './GridSection';

const PIXEL_IN_GRID = 128;


const colors = [
  "#292f56",
  "#35335e",
  "#403764",
  "#4d3a6b",
  "#5a3e71",
  "#674176",
  "#74447a",
  "#81477d",
  "#8e4a7f",
  "#9b4d81",
  "#a85082",
  "#b55482",
  "#c15981",
  "#cc5d80",
  "#d7637d",
  "#e1697b",
  "#ea7178",
  "#f37874",
  "#fa8170"
];

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
          color: colors[x + (this.sectionGrid.width * y)]
        }))
      }
    }
  }

  drawPixelOnCanvas = (absolutePosition: Coord, color: string) => {
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
  
}