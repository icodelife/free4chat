# free4chat 中文版 - 部署指南

这是 free4chat 的 fork 精简中文版：只保留语音+文字聊天，移除了 Agent/MCP/转写等高级功能，UI 已汉化。

## 前置要求

- Node.js 22+
- 已安装 wrangler：`npm install -g wrangler`
- 一个 Cloudflare 账号（免费版即可）

## 部署步骤

### 1. 登录 Cloudflare

```bash
wrangler login
```

按提示在浏览器中完成授权。

### 2. 设置 SFU 密钥

```bash
cd app
wrangler secret put SFU_APP_SECRET
```

按提示粘贴 SFU App Secret（见下方「获取密钥」）。

### 3. 部署

```bash
npm run cf-build
wrangler deploy
```

部署成功后会输出一个 `*.workers.dev` 地址，例如：
`https://free4chat-test.<your-subdomain>.workers.dev`

### 4. 使用

访问 `https://<your-worker>.workers.dev/room?id=任意房间名` 即可创建/加入房间。

例如：`https://<your-worker>.workers.dev/room?id=test123`

## 获取密钥

SFU App Secret 保存在：`~/workspace/skills/cloudflare/.run/sfu-app.json`

提取命令：
```bash
python3 -c "import json; print(json.load(open('~/workspace/skills/cloudflare/.run/sfu-app.json'))['result']['secret'])"
```

## 配置说明

- `wrangler.jsonc` 已配置为：
  - Worker 名：`free4chat-test`
  - 启用 `workers.dev` 访问
  - Durable Object 使用 `new_sqlite_classes`（免费版兼容）
  - 已禁用 Room Apps（`ROOM_APPS_ENABLED=false`）
  - 已移除 KV 依赖（语音测试不需要）
  - 已移除 MCP 接口（`/mcp`）

## 精简内容

相比原版 free4chat，本 fork 移除了：
- AI Agent 邀请功能
- 实时转写（Live Transcript）
- 任务协作视图（TaskLiveView）
- MCP 服务器接口
- Go Agent 运行时（不在 Worker 中，无影响）
-  standalone Agent 页面（`ai-agent-room`、`multi-agent-collaboration`）

保留：
- 语音通话（SFU，核心功能，未改动）
- 文字聊天
- 屏幕共享
- 文件传输（DataChannel）
- URL 房间（`/room?id=xxx`）

## 注意事项

- 首次部署后，访问任意 `/room?id=xxx` 即可创建房间
- 房间是临时的，无人后自动清理
- 语音需要 HTTPS（workers.dev 自带）
- 如果遇到 Turnstile 验证问题，检查 `TURNSTILE_SECRET_KEY` 是否需要配置（测试环境可跳过）
