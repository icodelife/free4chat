import { useState, useEffect } from "react"

import { useRouter } from "next/router"

import {
  generateParticipantName,
  generateRoomName,
} from "../common/cosmicNames"
import { saveRoomToLocalStorage } from "../common/utils"

// 默认服务器（我们的官方服务器）
const DEFAULT_SERVER =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://voice-chat-server.cheng-0b4.workers.dev"

const inputClasses =
  "w-full rounded-lg border border-gray-700 bg-gray-900 p-3 pr-10 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"

const diceClasses =
  "text-gray-500 transition hover:text-gray-300 focus:outline-none"

const DiceButton = ({
  onClick,
  title,
}: {
  onClick: () => void
  title: string
}) => (
  <button onClick={onClick} type="button" className={diceClasses} title={title}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M13 1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h10zM3 0a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V3a3 3 0 0 0-3-3H3z" />{" "}
      <path d="M5.5 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm8 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-8 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm4-4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
    </svg>
  </button>
)

export default function Home() {
  const router = useRouter()
  const [roomName, setRoomName] = useState<string>("")
  const [nickName, setNickName] = useState<string>("")
  const [serverUrl, setServerUrl] = useState<string>(DEFAULT_SERVER)

  useEffect(() => {
    setRoomName(generateRoomName())
    setNickName(generateParticipantName())
    // 从 localStorage 恢复上次用的服务器
    const saved = localStorage.getItem("voice-chat-server-url")
    if (saved) setServerUrl(saved)
  }, [])

  const go = () => {
    if (roomName !== "" && nickName !== "") {
      if (typeof window !== "undefined") {
        saveRoomToLocalStorage(roomName, nickName)
        localStorage.setItem("voice-chat-server-url", serverUrl)
        // 把服务器地址存到 session，供房间页使用
        sessionStorage.setItem("voice-chat-server-url", serverUrl)
      }
      router.push(`/room?id=${encodeURIComponent(roomName)}`)
    }
  }

  const resetServer = () => setServerUrl(DEFAULT_SERVER)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 p-8">
        <h1 className="mb-2 text-center text-2xl font-bold text-white">
          语音聊天室
        </h1>
        <p className="mb-6 text-center text-sm text-gray-400">
          输入房间号和昵称，开始语音+文字聊天
        </p>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-300">服务器</label>
          <div className="flex gap-2">
            <input
              className={inputClasses}
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="服务器地址"
            />
            <button
              onClick={resetServer}
              title="恢复默认服务器"
              className="shrink-0 rounded-lg border border-gray-700 px-3 text-sm text-gray-400 transition hover:border-gray-500 hover:text-gray-200"
            >
              重置
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            可填任意 voice-chat-server 地址，默认用官方服务器
          </p>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-300">房间号</label>
          <div className="relative">
            <input
              className={inputClasses}
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="房间号"
            />
            <span className="absolute inset-y-0 right-0 grid w-10 place-content-center">
              <DiceButton
                onClick={() => setRoomName(generateRoomName())}
                title="随机房间号"
              />
            </span>
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm text-gray-300">昵称</label>
          <div className="relative">
            <input
              className={inputClasses}
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
              placeholder="你的昵称"
              onKeyDown={(e) => {
                if (e.key === "Enter") go()
              }}
            />
            <span className="absolute inset-y-0 right-0 grid w-10 place-content-center">
              <DiceButton
                onClick={() => setNickName(generateParticipantName())}
                title="随机昵称"
              />
            </span>
          </div>
        </div>

        <button
          onClick={go}
          className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-500"
          style={{ boxShadow: "none" }}
        >
          进入房间
        </button>

        <p className="mt-4 text-center text-xs text-gray-500">
          分享链接给朋友：{serverUrl}/room?id=房间号
        </p>
      </div>
    </div>
  )
}
