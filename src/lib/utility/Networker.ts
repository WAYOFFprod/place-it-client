import type GridManager from "$lib/p5/GridManager";
import ServerRequests from "./ServerRequests";
import { Socket, io } from 'socket.io-client';

export default class Networker {
  server: ServerRequests
  socket: Socket
  gridManager: GridManager | undefined
  constructor() {

    this.server = new ServerRequests('https://server.place-it.wayoff.tv');
    this.socket = io('https://place-it-websocket-release.onrender.com');
    // this.server = new ServerRequests('http://localhost/api');
    // this.socket = io('http://localhost:3000');
  }

  connectToSocket = (gridManager: GridManager, callback: () => void) => {
    this.gridManager = gridManager;

    this.socket.connect();
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
    this.socket.emit('new-pixel', index, coord, color);
  }

  clearCanva = async (id: number = 1) => {
    const size = {
      width: 20,
      height: 20
    }
    const response = await this.server.post("/canvas/create", size);
    this.socket.emit('reset');
    return response;
  }

  disconnect = () => {
    this.socket.disconnect();
  }

}