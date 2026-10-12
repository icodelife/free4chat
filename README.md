# voice-chat-client-demo

语音聊天室的 Web 演示客户端，连接独立的 `voice-chat-server` 后端。

## 配置

设置环境变量指向你的后端服务地址：

```bash
# wrangler.jsonc 的 vars 中
"NEXT_PUBLIC_API_BASE_URL": "https://voice-chat-server.<你的子域>.workers.dev"
```

不设置则默认连接同源（适合前后端同机部署的演示场景）。

## 本地开发

```bash
cd app
npm install
NEXT_PUBLIC_API_BASE_URL=https://你的后端地址 npm run dev
```

## 部署

```bash
cd app
npx wrangler deploy
```

## 后端

服务端请使用 [voice-chat-server](https://github.com/icodelife/voice-chat-server)。

## License

MIT
