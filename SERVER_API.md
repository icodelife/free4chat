# 服务端 API 文档（供客户端重写时参考）

本文档描述 fork 版 free4chat 服务端的接口。服务端由三部分组成：
- **Worker**：HTTP 入口，路由分发
- **RoomSession DO**：房间状态、成员、文字聊天、语音元数据
- **SFU 代理**：`/api/sfu/*`，转发到 Cloudflare Realtime

## 基础信息

- 部署地址示例：`https://free4chat-test.cheng-0b4.workers.dev`
- 房间标识：URL 参数 `id`，如 `/room?id=test123` 中的 `test123`
- 每个 `id` 对应一个独立的 Durable Object 实例，房间之间完全隔离
- 无需账号，无需登录

## 语音流程（SFU）

### 1. 创建会话

```
POST /api/sfu/session
Content-Type: application/json
Origin: https://<your-domain>  # 必须在白名单内

Body:
{
  "room": "test123",      # 房间 ID
  "name": "张三"           # 用户昵称
}

Response 200:
{
  "participantId": "uuid",
  "participantToken": "uuid",  # 后续接口的鉴权凭证，妥善保管
  "sessionId": "cloudflare-sfu-session-id",
  "expiresAt": 4102444800000
}
```

### 2. 建立 WebSocket 信令通道

```
GET /api/sfu/ws?room=test123&participantId=xxx&token=yyy
Upgrade: websocket
```

- 用于接收房间事件（成员加入/离开、静音状态、文字消息等）
- 也是文字聊天的通道（见下文）

### 3. 发布本地音频

1. 创建 `RTCPeerConnection`，添加本地音频 track（`sendonly` transceiver）
2. `createOffer` → `setLocalDescription`
3. 调用 SFU `tracks/new`（经由服务端代理）：
   ```
   POST /api/sfu/tracks
   Body: {
     "sessionId": "...",
     "tracks": [{
       "location": "local",
       "trackName": "audio",
       "kind": "audio",      # 必须带 kind
       "mid": "0"
     }]
   }
   ```
4. 收到 SFU 的 answer 后 `setRemoteDescription`
5. 确认发布：
   ```
   POST /api/sfu/publish-confirm
   Body: { "sessionId": "...", "trackName": "audio" }
   ```

### 4. 订阅远端音频

```
POST /api/sfu/tracks
Body: {
  "sessionId": "...",           # 自己的 sessionId
  "tracks": [{
    "location": "remote",
    "sessionId": "<对方的sessionId>",  # 对方的
    "trackName": "audio",
    "kind": "audio"              # 必须带 kind
  }]
}
```

### 5. 关闭

```
POST /api/sfu/tracks/close
Body: { "sessionId": "...", "tracks": [...] }
```

## 文字聊天流程

文字消息通过 WebSocket（`/api/sfu/ws`）收发，不是 HTTP 接口。

### 发送消息

WebSocket 发送 JSON：
```json
{
  "type": "chat",
  "text": "大家好",
  "id": "client-msg-uuid"  # 客户端生成的消息 ID，用于去重
}
```

### 接收消息

WebSocket 接收 JSON，`type` 字段区分事件类型：
- `chat`：文字消息 `{ type: "chat", text, name, peerId, timestamp }`
- `join`：有人加入 `{ type: "join", participant }`
- `leave`：有人离开 `{ type: "leave", participantId }`
- `mute`：静音状态变化
- `track-published`：有人发布了音频流

## 部署配置

### 必需的环境变量 / 密钥

| 名称 | 类型 | 说明 |
|------|------|------|
| `SFU_APP_ID` | var | Cloudflare Realtime App ID |
| `SFU_APP_SECRET` | secret | Cloudflare Realtime App Secret |
| `TURNSTILE_SECRET_KEY` | secret（可选） | Turnstile 验证密钥，不设则跳过验证 |

### wrangler.jsonc 关键配置

```jsonc
{
  "name": "free4chat-test",
  "main": "worker.ts",
  "workers_dev": true,
  "durable_objects": {
    "bindings": [{ "name": "SFU_ROOM", "class_name": "RoomSession" }]
  },
  "migrations": [{
    "tag": "v1",
    "new_sqlite_classes": ["RoomSession"]
  }]
}
```

### 部署命令

```bash
# 1. 构建
npm run cf-build

# 2. 设置密钥（首次）
wrangler secret put SFU_APP_SECRET

# 3. 部署
wrangler deploy
```

## 注意事项

1. **联邦模式（默认）**：`DISABLE_ORIGIN_CHECK=true`（wrangler.jsonc 已默认开启），任何客户端可连任何服务端。如需收紧，设置 `ALLOWED_ORIGINS` 环境变量（逗号分隔的域名列表），或删除 `DISABLE_ORIGIN_CHECK`。
2. **房间限流**：每房间最多 10 人，`POST /api/sfu/session` 满员时返回 429（`room_full`）。
3. **KV 可选**：`ROOMS_KV` 用于限流，未配置时自动跳过限流（已处理）。
4. **房间自动清理**：DO 无人后自动休眠，状态不持久化；房间过期时自动从注册表移除。
