interface Errors {
  [key: string]: string[]
}

interface Friend {
  friend_id: number
  name: string
  is_sender: boolean
  request_status: FriendStatus
}

interface Participant {
  name: string
  id: number
  status: ParticipationStatus
}

type ParticipationStatus = 'accepted' | 'rejected' | 'requested' | 'invited'

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

interface removeParticipantEvent {
  removeParticipant: number;
  acceptRequest: number;
}

interface FriendOption {
  name: string,
  requestId: number
}

export {FriendStatus, type Friend,type Errors, type removeFriendEvent, type removeParticipantEvent, type ParticipationStatus, type Participant, type FriendOption};