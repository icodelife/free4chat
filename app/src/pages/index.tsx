import { useState, useEffect } from "react"

import { useRouter } from "next/router"

import {
  generateParticipantName,
  generateRoomName,
} from "../common/cosmicNames"
import { saveRoomToLocalStorage } from "../common/utils"

const inputClasses =
  "w-full rounded-lg border border-gray-700 bg-gray-900 p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"

export default function Home() {
  const router = useRouter()
  const [roomName, setRoomName] = useState<string>("")
  const [nickName, setNickName] = useState<string>("")

  useEffect(() => {
    setRoomName(generateRoomName())
    setNickName(generateParticipantName())
  }, [])

  const go = () => {
    if (roomName !== "" && nickName !== "") {
      if (typeof window !== "undefined") {
        saveRoomToLocalStorage(roomName, nickName)
      }
      router.push(`/room?id=${encodeURIComponent(roomName)}`)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 p-8 shadow-xl">
        <h1 className="mb-2 text-center text-2xl font-bold text-white">
          语音聊天室
        </h1>
        <p className="mb-6 text-center text-sm text-gray-400">
          输入房间号和昵称，开始语音+文字聊天
        </p>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-300">房间号</label>
          <input
            className={inputClasses}
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="房间号"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm text-gray-300">昵称</label>
          <input
            className={inputClasses}
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
            placeholder="你的昵称"
            onKeyDown={(e) => {
              if (e.key === "Enter") go()
            }}
          />
        </div>

        <button
          onClick={go}
          className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-500"
        >
          进入房间
        </button>

        <p className="mt-4 text-center text-xs text-gray-500">
          分享链接给朋友：
          {typeof window !== "undefined" ? window.location.origin : ""}
          /room?id=房间号
        </p>
      </div>
    </div>
  )
}
