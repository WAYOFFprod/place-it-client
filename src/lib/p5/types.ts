interface Coord {
	x: number;
	y: number;
}
interface Size2D {
	width: number;
	height: number;
}

interface CreateCanvaPayload {
	name: string;
	category: 'pixelwar' | 'artistic' | 'free';
	access: 'open' | 'invite_only' | 'request_only' | 'closed';
	visibility: 'public' | 'friends_only' | 'private';
	width: number;
	height: number;
	colors: string[];
}
interface Pixel {
	x: number;
	y: number;
	color: string;
}
