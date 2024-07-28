
import type GridManager from "$lib/p5/GridManager";
import ServerRequests from "./ServerRequests";
import { Socket, io } from 'socket.io-client';
import { PUBLIC_WEBSOCKET_URL, PUBLIC_SERVER_URL } from '$env/static/public';
import { chatMessages } from "$lib/stores/chatStore";
import { authStatus, tokenStore, userStore } from "$lib/stores/authStore";
import { isReady } from "$lib/stores/canvaStore";

export default class Networker {
  static #instance: Networker
  shortClientId: string | undefined;
  server: ServerRequests
  socket: Socket | undefined
  gridManager: GridManager | undefined
  tempPoints: {[key: string]: string} | undefined
  websocket: string
  messages: Message[] = []
  userData: User | undefined
  canvaToken: string | undefined

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
    userStore.subscribe((newUserData: User | undefined) => {
      this.userData = newUserData;
    })
    tokenStore.subscribe((newToken) => {
      this.canvaToken = newToken
    })
  }

  connectToSocket = (gridManager: GridManager, getPixel: () => void) => {
    this.gridManager = gridManager;
    this.socket = io(this.websocket);
    
    this.socket.on('error', (payload) => {
      console.error(payload);
    })

    this.socket.on("connect", () => {
      if(this.socket != undefined && this.gridManager != null)
      this.socket.emit('get-init-state', {
        'canvaId': this.gridManager.canvasId
      });
      this.shortClientId = this.socket?.id?.slice(6);
    });

    this.socket.on('live-canva-ready', (payload) => {
      console.log("canva ready", payload);
      isReady.set(true);
    })

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

    this.socket.on('chat:get-message', (message: Message) => {
      this.messages.push(message)
      console.log("this.messages",this.messages);
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
    const response: any = await this.server.post("/auth/login/", payload);
    if(response?.status == 200) {
      userStore.set(response.response.data);
      authStatus.set(true);
    }
    return response;
  }

  register = async (payload: RegisterPayload) => {
    await this.server.get('/sanctum/csrf-cookie')
    const response: any = await this.server.post("/auth/register/", payload);
    if(response?.status == 200) {
      userStore.set(response.response);
      authStatus.set(true);
    }
    return response;
  }

  logout = async () => {
    const response = await this.server.post('/auth/logout', {});
    if(response?.status == 204) {
      authStatus.set(false);
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
    const response: any = await this.server.post('/user/update/', payload)
    if(response?.response.data) {
      console.log("update user: ", response.response.data);
      userStore.set(response.response.data);
      authStatus.set(true);
    }
  }

  // Friends
  getFriends = async () => {
    const response: any = await this.server.get('/friends/');
    return response;
  }

  requestFriend = async (id: number) => {
    const response: any = await this.server.post('/friend/request/', {friend_id: id})
    return response;
  }

  blockUser = async (id: number) => {
    const response: any = await this.server.post('/friend/block/', {friend_id: id})
    return response;
  }

  // Canvas
  joinCanva = async (id: number) => {
    const response: any = await this.server.get('/canva/join/'+id);
    return response;
  }

  getCanvas = async (scope: 'personal' | 'community', sort : undefined | 'asc' | 'desc' = undefined, favorit: undefined | 1 = undefined, search: string = '') => {
    const response: any = await this
      .server
      .get("/canvas?scope="+scope
        +(sort != undefined ? '&sort='+sort : '')
        +(favorit != undefined ? '&favorit='+favorit : '')
        +(search != '' ? '&search='+search : '' )
      );
    return response;
  }

  getCanva = async (id: number) => {
    const response = await this.server.get("/canvas/"+id);
    if(response.meta.token) {
      tokenStore.set(response.meta.token)
    }
    return response.data;
  }

  likeCanva = async (id: number) => {
    const response: any = await this.server.post("/canva/like", {"canvaId": id});
    return response.response.added;
  }

  deleteCanva = async (id: number) => {
    const response = await this.server.delete("/canvas/"+id);
    return response;
  }

  joinLiveCanva = (canvaId: number,) => {
    if(this.canvaToken == undefined) {
      console.warn("missing token to joinLiveCanva")
      return
    }
    this.socket?.emit('join-room', {
      "canvaId": canvaId,
      "userId": this.userData?.id,
      "username": this.userData?.name,
      "token": this.canvaToken
    })
  }

  placePixel = (coord: Coord, color: string | null) => {
    if(this.canvaToken == undefined) {
      console.warn("missing token to placePixel")
      return
    }
    if(!color) {
      return console.error("no color selected");
    }
    if(!this.gridManager) {
      return console.error("missing grid manager");
    }
    const index = this.gridManager.drawPixelOnCanvas(coord, color);
    if(index === false) return
    if(this.socket != undefined) {
      const auth: any = {
        user_id: this.userData?.id,
        token: this.canvaToken
      }
      this.socket.emit('canva:new-pixel:'+this.gridManager.canvasId, auth, index, coord, color);
    }

  }

  replaceColors = async (id: number, colors: string[]) => {
    const payload = {
      id: id,
      colors: colors
    }
    const response = await this.server.post("/canvas/color/replace/", payload);
    return response;
  }

  createCanva = async (payload: CreateCanvaPayload) => {
    const response = await this.server.post("/canvas/create", payload);
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