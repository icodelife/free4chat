# 语音聊天室

基于 Cloudflare 免费资源构建的语音+文字聊天室服务端，开箱即用。

## 特性

- 🎙️ **语音聊天**：基于 Cloudflare Realtime SFU，WebRTC 低延迟
- 💬 **文字聊天**：WebSocket 实时消息
- 🔗 **URL 房间**：分享链接 `/room?id=xxx` 即可进房，无需注册
- 🌐 **联邦模式**：默认放开 Origin 限制，任何客户端可连接任何服务端
- 🚦 **房间限流**：每房间最多 10 人，满员时返回 429
- 🇨🇳 **中文界面**：全中文 UI

## 架构

```
浏览器 ←→ Worker (Next.js 前端 + API 代理) ←→ Cloudflare Realtime SFU
                ↓
         Durable Object (RoomSession)
         - 成员管理、文字消息、语音元数据
```

**Cloudflare 资源**（全部免费额度内）：
- Worker：前端 + `/api/sfu/*` 代理 + 房间接口
- Durable Object：`RoomSession`（绑定名 `SFU_ROOM`）
- Realtime SFU App：语音媒体传输
- 环境变量：`SFU_APP_ID`、`SFU_APP_SECRET`、`DISABLE_ORIGIN_CHECK=true`

## 快速部署

### 方式一：一键脚本（推荐）

```bash
# 1. 在 Cloudflare 后台创建一个 API Token
#    权限：Workers Scripts → Edit，Calls → Edit（均为账号权限）

# 2. 运行
export CLOUDFLARE_API_TOKEN="你的token"
export CLOUDFLARE_ACCOUNT_ID="你的账号ID"
./one-click-deploy.sh
```

脚本自动完成：创建 SFU App → 安装依赖 → 构建 → 部署 Worker → 设置密钥 → 开启 workers.dev。

### 方式二：GitHub Actions

1. Fork 本仓库
2. 在 Settings → Secrets → Actions 添加：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. Actions → One-Click Deploy → Run workflow → `fresh_install=true`
4. 跑完后把日志里的 `SFU_APP_ID` 也加到 Secrets（供增量部署用）

之后每次 push 到 main 会自动增量部署。

## 服务端 API

详见 [SERVER_API.md](./SERVER_API.md)，核心接口：

| 接口 | 说明 |
|------|------|
| `POST /api/sfu/session` | 创建会话，返回 participantId/token/sessionId |
| `GET /api/sfu/ws` | WebSocket 信令通道 |
| `POST /api/sfu/tracks` | 发布/订阅音视频 track |

房间限流：满 10 人时返回 `429 {"error":"room_full"}`。

## 文档

- [SERVER_API.md](./SERVER_API.md) — 服务端接口文档（客户端开发用）
- [REPLICATE.md](./REPLICATE.md) — 复刻部署详细说明
- [DEPLOY.md](./DEPLOY.md) — 手动部署步骤

## 鸣谢

本项目来源于 [free4chat](https://github.com/xwfounder/free4chat)，感谢原作者的开源贡献。

## License

MIT
