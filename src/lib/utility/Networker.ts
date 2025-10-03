import type GridManager from '$lib/p5/GridManager';
import ServerRequests from './ServerRequests';
import { Socket, io } from 'socket.io-client';
import { PUBLIC_WEBSOCKET_URL, PUBLIC_SERVER_URL } from '$env/static/public';
import { chatMessages } from '$lib/stores/chatStore';
import { authStatus, tokenStore, userStore } from '$lib/stores/authStore';
import { isReady } from '$lib/stores/canvaStore';

export default class Networker {
	static #instance: Networker;
	shortClientId: string | undefined;
	server: ServerRequests;
	socket: Socket | undefined;
	gridManager: GridManager | undefined;
	tempPoints: { [key: string]: string } | undefined;
	websocket: string;
	messages: Message[] = [];
	userData: User | undefined;
	canvaToken: string | undefined;

	static getInstance() {
		if (!this.#instance) {
			this.#instance = new Networker(PUBLIC_SERVER_URL, PUBLIC_WEBSOCKET_URL);
		}
		return this.#instance;
	}

	constructor(server: string, websocket: string) {
		this.websocket = websocket;
		this.server = new ServerRequests(server);
		userStore.subscribe((newUserData: User | undefined) => {
			this.userData = newUserData;
		});
		tokenStore.subscribe((newToken) => {
			this.canvaToken = newToken;
		});
	}

	connectToSocket = (gridManager: GridManager) => {
		this.gridManager = gridManager;
		this.socket = io(this.websocket);

		this.socket.on('error', (payload) => {
			console.error(payload);
		});

		this.socket.on('connect', () => {
			if (this.socket != undefined && this.gridManager != null)
				this.socket.emit('get-init-state', {
					canvaId: this.gridManager.canvasId
				});
			this.shortClientId = this.socket?.id?.slice(6);
		});

		this.socket.on('live-canva-ready', (payload) => {
			console.log('canva ready', payload);
			isReady.set(true);
		});

		this.socket.on('canva:init-pixels', (payload) => {
			if (this.gridManager != undefined)
				if (payload) {
					this.tempPoints = payload.pixels;
					this.gridManager.attemptAddAdditionalPixels(this.tempPoints);
				}
		});

		this.socket.on('disconnect', () => {
			console.log('user disconnected');
		});
		this.gridManager = gridManager;
		// listen to socket server message

		this.socket.on('canva:new-pixel-from-others', (coord, color) => {
			console.log('NEW PIXEL FROM OTHERS', color, coord);
			if (!this.gridManager) return console.error('missing grid manager');
			this.gridManager.addPixelOnCanvas(coord, color);
		});

		this.socket.on('canva:new-pixels-from-others', (pixels: Pixels) => {
			console.log('NEW PIXELS FROM OTHERS', pixels);
			if (!this.gridManager) return console.error('missing grid manager');
			this.gridManager.addPixelsToCanvaFromIndex(pixels);
			this.gridManager.needsUpdate = true;
		});

		this.socket.on('chat:get-message', (message: Message) => {
			this.messages.push(message);
			console.log('this.messages', this.messages);
			chatMessages.set(this.messages);
		});

		this.socket.on('chat:init-messages', (newMessages: string[]) => {
			const messages = newMessages.map((x) => {
				return JSON.parse(x);
			});

			this.messages = messages;
			chatMessages.set(this.messages);
		});
	};

	// Auth

	/**
	 * Logs in a user.
	 * @param payload LoginPayload
	 * @returns
	 */
	login = async (payload: LoginPayload) => {
		await this.server.get('/sanctum/csrf-cookie');
		const response: any = await this.server.post('/auth/login', payload);
		if (response?.status == 200) {
			userStore.set(response.response.data);
			authStatus.set(true);
		}
		return response;
	};

	/**
	 * Registers a new user.
	 * @param payload RegisterPayload
	 * @returns the response from the server
	 */
	register = async (payload: RegisterPayload) => {
		await this.server.get('/sanctum/csrf-cookie');
		const response: any = await this.server.post('/auth/register', payload);
		if (response?.status == 200) {
			userStore.set(response.response);
			authStatus.set(true);
		}
		return response;
	};

	/**
	 * Logs out the current user.
	 */
	logout = async () => {
		const response = await this.server.post('/auth/logout', {});
		if (response?.status == 204) {
			authStatus.set(false);
		}
	};

	/**
	 * Fetches the current session of the user.
	 * and updates the userStore AuthStatus
	 */
	getSession = async () => {
		const response = await this.server.get('/session');
		if (response.isConnected) {
			userStore.set(response.user);
			authStatus.set(true);
		} else {
			authStatus.set(false);
		}
	};

