// @ts-ignore generated at build time
import { default as handler } from "./.open-next/worker.js"

// 纯前端演示客户端，后端 API 由 NEXT_PUBLIC_API_BASE_URL 指向独立的 voice-chat-server
export default {
  async fetch(request: Request, env: any, ctx: any) {
    return handler.fetch(request, env, ctx)
  },
}
