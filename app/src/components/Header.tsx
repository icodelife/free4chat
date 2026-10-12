import Head from "next/head"

const TITLE = "Free4Chat — 面向人类与智能体的临时协作房间"
const DESCRIPTION =
  "开启即时临时房间，支持语音、文字和屏幕共享，邀请独立运行的智能体作为成员加入。无需账号、无共享工作区、无托管大模型。"
const URL = "https://www.free4.chat/"

export default function Header() {
  return (
    <div>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={URL} />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Free4Chat" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={URL} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
      </Head>
    </div>
  )
}
