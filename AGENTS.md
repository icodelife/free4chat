# 语音聊天室 — 开发指南

## 项目概述

基于 Cloudflare 免费资源构建的语音+文字聊天室服务端。

**功能**：语音聊天（WebRTC + Cloudflare Realtime SFU）、文字聊天、URL 房间（`/room?id=xxx`）

- 技术栈：Next.js 15 → Cloudflare Worker（`@opennextjs/cloudflare`）
- 语音：浏览器 WebRTC → Cloudflare Realtime SFU
- 状态：Cloudflare Durable Objects（`RoomSession`）

## 目录结构

```text
free4chat/
├── app/
│   ├── src/
│   │   ├── common/origin.ts          # Origin 检查（联邦模式）
│   │   ├── do/RoomSession.ts         # 房间状态：成员、消息、语音元数据
│   │   ├── do/roomExpiry.ts          # 房间过期（30 分钟无人清理）
│   │   ├── hooks/useSfuChatRoom.ts   # WebRTC、SFU 协商
│   │   ├── components/               # UI 组件（已汉化）
│   │   ├── sfu/server.ts             # SFU API 代理（会话、track）
│   │   └── room/server.ts            # 房间接口
│   ├── worker.ts                     # Worker 入口和 DO 导出
│   └── wrangler.jsonc                # Worker 配置
├── .github/workflows/deploy.yml      # 一键部署
├── one-click-deploy.sh               # 本地一键部署脚本
├── README.md                         # 项目说明
├── SERVER_API.md                     # 服务端接口文档
├── REPLICATE.md                      # 复刻部署说明
└── DEPLOY.md                         # 手动部署步骤
```

## 核心概念

### 联邦模式

`wrangler.jsonc` 默认 `DISABLE_ORIGIN_CHECK=true`，任何客户端可连接任何服务端。

- 安全模型：房间是"知道房间号就能进"的公开模型，安全靠房间 ID 不可猜（类似 Zoom 会议链接）
- 如需收紧：设置 `ALLOWED_ORIGINS` 环境变量（逗号分隔域名），或删除 `DISABLE_ORIGIN_CHECK`

### 房间限流

`POST /api/sfu/session` 时检查：
- 每房间最多 10 人，满员返回 `429 {"error":"room_full"}`

### 房间生命周期

- 有人时房间不过期
- 最后一人离开后 30 分钟（`EMPTY_ROOM_TIMEOUT_MS`）清除数据
- DO 实例由 Cloudflare 在无人访问时自动回收

## SFU 会话流程

1. `POST /api/sfu/session`：验证房间名、昵称，检查人数，创建 Cloudflare Realtime 会话
2. 浏览器建立 WebSocket 信令通道（`/api/sfu/ws`）
3. 浏览器发布麦克风音频 track
4. `RoomSession` 广播成员和 track 元数据

## 开发

```bash
cd app
npm install
npm run dev
```

## 构建和部署

```bash
cd app
npm run cf-build
npx wrangler deploy --var "SFU_APP_ID:$SFU_APP_ID"
```

或使用一键部署（见 README.md）。

## 重要约束

- `SFU_APP_SECRET` 是 Worker Secret，绝不提交到代码或发送给浏览器
- 保持 `DISABLE_ORIGIN_CHECK=true` 默认开启（联邦模式）
- 不要添加 R2 或服务端文件持久化
- UI 保持中文
