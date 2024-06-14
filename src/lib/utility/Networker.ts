
import type GridManager from "$lib/p5/GridManager";
import ServerRequests from "./ServerRequests";
import { Socket, io } from 'socket.io-client';
import { PUBLIC_WEBSOCKET_URL, PUBLIC_SERVER_URL } from '$env/static/public';

export default class Networker {
  static #instance: Networker
  server: ServerRequests
  socket: Socket | undefined
  gridManager: GridManager | undefined
  tempPoints: {[key: string]: string} | undefined
  websocket: string

  static getInstance() {
    if (!this.#instance) {
      this.#instance = new Networker(PUBLIC_SERVER_URL, PUBLIC_WEBSOCKET_URL);
    }
    return this.#instance;
  }

  constructor(server: string, websocket: string) {
    this.websocket = websocket
    this.server = new ServerRequests(server+'/api');
  }

  connectToSocket = (gridManager: GridManager, callback: () => void) => {
    this.gridManager = gridManager;
    this.socket = io(this.websocket);
    
    this.socket.on("connect", () => {
      if(this.socket != undefined)
      this.socket.emit('get-pixels');
    });

    this.socket.on('init-pixels', (payload) => {
      if(this.gridManager != undefined)
      if(payload) {
        this.tempPoints = payload.pixels
        this.gridManager.attemptAddAdditionalPixels(this.tempPoints);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    this.gridManager = gridManager;
    // listen to socket server message
    this.socket.on('new-pixel-from-others', (coord, color) => {
      if(!this.gridManager) return console.error("missing grid manager");
      this.gridManager.drawPixelOnCanvas(coord, color);
    });

    this.socket.on('reset-others', () => {
      callback()
    });

  }

  getCanva = async (id: number = 1) => {
    const response = await this.server.get("/canva/"+id);
    return response;
  }

  placePixel = (coord: Coord, color: string | null) => {
    if(!color) {
      return console.error("no color selected");
    }
    if(!this.gridManager) {
      return console.error("missing grid manager");
    }
    const index = this.gridManager.drawPixelOnCanvas(coord, color);
    if(!index) return
    if(this.socket != undefined)
    this.socket.emit('new-pixel', index, coord, color);
  }

  addColors = async (id: number, colors: string[]) => {
    const payload = {
      id: id,
      colors: colors
    }
    const response = await this.server.post("/canvas/color/add", payload);
    return response;
  }

  createCanva = async (id: number = 1, size: Size2D) => {
    const response = await this.server.post("/canvas/create", size);
    if(this.socket != undefined)
    this.socket.emit('reset');
    return response;
  }

  disconnect = () => {
    if(this.socket != undefined)
    this.socket.disconnect();
  }

}