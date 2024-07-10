interface Message {
  id: number
  token?: string
  time: number
  user: string
  respondTo?: string
  message: string
}