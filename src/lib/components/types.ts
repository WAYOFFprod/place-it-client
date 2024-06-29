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
  mode: 'playable' | 'view_only',
  category: 'pixelwar' | 'artistic' | 'free',
  access: 'public' | 'invite_only' | 'private'
  image: string
}