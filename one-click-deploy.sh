#!/bin/bash
# free4chat 服务端一键部署脚本
# 从零开始：建 SFU App → 部署 Worker → 设密钥 → 开 workers.dev
#
# 用法：
#   export CLOUDFLARE_API_TOKEN='你的token'      # 需要 Workers Scripts:Edit + Calls:Edit
#   export CLOUDFLARE_ACCOUNT_ID='你的账号ID'
#   ./one-click-deploy.sh
#
# 可选环境变量：
#   WORKER_NAME: Worker 名（默认 free4chat-test）
#   SFU_APP_NAME: SFU App 名（默认 voice-chat-server）

set -e

WORKER_NAME="${WORKER_NAME:-free4chat-test}"
SFU_APP_NAME="${SFU_APP_NAME:-voice-chat-server}"
API_BASE="https://api.cloudflare.com/client/v4"

# 检查环境变量
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "错误：请设置 CLOUDFLARE_API_TOKEN"
  exit 1
fi
if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
  echo "错误：请设置 CLOUDFLARE_ACCOUNT_ID"
  exit 1
fi

echo "=== free4chat 一键部署 ==="
echo "Worker: $WORKER_NAME"
echo ""

# 1. 创建 SFU App
echo "[1/5] 创建 SFU App..."
SFU_RESP=$(curl -s -X POST \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$SFU_APP_NAME\"}" \
  "$API_BASE/accounts/$CLOUDFLARE_ACCOUNT_ID/calls/apps")

SFU_APP_ID=$(echo "$SFU_RESP" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['result']['uid'])" 2>/dev/null)
SFU_APP_SECRET=$(echo "$SFU_RESP" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['result']['secret'])" 2>/dev/null)

if [ -z "$SFU_APP_ID" ] || [ "$SFU_APP_ID" = "None" ]; then
  echo "SFU App 创建失败："
  echo "$SFU_RESP" | head -c 500
  exit 1
fi
echo "  App ID: ${SFU_APP_ID:0:8}..."
echo "  Secret: 已获取（不显示）"

# 2. 安装依赖
echo "[2/5] 安装依赖..."
cd "$(dirname "$0")/app"
npm install --legacy-peer-deps --no-audit --no-fund > /dev/null 2>&1

# 3. 构建
echo "[3/5] 构建..."
npm run cf-build > /dev/null 2>&1

# 4. 部署（带上 SFU_APP_ID）
echo "[4/5] 部署 Worker..."
npx wrangler deploy --var "SFU_APP_ID:$SFU_APP_ID" 2>&1 | grep -E "workers.dev|Deployed|Error" | head -5

# 5. 设置密钥
echo "[5/5] 设置 SFU 密钥..."
echo "$SFU_APP_SECRET" | npx wrangler secret put SFU_APP_SECRET > /dev/null 2>&1
echo "  完成"

# 6. 启用 workers.dev
echo "[6/5] 启用 workers.dev..."
curl -s -X POST \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true}' \
  "$API_BASE/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/scripts/$WORKER_NAME/subdomain" \
  | grep -q '"enabled":true' && echo "  已启用" || echo "  失败，请手动开启"

echo ""
echo "=== 部署完成 ==="
echo "SFU App ID: $SFU_APP_ID"
echo "访问地址稍后在 Cloudflare 后台查看 workers.dev 域名"
echo ""
echo "注意：请妥善保存 SFU App Secret，更新代码重新部署时需要它"
echo "  export SFU_APP_SECRET='$SFU_APP_SECRET'"
