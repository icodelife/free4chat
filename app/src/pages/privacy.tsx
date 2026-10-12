export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-8 text-gray-200">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-white">隐私说明</h1>

        <h2 className="mb-2 mt-6 text-lg font-semibold text-white">
          我们不收集什么
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>无账号、无需注册、无用户身份</li>
          <li>服务器上没有持久的房间历史——房间过期后数据即删除</li>
          <li>不存储聊天记录到任何数据库</li>
        </ul>

        <h2 className="mb-2 mt-6 text-lg font-semibold text-white">
          房间活跃期间存在什么
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>房间成员列表（昵称）</li>
          <li>文字聊天消息（仅内存，房间过期后删除）</li>
          <li>语音 track 元数据（用于建立 WebRTC 连接）</li>
        </ul>

        <h2 className="mb-2 mt-6 text-lg font-semibold text-white">数据保留</h2>
        <p className="text-sm">
          房间在最后一人离开 30 分钟后自动清除所有数据。Durable
          Object 实例在无人访问时由 Cloudflare 自动回收。
        </p>

        <h2 className="mb-2 mt-6 text-lg font-semibold text-white">语音传输</h2>
        <p className="text-sm">
          语音通过 Cloudflare Realtime SFU 传输，服务端不录制、不存储音频。
        </p>
      </div>
    </div>
  )
}
