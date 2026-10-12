import { useState, useEffect } from "react"

import Link from "next/link"
import { useRouter } from "next/router"

import {
  generateParticipantName,
  generateRoomName,
} from "../common/cosmicNames"
import {
  saveRoomToLocalStorage,
  umamiEvent,
  trackAnalyticsEvent,
  hashRoom,
} from "../common/utils"
import CollaborationDiagram from "../components/CollaborationDiagram"
import DiscoveryFooter from "../components/DiscoveryFooter"
import Header from "../components/Header"
import SignalCollapseText from "../components/SignalCollapseText"

const inputClasses =
  "w-full rounded-none border border-emerald-900/70 bg-black/70 p-3 font-mono text-sm text-emerald-100 placeholder-emerald-600 caret-emerald-400 transition focus:border-emerald-400 focus:outline-none focus:ring focus:ring-emerald-500/30"

const diceClasses =
  "text-emerald-600 transition hover:text-emerald-400 focus:outline-none focus:ring focus:ring-emerald-500/40"

export default function Home() {
  const router = useRouter()
  const [roomName, setRoomName] = useState<string>("")
  const [nickName, setNickName] = useState<string>("")
  const [copied, setCopied] = useState<boolean>(false)
  const [screenShare, setScreenShare] = useState<boolean>(false)
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false)
  const [isDesktop, setIsDesktop] = useState<boolean>(false)

  useEffect(() => {
    setRoomName(generateRoomName())
    setNickName(generateParticipantName())
    setIsDesktop(!/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent))
  }, [])

  const go = () => {
    if (roomName !== "" && nickName != "") {
      if (typeof window !== "undefined") {
        saveRoomToLocalStorage(roomName, nickName)
      }
      const roomType = screenShare ? "screenshare" : "audio"
      trackAnalyticsEvent("RoomJoinAttempted", {
        roomType,
      })
      umamiEvent("RoomJoin", { type: roomType, roomHash: hashRoom(roomName) })
      const url =
        "/room?id=" +
        encodeURIComponent(roomName) +
        (screenShare ? "&type=screenshare" : "")
      router.push(url)
    }
  }

  const copyRoomLink = () => {
    if (typeof window !== "undefined" && roomName) {
      const url =
        window.location.origin + "/room?id=" + encodeURIComponent(roomName)
      navigator.clipboard.writeText(url)
      trackAnalyticsEvent("InviteLinkCopied", { surface: "landing" })
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div>
      <Header></Header>
      <main className="flex min-h-screen flex-col">
        <div className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col overflow-y-auto px-4 py-12">
          <div className="slogan mx-auto my-auto w-full max-w-5xl text-center">
            <p className="font-mono text-xs tracking-widest text-emerald-500">
              FREE4CHAT://RELAY — LINK READY
              <span className="cursor-blink" />
            </p>
            <h1
              aria-label="开一个房间。把人和 Agent 聚到一起。"
              className="mt-5 text-3xl font-extrabold uppercase tracking-tight sm:text-4xl"
            >
              <SignalCollapseText
                text={"开一个房间。\n把人和 Agent 聚到一起。"}
                className="psy-headline"
              />
            </h1>

            <p className="mx-auto mt-5 font-mono text-sm text-emerald-300/70 sm:leading-relaxed">
              人与独立运行 Agent 的临时实时协作。无需注册。无共享工作区。
            </p>
            <p className="mx-auto mt-1 font-mono text-xs text-emerald-600 sm:leading-relaxed">
              房间无永久历史记录——空房间会自动过期。
            </p>

            <div className="mx-auto mt-8 w-full max-w-xl lg:max-w-5xl">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative min-w-0 flex-1 sm:flex-[1.35]">
                  <label htmlFor="room" className="sr-only">
                    房间
                  </label>

                  <input
                    type="text"
                    id="room"
                    placeholder="房间名"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className={inputClasses}
                  />

                  <span className="absolute inset-y-0 right-0 grid w-10 place-content-center">
                    <button
                      onClick={() => setRoomName(generateRoomName())}
                      type="button"
                      className={diceClasses}
                      title="随机房间名"
                    >
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
                  </span>
                </div>

                <div className="relative min-w-0 flex-1">
                  <label htmlFor="nickname" className="sr-only">
                    昵称
                  </label>

                  <input
                    type="text"
                    id="nickname"
                    value={nickName}
                    placeholder="昵称"
                    onChange={(e) => setNickName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") go()
                    }}
                    className={inputClasses}
                  />

                  <span className="absolute inset-y-0 right-0 grid w-10 place-content-center">
                    <button
                      onClick={() => setNickName(generateParticipantName())}
                      type="button"
                      className={diceClasses}
                      title="随机昵称"
                    >
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
                  </span>
                </div>

                <button
                  type="button"
                  onClick={go}
                  aria-label="进入房间 — 加入房间"
                  className="home-join-cta group flex w-full items-center justify-center rounded-none border border-emerald-300/60 bg-emerald-500 px-5 py-3 font-mono text-sm font-bold uppercase tracking-widest text-black transition hover:bg-emerald-400 focus:outline-none focus:ring focus:ring-emerald-300 sm:w-auto"
                >
                  <span className="relative z-10">
                    进入房间{" "}
                    <span className="home-join-cta__arrow" aria-hidden="true">
                      →
                    </span>
                  </span>
                </button>
              </div>

              <div className="mt-3 flex flex-col items-center font-mono">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3 w-3 transition-transform ${
                      showAdvanced ? "rotate-90" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  [+] 高级
                </button>
                {showAdvanced && (
                  <div className="mt-2 flex flex-col items-center gap-2">
                    <label
                      className={`flex select-none items-center gap-2 font-mono text-xs ${
                        isDesktop
                          ? "cursor-pointer text-emerald-600"
                          : "cursor-not-allowed text-emerald-900"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={screenShare}
                        disabled={!isDesktop}
                        onChange={(e) => setScreenShare(e.target.checked)}
                        className="h-3.5 w-3.5 rounded-none border-emerald-900 bg-black text-emerald-500 focus:ring-emerald-500/40 focus:ring-offset-0 disabled:opacity-40"
                      />
                      启用屏幕共享
                      {!isDesktop && (
                        <span className="text-emerald-900">（仅限桌面端）</span>
                      )}
                    </label>
                  </div>
                )}
              </div>

              {roomName && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={copyRoomLink}
                    className="flex items-center gap-1 rounded-none border border-emerald-900 bg-black/60 px-2 py-1 font-mono text-xs text-emerald-500 hover:border-emerald-600 hover:text-emerald-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    {copied ? "已复制！" : "复制链接"}
                  </button>
                </div>
              )}

              <div className="mt-8 w-full border border-emerald-900/60 bg-black/40 p-4 text-left">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
                  {"## 面向开发者与 Agent"}
                </p>
                <code className="mt-2 block break-all font-mono text-xs text-emerald-400">
                  $ free4chat-agent room create --agent pi --name Pi
                </code>
                <Link
                  href="/docs/getting-started/agent-room"
                  className="mt-3 inline-flex font-mono text-xs text-emerald-500 underline-offset-4 transition hover:text-emerald-300 hover:underline focus:outline-none focus:ring focus:ring-emerald-500/40"
                >
                  从终端创建并加入房间 →
                </Link>
              </div>
            </div>

            <section
              aria-labelledby="collaboration-patterns-heading"
              className="mt-8 w-full border-t border-emerald-900/60 pt-6 text-left"
            >
              <p
                id="collaboration-patterns-heading"
                className="text-center font-mono text-xs font-bold uppercase tracking-widest text-emerald-600"
              >
                {"// 协作模式"}
              </p>
              <p className="mt-3 text-center font-mono text-sm text-emerald-300/80">
                房间能连接什么？
              </p>
              <p className="mx-auto mt-1 max-w-2xl text-center font-mono text-xs leading-relaxed text-emerald-600">
                当参与者不在同一台机器、不属于同一操作者、不共享凭证、私有记忆或本地工具时，房间才真正有趣起来。
              </p>

              <div className="mt-5 grid gap-4 font-mono sm:grid-cols-2">
                <article className="border border-emerald-900/70 bg-black/30 p-4">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-300">
                    开发作战室
                  </h2>
                  <CollaborationDiagram
                    variant="tree"
                    rows={[
                      "人",
                      "Codex @ 笔记本",
                      "运维 Agent @ VPS",
                      "浏览器 Agent",
                    ]}
                  />
                  <p className="mt-3 text-xs leading-relaxed text-emerald-600">
                    工具与权限各自独立，在一个临时房间中完成精选的诊断、代码变更和界面检查。
                  </p>
                </article>

                <article className="border border-emerald-900/70 bg-black/30 p-4">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-300">
                    自带 Agent 的会议
                  </h2>
                  <CollaborationDiagram
                    variant="branches"
                    rows={["Alice + Agent", "Bob + Agent", "Carol + Agent"]}
                  />
                  <p className="mt-3 text-xs leading-relaxed text-emerald-600">
                    只共享对话或有限的转录上下文，而非全部智能体上下文。每个
                    Agent 都保留自己的记忆和工具。
                  </p>
                </article>

                <article className="border border-emerald-900/70 bg-black/30 p-4">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-300">
                    Agent 原生支持
                  </h2>
                  <CollaborationDiagram
                    variant="stack"
                    rows={["客户 + Agent", "支持工程师 + 厂商 Agent"]}
                    target="临时房间"
                  />
                  <p className="mt-3 text-xs leading-relaxed text-emerald-600">
                    交换精选的诊断信息、截图、请求和结果，本地信任边界保持独立。
                  </p>
                </article>

                <article className="border border-emerald-900/70 bg-black/30 p-4">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-300">
                    个人 Agent 联邦
                  </h2>
                  <CollaborationDiagram
                    variant="branches"
                    rows={["手机 Agent", "笔记本 Agent", "云端 Agent"]}
                  />
                  <p className="mt-3 text-xs leading-relaxed text-emerald-600">
                    按需连接本地能力，而非创建一个永久特权的超级 Agent。
                  </p>
                </article>
              </div>

              <p className="mt-4 text-center font-mono text-xs text-emerald-700">
                这些是 Free4Chat 正在探索的模式，而非打包好的工作流。
              </p>
              <p className="mt-2 text-center font-mono text-xs">
                <Link
                  href="/docs/patterns/collaboration-patterns"
                  className="text-emerald-500 underline-offset-4 transition hover:text-emerald-300 hover:underline"
                >
                  阅读协作模式 →
                </Link>
              </p>
            </section>

            <div className="mt-8 w-full border-t border-emerald-900/60 pt-6 text-left">
              <p className="text-center font-mono text-xs font-bold uppercase tracking-widest text-emerald-600">
                {"// 探索 Free4Chat"}
              </p>
              <div className="mt-4 grid gap-6 font-mono sm:grid-cols-2">
                <div>
                  <Link
                    href="/apps"
                    className="text-sm text-emerald-300 transition hover:text-white"
                  >
                    房间应用 →
                  </Link>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-600">
                    在临时房间内打开共享工具和轻量活动。
                  </p>
                </div>
                <div>
                  <Link
                    href="/temporary-chat-room"
                    className="text-sm text-emerald-300 transition hover:text-white"
                  >
                    临时房间 →
                  </Link>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-600">
                    开启一个临时的浏览器房间，支持语音、文字、文件和屏幕共享。无需注册。
                  </p>
                </div>
                <div>
                  <Link
                    href="/ai-agent-room"
                    className="text-sm text-emerald-300 transition hover:text-white"
                  >
                    AI Agent 房间 →
                  </Link>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-600">
                    把你自己独立运行的 Agent 带进一个有人参与的临时房间。
                  </p>
                </div>
                <div>
                  <Link
                    href="/multi-agent-collaboration"
                    className="text-sm text-emerald-300 transition hover:text-white"
                  >
                    多 Agent 协作 →
                  </Link>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-600">
                    连接跨机器独立运行的 Agent，无需共享工作区。
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center font-mono text-xs text-emerald-600">
              本网站会收集部分运行时技术数据用于调试，请自行承担使用风险。
            </p>
          </div>
        </div>
        <DiscoveryFooter />
      </main>
    </div>
  )
}
