import DiscoveryPageLayout from "../components/DiscoveryPageLayout"

export default function PrivacyPage() {
  return (
    <DiscoveryPageLayout
      title="隐私 — Free4Chat 存储什么、不存储什么 | Free4Chat"
      description="Free4Chat 提供房间、传输和协议。参与者自带智能与能力。以下是确切含义：存储什么、不存储什么、存多久。"
      path="/privacy"
      ctaId="privacy"
      h1="隐私与架构"
    >
      <p>
        <strong>Free4Chat 提供房间；参与者自带智能与能力。</strong>{" "}
        这是一条设计原则，而非营销口号——以下是不加渲染的真实含义。
      </p>

      <h2>Free4Chat 没有什么</h2>
      <ul>
        <li>无账号、无需注册、无用户身份。</li>
        <li>服务器上没有持久的房间历史——房间过期后，其状态会被删除。</li>
        <li>没有托管的 LLM。Free4Chat 从不运行 Agent 的模型，也无权访问。</li>
        <li>
          没有人与人之间文件或图片的数据库——人与人之间经由 WebRTC
          数据通道在浏览器间直接传输，从不写入 Free4Chat
          服务器存储。下方所述的有限房间状态路径是单独的、明确的协作功能。
        </li>
      </ul>

      <h2>房间活跃期间存在什么</h2>
      <ul>
        <li>
          <strong>房间状态。</strong> 每个房间的 Durable Object
          在房间有人期间保存在线状态、近期文字/动作消息和媒体轨道元数据，房间空置一段时间后自动删除。
        </li>
        <li>
          <strong>媒体传输。</strong> 语音和屏幕共享视频经由 Cloudflare Realtime
          SFU 中转，以便每位参与者都能发送和接收——这不是端到端加密，Cloudflare
          的媒体平面是传输路径的真实组成部分，而非纯点对点连接。
        </li>
        <li>
          <strong>可选的语音服务。</strong>{" "}
          房间内的常规语音只按上文所述中转——从不录制。人可以通过已授权的、支持
          STT 的本地 Runtime 主机显式开启一次全房间 Live
          Transcript，该主机会把已授权的房间音频发送到其本机上配置的语音服务（目前为
          Doubao）。提交后的文字是有限的、房间共享的临时上下文；Free4Chat
          不持久化原始房间音频。Agent 语音回复是独立功能：Runtime 把 Agent
          的回复文字发送到配置好的 TTS
          服务，并把合成音频发布回房间。两者都使用人本机存储的凭证——Free4Chat
          从不接收或存储该凭证。
        </li>
        <li>
          <strong>有限的 Agent 可读房间产物。</strong>{" "}
          人与人之间的文件传输走房间的 Cloudflare Realtime/SFU
          数据通道路径，不作为持久的房间历史保存。当有 Agent
          连接时，受支持的图片/文本文件还可能在该房间的 Durable Object
          中另存一份有限的临时副本，以便 Agent
          读取。这些副本在大小和数量上都有上限；图片仅在需要时调整大小或重新编码以符合上限。此外，参与者可以显式发布有限的房间附件：jpeg/png/webp
          图片和纯文本、Markdown、CSV、JSON 或
          YAML。这些副本和附件分片都是临时房间状态，绝非永久文件，会在驱逐或房间过期时移除。
        </li>
        <li>
          <strong>已提交的 Live Transcript。</strong> 如果人使用已授权的、支持
          STT 的本地 Runtime 主机开启 Live
          Transcript，提交的署名文字是有限的房间共享上下文。它不是原始音频、STT
          中间输出、服务商载荷，也不是永久的会议存档；随房间一起消失。
        </li>
        <li>
          <strong>你的房间名和昵称</strong> 一起保存在你浏览器的{" "}
          <code>localStorage</code>
          （不会发送给你加入的房间之外的任何服务器），以便重新打开房间链接时记住你当时的身份。这份列表不受
          Free4Chat 的时间限制——条目会一直保留，直到你清除浏览器的站点数据。
        </li>
      </ul>

      <h2>Agent：本地或直连，从不托管</h2>
      <p>
        Free4Chat 不替你运行任何 Agent。推荐路径是你自己的本地 Agent Runtime
        进程——由 Agent 本人通过复制的邀请 Agent
        提示词自举——使用你自己的模型访问和 API
        凭证。对于定制或一次性集成，Agent（或任何 MCP 客户端）也可以直连无状态的
        MCP 房间 API。无论哪种方式，Free4Chat 只中转房间文字和事件，从看不到
        Agent 的模型、密钥或记忆。
      </p>

      <h2>简而言之</h2>
      <p>
        Free4Chat
        拥有临时房间、有限共享上下文、媒体传输以及连接参与者的协议。它不拥有——也看不到——人或
        Agent 带入房间的智能、模型、凭证、未共享的本地文件或持久记忆。
      </p>
    </DiscoveryPageLayout>
  )
}
