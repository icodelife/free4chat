import Link from "next/link"

import { ROOM_APP_CATALOG } from "../../common/roomApp"
import DiscoveryFooter from "../../components/DiscoveryFooter"
import SeoHead from "../../components/SeoHead"

const TITLE = "Free4Chat 应用 — 临时房间的共享活动"
const DESCRIPTION =
  "探索在临时 Free4Chat 房间内打开的共享工具和轻量活动。无需账号，分享一个房间链接即可协作或娱乐。"

export default function AppsPage() {
  const whiteboard = ROOM_APP_CATALOG.find((app) => app.id === "whiteboard")

  return (
    <div className="flex min-h-screen flex-col font-mono text-emerald-100">
      <SeoHead title={TITLE} description={DESCRIPTION} path="/apps" />
      <main className="flex-1 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="text-sm text-emerald-500 hover:text-emerald-300"
          >
            ← Free4Chat
          </Link>
          <p className="mt-10 font-mono text-xs tracking-widest text-emerald-500">
            FREE4CHAT://ROOM_APPS
          </p>
          <h1 className="mt-4 text-3xl font-extrabold uppercase tracking-tight text-emerald-200 sm:text-4xl">
            临时 Free4Chat 房间的应用
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-emerald-300/80">
            在临时房间内打开的共享工具和轻量活动。无需账号。打开一个应用、分享房间链接，协作或娱乐。
          </p>

          {whiteboard && (
            <section aria-label="生产环境房间应用" className="mt-10">
              <article className="border border-emerald-900/70 bg-black/30 p-5 sm:p-6">
                <p className="text-xs tracking-widest text-emerald-600">
                  房间应用 · {whiteboard.id.toUpperCase()}
                </p>
                <h2 className="mt-3 text-xl font-bold text-emerald-200">
                  在线 {whiteboard.label}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-emerald-300/80">
                  基于 Excalidraw
                  的免费协作白板。在临时房间中一起绘制编辑，再分享一个链接邀请其他人加入。
                </p>
                <Link
                  href={`/apps/${whiteboard.id}`}
                  className="mt-5 inline-flex text-sm text-emerald-400 underline-offset-4 transition hover:text-white hover:underline focus:outline-none focus:ring focus:ring-emerald-500/40"
                >
                  探索 {whiteboard.label} →
                </Link>
              </article>
            </section>
          )}
        </div>
      </main>
      <DiscoveryFooter />
    </div>
  )
}
