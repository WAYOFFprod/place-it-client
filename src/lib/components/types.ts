interface CanvaData {
	id: number;
	data: any;
	size: Size2D;
}

interface ModalData {
	name: string;
	data?: any;
}

interface Pixels {
	[key: string]: string;
}

interface CanvaPreviewData {
	id: number;
	name: string;
	width: number;
	height: number;
	colors: any;
	owned: boolean;
	visibility: 'public' | 'friends_only' | 'private';
	category: 'pixelwar' | 'artistic' | 'free';
	access: 'open' | 'invite_only' | 'request_only' | 'closed';
	participationStatus: 'accepted' | 'rejected' | 'sent' | null;
	image: string;
	participants: number;
	currentPlayers: number;
	isLiked: boolean;
	created_at: string;
}