	/**
	 * Saves a single input field of a user.
	 * These fields are settings like name, email, password etc...
	 * @param payload
	 */
	saveUserField = async (payload: SettingOption) => {
		const response: any = await this.server.post('/user/update', payload);
		if (response?.response.data) {
			console.log('update user: ', response.response.data);
			userStore.set(response.response.data);
			authStatus.set(true);
		}
	};

	// Social

	/**
	 * Fetches the friends of the user using the session.
	 * @returns a list of friends
	 */
	getFriends = async () => {
		const response: any = await this.server.get('/friends');
		return response;
	};

	/**
	 * Sends a friend request to a user.
	 * @param id id of the user to request as friend
	 * @returns
	 */
	requestFriend = async (id: number) => {
		const response: any = await this.server.post('/friend/request', { friend_id: id });
		return response;
	};

	/**
	 * Accepts a friend request from a user.
	 * Needs an active request from that user.
	 * @param id id of the user to accept as friend
	 * @returns
	 */
	acceptFriendRequest = async (id: number) => {
		const response: any = await this.server.post('/friend/accept', {
			friend_id: id
		});
		return response.response;
	};

	/**
	 * Rejects a friend request from a user.
	 * Needs to already be friends and not be blocked
	 * @param id id of the user to reject as friend
	 * @returns
	 */
	removeFriend = async (id: number) => {
		const response: any = await this.server.delete('/friend/' + id + '/remove');
		return response;
	};

	/**
	 * Blocks a user. friend or not
	 * @param id id of the user to block
	 * @returns
	 */
	blockUser = async (id: number) => {
		const response: any = await this.server.post('/friend/block', { friend_id: id });
		return response;
	};

	/**
	 * Fetches the blocked users of the current user.
	 * @returns a list of blocked users
	 */
	blockedUser = async () => {
		const response: any = await this.server.get('/friends/blocked');
		return response;
	};

	/**
	 * Unblocks a user
	 * @param id id of the user to unblock
	 * @returns
	 */
	unblockAccount = async (id: number) => {
		const response: any = await this.server.delete('/friend/' + id + '/unblock');
		return response;
	};

	/**
	 * Invites a friend to a canva.
	 * @param friend_id The id of the friend to invite
	 * @param canva_id The id of the canva to invite the friend to
	 */
	inviteToCanva = async (friend_id: number, canva_id: number) => {
		const response: any = await this.server.post('/canva/invite/', {
			user_id: friend_id,
			canva_id: canva_id
		});
		console.log(response);
	};

	/**
	 * Request access to a private canva.
	 * The session will be used to identify the user.
	 * @param canva_id The id of the canva to request access to
	 */
	requestAccess = async (canva_id: number) => {
		const response: any = await this.server.post('/canva/request_access/', {
			canva_id: canva_id
		});
		console.log(response);
	};

	/**
	 * Fetches the participants of a canva.
	 * @param id canva id
	 * @returns
	 */
	getParticipants = async (id: number) => {
		const response: any = await this.server.get('/canva/' + id + '/participants');
		return response;
	};

	/**
	 * Accepts a participation request for a canva.
	 * This will require the friend to have an active request.
	 * @param friend_id The id of the friend whose request to accept
	 * @param canva_id The id of the canva to accept the request for
	 * @returns
	 */
	acceptParticipationRequest = async (friend_id: number, canva_id: number) => {
		const response: any = await this.server.post('/canva/accept_request/', {
			user_id: friend_id,
			canva_id: canva_id
		});
		return response.response;
	};

	/**
	 * Rejects a participation request for a canva.
	 * This will require the friend to have an active request.
	 * @param friend_id The id of the friend whose request to reject
	 * @param canva_id The id of the canva to reject the request for
	 * @returns
	 */
	rejectParticipationRequest = async (friend_id: number, canva_id: number) => {
		const response: any = await this.server.post('/canva/reject_request/', {
			user_id: friend_id,
			canva_id: canva_id
		});
		return response.response;
	};

	// updateParticipation = async (userId: number, canvaId: number, status: ParticipationStatus ) => {
	//   const response: any = await this.server.patch("/participant/",{
	//     'user_id': userId,
	//     'canva_id': canvaId,
	//     'status': status
	//   });
	//   return response.response;
	// }

	/**
	 * Likes a canva.
	 * @param id canva id
	 * @returns
	 */
	likeCanva = async (id: number) => {
		const response: any = await this.server.post('/canva/like', { canvaId: id });
		return response.response.added;
	};

	/**
	 * Canvas
	 */

	/**
	 * let's you create a new canvas
	 * @param payload CreateCanvaPayload
	 * @returns newly created canva data
	 */
	createCanva = async (payload: CreateCanvaPayload) => {
		const response = await this.server.post('/canvas/create', payload);
		return response;
	};

