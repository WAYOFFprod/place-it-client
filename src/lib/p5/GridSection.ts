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

  initilizeImage = (image: P5.Image) => {
    this.img = image;
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
    
    // this.p5.image(this.img, this.offset.x, this.offset.y)
  }

  updateCanvasPosition = () => {
    this.p5.image(this.img, this.offset.x, this.offset.y)

    // debug
    // this.p5.stroke(0,255)
    // this.p5.noFill()
    // this.p5.strokeWeight(0.1)
    // this.p5.rect(this.offset.x, this.offset.y, this.sectionWidth, this.sectionHeight)
  }

  storePixel(position: Coord, c: string) {
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

  copyContent(start: Coord, end: Coord ) {
    const relStart = {
      x: start.x - this.offset.x,
      y: start.y - this.offset.y
    }
    const relEnd = {
      x: end.x - this.offset.x,
      y: end.y - this.offset.y
    }
    const x = relStart.x;
    const y = relStart.y;
    const w = relEnd.x - relStart.x;
    const h = relEnd.y - relStart.y;
    return this.img.get(x, y, w, h);
  }

  pasteContent(start: Coord, end: Coord,initialOffset:Coord, image: P5.Graphics) {
    const relStart = {
      x: start.x - this.offset.x,
      y: start.y - this.offset.y
    }
    const relEnd = {
      x: end.x - this.offset.x,
      y: end.y - this.offset.y
    }

    const x = start.x - initialOffset.x;
    const y = start.y - initialOffset.y;
    const w = relEnd.x - relStart.x;
    const h = relEnd.y - relStart.y;

    const sectionGraphic = image.get(x, y, w, h);
    this.img.set(relStart.x, relStart.y, sectionGraphic);
    
    // TODO: use updatePixel way
    // TODO: save to server as well
    
    // for (const key in this.colors) {
    //   if (Object.hasOwnProperty.call(this.colors, key)) { 
    //     const color = this.colors[key];
    //     const id = parseInt(key);
    //     const x =  (id % this.sectionWidth)
    //     const y =  Math.floor(id / this.sectionWidth)

    //     // only render if in bounding box
    //     this.img.set(x, y, [this.p5.red(color), this.p5.green(color), this.p5.blue(color), 255]);
    //   }
    // }
    // this.img.updatePixels();
  }

  isIntersecting(start: Coord, end: Coord): boolean {
    // Check if one rectangle is to the left of the other
    if (end.x < this.offset.x) {
      return false;
    }

    // Check if one rectangle is above the other
    if (end.y < this.offset.y) {
      return false;
    }

    // Check if one rectangle is to the right of the other
    if (start.x > this.offset.x + this.sectionWidth) {
      return false;
    }

    // Check if one rectangle is below the other
    if (start.y > this.offset.y + this.sectionHeight) {
      return false;
    }

    // If neither of the above conditions is true, the rectangles are intersecting
    return true;
  }

  // if point is off canvas (start), return the closest point in bound
  closestStartInBound(start: Coord): Coord {
    const furtherPixel = {
      x: this.position.x * this.sectionWidth,
      y: this.position.y * this.sectionHeight
    }
    const x = furtherPixel.x < start.x ? start.x : furtherPixel.x;
    const y = furtherPixel.y < start.y ? start.y : furtherPixel.y;
    return {x, y}
  }
  closestEndInBound(end: Coord): Coord {
    const furtherPixel = {
      x: (this.position.x+1) * (this.sectionWidth),
      y: (this.position.y+1) * (this.sectionHeight)
    }
    const x = furtherPixel.x > end.x ? end.x : furtherPixel.x;
    const y = furtherPixel.y > end.y ? end.y : furtherPixel.y;
    return {x, y}
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