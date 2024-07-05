
import type GridManager from "$lib/p5/GridManager";
import ServerRequests from "./ServerRequests";
import { Socket, io } from 'socket.io-client';
import { PUBLIC_WEBSOCKET_URL, PUBLIC_SERVER_URL } from '$env/static/public';
import { chatMessages } from "$lib/stores/chatStore";
import { authStatus, userStore } from "$lib/stores/authStore";

export default class Networker {
  static #instance: Networker
  shortClientId: string | undefined;
  server: ServerRequests
  socket: Socket | undefined
  gridManager: GridManager | undefined
  tempPoints: {[key: string]: string} | undefined
  websocket: string
  messages: Message[] = []
  canvasId: number | undefined

  static getInstance() {
    if (!this.#instance) {
      this.#instance = new Networker(PUBLIC_SERVER_URL, PUBLIC_WEBSOCKET_URL);
    }
    return this.#instance;
  }

  constructor(server: string, websocket: string) {
    this.websocket = websocket
    this.server = new ServerRequests(server);
    this.server.get('/sanctum/csrf-cookie');
  }

  connectToSocket = (gridManager: GridManager, getPixel: () => void) => {
    this.gridManager = gridManager;
    this.socket = io(this.websocket);
    
    this.socket.on("connect", () => {
      if(this.socket != undefined)
      this.socket.emit('init');
      this.shortClientId = this.socket?.id?.slice(6);
    });

    this.socket.on('canva:init-pixels', (payload) => {
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
    
    this.socket.on('canva:new-pixel-from-others', (coord, color) => {
      console.log("NEW PIXEL FROM OTHERS");
      if(!this.gridManager) return console.error("missing grid manager");
      this.gridManager.drawPixelOnCanvas(coord, color);
    });

    this.socket.on('canva:reset-others', () => {
      getPixel()
    });

    this.socket.on('chat:get-message', (message: Message) => {
      this.messages.push(message)
      chatMessages.set(this.messages);
    });

    this.socket.on('chat:init-messages', (newMessages: string[]) => {
      const messages = newMessages.map(x => {
        return JSON.parse(x)
      })

      this.messages = messages
      chatMessages.set(this.messages);
    });
  }

  // Auth

  login = async (payload: LoginPayload) => {
    await this.server.get('/sanctum/csrf-cookie')
    const response = await this.server.post("/auth/login/", payload);
    console.log(response);
    if(response?.status == 200) {
      authStatus.set(true);
    }
  }

  getSession = async () => {
    const response = await this.server.get('/session')
    if(response.isConnected) {
      userStore.set(response.user);
      authStatus.set(true);
    } else {
      authStatus.set(false);
    }
  }

  saveField = async (payload: SettingOption) => {
    const response = await this.server.post('/user/update/', payload)
    if(response?.response.user) {
      userStore.set(response.response.user);
      authStatus.set(true);
    }
  }

  // Canvas
  joinCanva = async (id: number) => {
    const response: any = await this.server.get('/canva/join/'+id);
    return response;
  }

  getCanvas = async (scope: 'personal' | 'community') => {
    const response: any = await this.server.get("/canvas/?scope="+scope);
    return response;
  }

  getCanva = async (id: number) => {
    const response = await this.server.get("/canvas/"+id);
    return response.data;
  }

  deleteCanva = async (id: number) => {
    const response = await this.server.delete("/canvas/"+id);
    return response;
  }

  loadCanva = (canvaId: number) => {
    this.socket?.emit('join-room', {
      "canvaId": canvaId,
      "user": 'TODO'
    })
  }

  placePixel = (coord: Coord, color: string | null) => {
    if(!color) {
      return console.error("no color selected");
    }
    if(!this.gridManager) {
      return console.error("missing grid manager");
    }
    const index = this.gridManager.drawPixelOnCanvas(coord, color);
    if(index === false) return
    if(this.socket != undefined)
      this.socket.emit('canva:new-pixel:'+this.gridManager.canvasId, index, coord, color);

  }

  addColors = async (id: number, colors: string[]) => {
    const payload = {
      id: id,
      colors: colors
    }
    const response = await this.server.post("/canvas/color/add/", payload);
    return response;
  }

  createCanva = async (payload: CreateCanvaPayload) => {
    const response = await this.server.post("/canvas/create", payload);
    if(this.socket != undefined)
    this.socket.emit('canva:reset');
    return response;
  }

  // Messages

  sendMessage(message: Message) {
    if(this.socket != undefined) {
      this.socket.emit('chat:new-message', message);
      this.messages.push(message)
      chatMessages.set(this.messages);
    }
  }

  disconnect = () => {
    if(this.socket != undefined)
    this.socket.disconnect();
  }

}