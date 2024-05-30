import P5 from 'p5';

export default class GridSection {
  p5: P5
  img: P5.Image
  // position in canvas
  position: Coord
  offset: Coord
  colors = [] as string[]
  sectionWidth: number
  sectionHeight: number

  constructor(p5: P5, params: {x: number, y: number, sectionOffset: number, sectionWidth: number, sectionHeight: number}) {
    this.position = {
      x: params.x,
      y: params.y
    }

    this.sectionWidth = params.sectionWidth
    this.sectionHeight = params.sectionHeight
    this.p5 = p5

    this.img  = p5.createImage(params.sectionWidth, params.sectionHeight)
    this.offset = {
      x: params.x * params.sectionWidth,
      y: params.y * params.sectionHeight,
    }
  }

  draw = () => {
    this.img.loadPixels();

    for (const key in this.colors) {
      if (Object.hasOwnProperty.call(this.colors, key)) { 
        const color = this.colors[key];
        const id = parseInt(key);
        const x =  (id % this.sectionWidth)
        const y =  Math.floor(id / this.sectionWidth)

        // only render if in bounding box
        this.img.set(x, y, [this.p5.red(color), this.p5.green(color), this.p5.blue(color), 255]);
      }
    }
    this.img.updatePixels();

    this.p5.image(this.img, this.offset.x, this.offset.y)
  }

  updateCanvasPosition = () => {
    this.p5.image(this.img, this.offset.x, this.offset.y)
  }

  drawPixel(position: Coord, c: string) {
    const i = position.x + (this.sectionWidth * position.y)
    
    this.colors[i] = c
    this.draw()
  }

  getPixel(x: number, y: number) {
    const i = x + (this.sectionWidth * y)
    if(this.colors[i]) {
      return this.colors[i]
    } else {
      return false
    }
  }

  hasPixelAtPosition(x:number, y:number) {
    const i = x + (this.sectionWidth * y)
    if(this.colors[i]) {
      return true
    } else {
      return false
    }
  }
}