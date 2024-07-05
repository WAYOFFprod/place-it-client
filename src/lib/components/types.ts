interface CanvaData {
  id: number
  data: any
  size: Size2D
}

interface CanvaPreviewData {
  id: number,
  width: number,
  height: number,
  colors: any,
  owned: boolean,
  visibility: 'public' | 'friends_only' | 'private',
  category: 'pixelwar' | 'artistic' | 'free',
  access: 'open' | 'invite_only' | 'request_only' | 'closed'
  image: string
}