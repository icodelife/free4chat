export interface UserInfo {
  name: string
  kind: "human" | "agent"
  room: string
  className?: string
  audioStream?: MediaStream | null
  peerId: string
  muteState?: boolean | false
  screenShareEnabled?: boolean
  screenShareStream?: MediaStream | null
  voiceAvailable?: boolean
  voiceEnabled?: boolean
  activity?: any
  capabilities?: string[]
  surface?: any
  runtimeHostId?: string
}

export type MessageType = "text" | "image" | "file" | "action"

export interface Message {
  peerId: string
  name: string
  kind?: "human" | "agent"
  type: MessageType
  messageId?: string
  createdAt?: number
  sequence?: number
  afterSequence?: number
  ephemeral?: boolean
  text?: string
  fileLink?: string
  fileName?: string
  fileSize?: number
  actionType?: string
  actionPayload?: Record<string, string>
  collab?: any
  permission?: any
  targets?: string[]
  taskRequestId?: string
}

export type ActionType = "whiteboard" | "poll" | "vote" | "game" | "reaction" | "collab" | "permission"

export interface Color {
  r: string
  g: string
  b: string
}
