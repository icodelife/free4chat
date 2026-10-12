import Link from "next/link"

import DiscoveryPageLayout from "../components/DiscoveryPageLayout"

export default function TemporaryChatRoomPage() {
  return (
    <DiscoveryPageLayout
      title="临时聊天室 — 无需注册，无历史记录 | Free4Chat"
      description="开启一个即时临时房间，支持语音、文字、文件和屏幕共享。无需账号、无需注册——空房间会自动过期，不会留下永久历史记录。"
      path="/temporary-chat-room"
      ctaId="temporary-chat-room"
      h1="一个支持语音、文字和屏幕共享的临时房间"
    >
      <p>
        Free4Chat
        房间的存在只为一次对话，之后便消失。不用创建账号、无需安装——打开房间、分享链接、开始交谈。
      </p>

      <h2>你能得到什么</h2>
      <ul>
        <li>浏览器内的语音聊天。</li>
        <li>支持表情回应的文字聊天。</li>
        <li>带内联预览的文件和图片传输。</li>
        <li>屏幕共享（桌面浏览器）。</li>
        <li>分享只需一个链接：复制房间 URL 并发送。</li>
      </ul>

      <h2>为什么它是临时的</h2>
      <ul>
        <li>无需注册、无需账号、不用管理任何身份。</li>
        <li>我们的服务器上不保留永久的房间历史——空房间会自动过期。</li>
        <li>房间没有固定计时器：有人在时保持开启，空置一段时间后过期。</li>
      </ul>

      <h2>小提示</h2>
      <p>
        Free4Chat
        不是端到端加密的消息工具：媒体经中转以便多位参与者互相听见、看见；你的房间名和昵称保存在浏览器
        <code>localStorage</code> 中，直到你清除它。完整说明见{" "}
        <Link href="/privacy">隐私政策</Link>。
      </p>

      <h2>深入了解</h2>
      <ul>
        <li>
          <Link href="/docs/getting-started/browser-room">
            浏览器房间快速上手
          </Link>{" "}
          —— 一步步创建并分享房间。
        </li>
        <li>
          <Link href="/docs/concepts/room">房间与归属</Link> ——
          房间拥有什么、每位参与者保留哪些隐私。
        </li>
        <li>
          还想让 Agent 也加入房间？参见{" "}
          <Link href="/ai-agent-room">AI Agent 房间</Link>。
        </li>
      </ul>
    </DiscoveryPageLayout>
  )
}
