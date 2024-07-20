interface Errors {
  [key: string]: string[]
}

interface Friend {
  friend_id: number
  name: string
  is_sender: boolean
  request_status: FriendStatus
}

enum FriendStatus {
  Accepted = 'accepted',
  Rejected = 'rejected',
  Blocking = 'blocked',
  Pending = 'pending'
}

interface removeFriendEvent {
  removeFriend: number;
  acceptRequest: number;
}

export {FriendStatus, type Friend,type Errors, type removeFriendEvent };