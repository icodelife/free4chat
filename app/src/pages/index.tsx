import { useState, useEffect, useRef } from "react"

import { useRouter } from "next/router"

import {
  generateParticipantName,
  generateRoomTitle,
  generateRoomId,
} from "../common/cosmicNames"
import { saveRoomToLocalStorage } from "../common/utils"

// 默认服务器（我们的官方服务器）
const DEFAULT_SERVER =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://voice-chat-server.cheng-0b4.workers.dev"

interface RoomListItem {
  room: string
  participants: number
  hasPassword: boolean
  title: string | null
  expiresAt: number | null
  lastActiveAt: number
}

// 空闲房间距离销毁的分钟数（不足 1 分钟显示"即将"）
function idleCountdown(r: RoomListItem): string {
  if (r.participants > 0 || !r.expiresAt) return "空闲"
  const mins = Math.max(0, Math.round((r.expiresAt - Date.now()) / 60000))
  return mins <= 0 ? "空闲·即将清理" : `空闲·${mins}分钟后清理`
}

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
  // 房间 ID：后台随机生成，不展示给用户
  const [roomId] = useState<string>(() => generateRoomId())
  const [nickName, setNickName] = useState<string>("")
  const [serverUrl, setServerUrl] = useState<string>(DEFAULT_SERVER)
  const [password, setPassword] = useState<string>("")
  const [roomTitle, setRoomTitle] = useState<string>("")
  const [rooms, setRooms] = useState<RoomListItem[]>([])
  const [roomsLoaded, setRoomsLoaded] = useState(false)
  // 正在输密码的房间（点 🔒 卡片后展开）
  const [pwRoom, setPwRoom] = useState<RoomListItem | null>(null)
  const [pwValue, setPwValue] = useState<string>("")
  const [nickHint, setNickHint] = useState(false)
  const [copied, setCopied] = useState(false)
  // 服务端是否支持密码房（取不到时默认 true，保持现有行为）
  const [passwordRooms, setPasswordRooms] = useState(true)
  // 房间名是否自动生成（用户手动改过就不再自动覆盖）
  const titleAuto = useRef(true)
  const nickRef = useRef<HTMLInputElement>(null)
  const pwRef = useRef<HTMLInputElement>(null)

  const usedNames = () => rooms.map((r) => ({ name: r.title || r.room }))

  useEffect(() => {
    setNickName(generateParticipantName())
    setRoomTitle(generateRoomTitle([]))
    // 从 localStorage 恢复上次用的服务器
    const saved = localStorage.getItem("voice-chat-server-url")
    if (saved) setServerUrl(saved)
  }, [])

  // 拉取服务端能力（是否支持密码房等），服务器地址变化时刷新
  useEffect(() => {
    let cancelled = false
    const fetchCaps = async () => {
      const base = serverUrl.trim().replace(/\/+$/, "")
      if (!base) return
      try {
        const resp = await fetch(`${base}/health`)
        if (!resp.ok) return
        const data = (await resp.json()) as {
          capabilities?: { passwordRooms?: boolean }
        }
        const pr = data?.capabilities?.passwordRooms
        if (!cancelled && typeof pr === "boolean") setPasswordRooms(pr)
      } catch {
        // 取不到就保持上次的值（默认显示密码框）
      }
    }
    fetchCaps()
    return () => {
      cancelled = true
    }
  }, [serverUrl])

  // 拉取活跃房间列表（15 秒刷新一次）
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined
    const fetchRooms = async () => {
      const base = serverUrl.trim().replace(/\/+$/, "")
      if (!base) {
        setRooms([])
        setRoomsLoaded(true)
        return
      }
      try {
        const resp = await fetch(`${base}/api/rooms`)
        if (!resp.ok) {
          setRooms([])
          setRoomsLoaded(true)
          return
        }
        const data = (await resp.json()) as { rooms?: RoomListItem[] }
        const list = Array.isArray(data.rooms) ? data.rooms : []
        setRooms(list)
        // 房间名是自动生成的且重名了，换一个
        if (titleAuto.current) {
          setRoomTitle((cur) => {
            const taken = new Set(list.map((r) => r.title || r.room))
            return taken.has(cur)
              ? generateRoomTitle(
                  list.map((r) => ({ name: r.title || r.room }))
                )
              : cur
          })
        }
      } catch {
        setRooms([])
      }
      setRoomsLoaded(true)
    }
    fetchRooms()
    timer = setInterval(fetchRooms, 15000)
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [serverUrl])

  // 进房：rid 为房间 ID（对外不可见），title 只在建房时用
  const enter = (rid: string, title: string, pw: string) => {
    if (!nickName.trim()) {
      setNickHint(true)
      nickRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      nickRef.current?.focus()
      return
    }
    if (typeof window !== "undefined") {
      saveRoomToLocalStorage(rid, nickName)
      localStorage.setItem("voice-chat-server-url", serverUrl)
      // 把服务器地址、密码和房间名称存到 session，供房间页使用
      sessionStorage.setItem("voice-chat-server-url", serverUrl)
      if (pw) {
        sessionStorage.setItem("voice-chat-room-password", pw)
      } else {
        sessionStorage.removeItem("voice-chat-room-password")
      }
      if (title.trim()) {
        sessionStorage.setItem("voice-chat-room-title", title.trim())
      } else {
        sessionStorage.removeItem("voice-chat-room-title")
      }
    }
    router.push(`/room?id=${encodeURIComponent(rid)}`)
  }

  // 创建新房间：标题为空则自动生成一个；服务端不支持密码房时不传密码
  const create = () => {
    const title = roomTitle.trim() || generateRoomTitle(usedNames())
    enter(roomId, title, passwordRooms ? password : "")
  }

  // 从列表点房间：公开房直接进，密码房展开密码输入
  const joinFromList = (r: RoomListItem) => {
    setPwValue("")
    if (r.hasPassword) {
      setPwRoom(r)
      setTimeout(() => pwRef.current?.focus(), 50)
    } else {
      setPwRoom(null)
      enter(r.room, "", "")
    }
  }

  const copyLink = async () => {
    // 分享链接必须指向前端（当前站点），/room 是前端路由，后端没有这个页面
    const link = `${window.location.origin}/room?id=${encodeURIComponent(
      roomId
    )}`
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      // 剪贴板不可用时降级为 prompt
      window.prompt("复制分享链接：", link)
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetServer = () => setServerUrl(DEFAULT_SERVER)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 p-8">
        <h1 className="mb-2 text-center text-2xl font-bold text-white">
          语音聊天室
        </h1>
        <p className="mb-6 text-center text-sm text-gray-400">
          填个昵称，加入房间或创建新房间
        </p>

        {/* 昵称：两条路径共用 */}
        <div className="mb-6">
          <label className="mb-1 block text-sm text-gray-300">昵称</label>
          <div className="relative">
            <input
              ref={nickRef}
              className={inputClasses}
              value={nickName}
              onChange={(e) => {
                setNickName(e.target.value)
                setNickHint(false)
              }}
              placeholder="你的昵称"
            />
            <span className="absolute inset-y-0 right-0 grid w-10 place-content-center">
              <DiceButton
                onClick={() => {
                  setNickName(generateParticipantName())
                  setNickHint(false)
                }}
                title="随机昵称"
              />
            </span>
          </div>
          {nickHint && (
            <p className="mt-1 text-xs text-red-400">请先填写昵称</p>
          )}
        </div>

        {/* 加入房间 */}
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-gray-200">加入房间</p>
          {roomsLoaded && rooms.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                {rooms.map((r) => (
                  <button
                    key={r.room}
                    onClick={() => joinFromList(r)}
                    type="button"
                    className="flex min-h-16 flex-col justify-center rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-left transition hover:border-gray-600"
                  >
                    <span className="truncate text-sm text-white">
                      {r.hasPassword ? "🔒 " : ""}
                      {r.title || r.room}
                    </span>
                    <span className="mt-0.5 text-xs text-gray-500">
                      {r.participants > 0 ? (
                        <>● {r.participants} 人在线</>
                      ) : (
                        <>{idleCountdown(r)}</>
                      )}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">点击卡片直接加入</p>
            </>
          ) : roomsLoaded ? (
            <p className="rounded-lg border border-dashed border-gray-800 px-3 py-4 text-center text-sm text-gray-500">
              还没有活跃房间，在下面创建一个吧
            </p>
          ) : (
            <p className="text-sm text-gray-500">房间列表加载中…</p>
          )}

          {/* 密码房：卡片内展开输入 */}
          {pwRoom && (
            <div className="mt-2 flex gap-2">
              <input
                ref={pwRef}
                type="password"
                className={inputClasses}
                value={pwValue}
                onChange={(e) => setPwValue(e.target.value)}
                placeholder={`输入「${pwRoom.title || "房间"}」的密码`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && pwValue) {
                    enter(pwRoom.room, "", pwValue)
                    setPwRoom(null)
                  }
                }}
              />
              <button
                onClick={() => {
                  if (pwValue) {
                    enter(pwRoom.room, "", pwValue)
                    setPwRoom(null)
                  }
                }}
                className="shrink-0 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-500"
              >
                进入
              </button>
              <button
                onClick={() => setPwRoom(null)}
                className="shrink-0 rounded-lg border border-gray-700 px-3 text-sm text-gray-400 transition hover:text-gray-200"
              >
                取消
              </button>
            </div>
          )}
        </div>

        {/* 创建新房间 */}
        <div className="mb-6 border-t border-gray-800 pt-4">
          <p className="mb-2 text-sm font-medium text-gray-200">创建新房间</p>
          <div className="mb-3">
            <label className="mb-1 block text-sm text-gray-300">房间名</label>
            <div className="relative">
              <input
                className={inputClasses}
                value={roomTitle}
                onChange={(e) => {
                  setRoomTitle(e.target.value)
                  titleAuto.current = false
                }}
                placeholder="房间名"
                maxLength={30}
              />
              <span className="absolute inset-y-0 right-0 grid w-10 place-content-center">
                <DiceButton
                  onClick={() => {
                    setRoomTitle(generateRoomTitle(usedNames()))
                    titleAuto.current = true
                  }}
                  title="随机房间名"
                />
              </span>
            </div>
          </div>
          {passwordRooms && (
            <div className="mb-4">
              <label className="mb-1 block text-sm text-gray-300">
                房间密码 <span className="text-gray-500">（可选）</span>
              </label>
              <input
                type="password"
                className={inputClasses}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="留空为公开房，填了就是密码房"
                onKeyDown={(e) => {
                  if (e.key === "Enter") create()
                }}
              />
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={create}
              className="flex-1 rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-500"
              style={{ boxShadow: "none" }}
            >
              创建并进入
            </button>
            <button
              onClick={copyLink}
              title="复制分享链接"
              className="shrink-0 rounded-lg border border-gray-700 px-4 text-sm text-gray-300 transition hover:border-gray-500 hover:text-white"
            >
              {copied ? "已复制 ✓" : "复制链接"}
            </button>
          </div>
        </div>

        {/* 高级设置 */}
        <details className="text-sm text-gray-400">
          <summary className="cursor-pointer select-none text-gray-500 hover:text-gray-300">
            高级设置
          </summary>
          <div className="mt-2">
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
        </details>
      </div>
    </div>
  )
}
