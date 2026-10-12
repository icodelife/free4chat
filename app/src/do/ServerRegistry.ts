// ServerRegistry: 单例 DO，跟踪本服务端的活跃房间数
// 用于强制执行：每个服务端最多 MAX_ROOMS 个活跃房间

const MAX_ROOMS = 5

interface RegistryState {
  rooms: string[]  // 活跃房间 ID 列表
}

export class ServerRegistry {
  private state: DurableObjectState
  private env: any

  constructor(state: DurableObjectState, env: any) {
    this.state = state
    this.env = env
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const action = url.searchParams.get("action")

    if (action === "register") {
      const roomId = url.searchParams.get("roomId")
      if (!roomId) {
        return Response.json({ error: "missing_roomId" }, { status: 400 })
      }
      const state = (await this.state.storage.get<RegistryState>("state")) ?? { rooms: [] }
      if (!state.rooms.includes(roomId)) {
        if (state.rooms.length >= MAX_ROOMS) {
          return Response.json({ error: "room_limit_reached", max: MAX_ROOMS }, { status: 429 })
        }
        state.rooms.push(roomId)
        await this.state.storage.put("state", state)
      }
      return Response.json({ ok: true, count: state.rooms.length })
    }

    if (action === "unregister") {
      const roomId = url.searchParams.get("roomId")
      if (!roomId) {
        return Response.json({ error: "missing_roomId" }, { status: 400 })
      }
      const state = (await this.state.storage.get<RegistryState>("state")) ?? { rooms: [] }
      state.rooms = state.rooms.filter((id) => id !== roomId)
      await this.state.storage.put("state", state)
      return Response.json({ ok: true, count: state.rooms.length })
    }

    if (action === "count") {
      const state = (await this.state.storage.get<RegistryState>("state")) ?? { rooms: [] }
      return Response.json({ count: state.rooms.length, max: MAX_ROOMS, rooms: state.rooms })
    }

    return Response.json({ error: "unknown_action" }, { status: 400 })
  }
}
