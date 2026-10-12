import { useRouter } from "next/router"

import {
  generateParticipantName,
  generateRoomName,
} from "../../common/cosmicNames"
import { saveRoomToLocalStorage } from "../../common/utils"
import DiscoveryPageLayout from "../../components/DiscoveryPageLayout"

export default function WhiteboardPage() {
  const router = useRouter()

  const openWhiteboardRoom = () => {
    const roomName = generateRoomName()
    const nickName = generateParticipantName()
    saveRoomToLocalStorage(roomName, nickName)
    void router.push(`/room?id=${encodeURIComponent(roomName)}&app=whiteboard`)
  }

  return (
    <DiscoveryPageLayout
      title="免费在线协作白板 — 无需注册 | Free4Chat"
      description="几秒钟内开启免费在线协作白板。实时一起绘制编辑，分享一个房间链接，无需账号即可使用。"
      path="/apps/whiteboard"
      ctaId="whiteboard"
      primaryCta={{
        label: "打开白板房间",
        onClick: openWhiteboardRoom,
      }}
      h1="一个可即时打开、即时分享的免费协作白板"
    >
      <p>
        白板是基于 Excalidraw 的免费在线白板，运行于临时 Free4Chat
        房间内。无需账号或登录。打开白板、分享房间链接，受邀者进入同一房间时舞台上已选中白板。
      </p>

      <h2>使用方法</h2>
      <ol>
        <li>
          <strong>打开白板房间。</strong> 白板从房间的舞台开始显示。
        </li>
        <li>
          <strong>分享房间链接。</strong> 受邀者加入同一房间，白板已选中。
        </li>
        <li>
          <strong>一起绘制。</strong> 实时添加想法、编辑共享画面。
        </li>
      </ol>

      <h2>你可以做什么</h2>
      <ul>
        <li>徒手素描；添加文字、矩形、椭圆、菱形、箭头和直线。</li>
        <li>选择、移动和编辑对象，调整绘制样式，缩放或平移画布。</li>
        <li>用鼠标或触控板绘制，或在手机、平板上使用触摸输入。</li>
        <li>与多人协作，白板旁同时保留房间的语音、文字和文件分享。</li>
        <li>
          使用 <strong>New board</strong> 为所有人清空共享画面、重新开始。
        </li>
      </ul>

      <h2>适合快速共同思考</h2>
      <p>
        用共享白板进行远程头脑风暴、快速团队会议、教学时的可视化讲解，或临时的架构/流程草图。它让人们有一个地方共同打磨想法，而无需搭建永久工作区。
      </p>

      <h2>生而临时</h2>
      <p>
        无需账号，白板 V1
        不保存永久画布。画面存在于活跃的浏览器副本中；如果所有副本都关闭或刷新，白板可能重置。V1
        不支持向白板导入图片和文件。房间文件分享仍可单独使用。
      </p>

      <h2>白板常见问题</h2>
      <h3>在线白板免费吗？</h3>
      <p>是的。当前白板应用可以免费打开和使用。</p>

      <h3>需要账号或登录吗？</h3>
      <p>开启白板房间无需账号或登录。</p>

      <h3>多人可以在同一块白板上绘制吗？</h3>
      <p>可以。房间内的人可以实时一起绘制、编辑共享白板。</p>

      <h3>可以在手机或平板上使用吗？</h3>
      <p>可以。嵌入的绘制区域支持触摸输入，包括手机和平板。</p>

      <h3>白板会永久保存吗？</h3>
      <p>
        不会。白板 V1
        没有永久画布存储。如果所有活跃的浏览器副本都刷新或关闭，白板可能重置。
      </p>

      <h3>可以把图片或文件导入白板吗？</h3>
      <p>V1 不支持。可以在白板之外使用房间文件分享。</p>
    </DiscoveryPageLayout>
  )
}