	/**
	 * fetches a list of canvas with optional filters
	 * @param scope 'scope' can be 'personal' or 'community'
	 * @param sort 'sort' can be 'asc' or 'desc'
	 * @param favorit 'favorit' can be 1 or undefined
	 * @param search 'search' can be a string or empty
	 * @returns Canvas resource collections
	 */
	getCanvas = async (
		scope: 'personal' | 'community',
		sort: undefined | 'asc' | 'desc' = undefined,
		favorit: undefined | 1 = undefined,
		search: string = ''
	) => {
		const response: any = await this.server.get(
			'/canvas?scope=' +
				scope +
				(sort != undefined ? '&sort=' + sort : '') +
				(favorit != undefined ? '&favorit=' + favorit : '') +
				(search != '' ? '&search=' + search : '')
		);
		return response;
	};

	/**
	 * fetches a single canva by its id
	 * @param id canva id
	 * @returns Canvas resource
	 */
	getCanva = async (id: number) => {
		const response = await this.server.get('/canvas/' + id);
		if (response.meta.token) {
			tokenStore.set(response.meta.token);
		}
		return response.data;
	};

	/**
	 * saves a single input field of a canva.
	 * These fields are settings like name, description, privacy, palette_id, width, height etc...
	 * @param payload
	 */
	saveCanvaInputField = async (payload: CanvaFieldUpdate) => {
		const response: any = await this.server.post('/canva/update', payload);
		if (response?.response.data) {
			authStatus.set(true);
		}
	};

	/**
	 * Deletes a canva.
	 * @param id canva id
	 * @returns
	 */
	deleteCanva = async (id: number) => {
		const response = await this.server.delete('/canvas/' + id);
		return response;
	};

	/**
	 * This will attempt to join the canva live session using websockets.
	 * @param canvaId
	 * @returns
	 */
	joinLiveCanva = (canvaId: number) => {
		if (this.canvaToken == undefined) {
			console.warn('missing token to joinLiveCanva');
			return;
		}
		this.socket?.emit('join-room', {
			canvaId: canvaId,
			userId: this.userData?.id,
			username: this.userData?.name,
			token: this.canvaToken
		});
	};

	/**
	 * Saves a single pixel with a color and coordinates to the liveserver using websocket.
	 * @param coord The coordinates of the pixel to save.
	 * @param color The color of the pixel to save.
	 * @returns
	 */
	savePixel = (coord: Coord, color: string | null) => {
		if (this.canvaToken == undefined) {
			console.warn('missing token to placePixel');
			return;
		}
		if (!color) {
			return console.error('no color selected');
		}
		if (!this.gridManager) {
			return console.error('missing grid manager');
		}
		const index = this.gridManager.addPixelOnCanvas(coord, color);
		if (index === false) return;
		if (this.socket != undefined) {
			const auth: any = {
				user_id: this.userData?.id,
				token: this.canvaToken
			};
			this.socket.emit('canva:new-pixel:' + this.gridManager.canvasId, auth, index, coord, color);
		}
	};

	/**
	 * Places multiple pixels on the canvas.
	 * the index is calculated from the coordinates and the canvas width
	 * @param pixels Pixels to place in format {index: color}
	 * @returns
	 */
	placePixelsByIndex = (pixels: Pixels) => {
		if (this.gridManager == undefined) return;
		// for (let key in pixels) {
		//   console.log(key, pixels[key]);
		//   const coord = this.gridManager.getCoordFromIndex(parseInt(key));
		//   const index = this.gridManager.addPixelOnCanvas(coord, pixels[key]);
		//   if(index === false) return
		// }

		if (this.socket != undefined) {
			const auth: any = {
				user_id: this.userData?.id,
				token: this.canvaToken
			};
			this.socket.emit('canva:new-pixels:' + this.gridManager.canvasId, auth, pixels);
		}
	};

	/**
	 * Replaces the a the colors of a canva.
	 * @param id canva id
	 * @param colors
	 * @returns
	 */
	replaceColors = async (id: number, colors: string[]) => {
		const payload = {
			id: id,
			colors: colors
		};
		const response = await this.server.post('/canvas/color/replace', payload);
		return response;
	};

	/**
	 * Messages
	 */

	/**
	 * Sends a message to the chat.
	 * @param message Message to send
	 */
	sendMessage(message: Message) {
		if (this.socket != undefined) {
			this.socket.emit('chat:new-message', message);
			this.messages.push(message);
			chatMessages.set(this.messages);
		}
	}

	/**
	 * disconnect from the websocket server
	 */
	disconnect = () => {
		if (this.socket != undefined) this.socket.disconnect();
	};

	// Notification settings

	/**
	 * Gets the notification settings of the user.
	 * @returns the notification settings of the user
	 */
	getNotificationSettings = async () => {
		const response: any = await this.server.get('/settings/notifications');
		return response;
	};

	/**
	 * Saves a notification setting.
	 * @param payload the setting to update
	 * @returns the updated notification settings
	 */
	saveNotificationSetting = async (payload: BoolSettingOption) => {
		const response: any = await this.server.patch('/settings/update', payload);
		return response.response;
	};
}
