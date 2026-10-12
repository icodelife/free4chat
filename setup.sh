#!/bin/bash
# 一键部署脚本 - fork 版 free4chat 服务端
# 用法：./setup.sh
# 前置：已设置 CLOUDFLARE_API_TOKEN 和 CLOUDFLARE_ACCOUNT_ID 环境变量

set -e

echo "=== free4chat 服务端一键部署 ==="
echo ""

# 检查环境变量
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "错误：请先设置 CLOUDFLARE_API_TOKEN"
  echo "  export CLOUDFLARE_API_TOKEN='your-token'"
  exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
  echo "错误：请先设置 CLOUDFLARE_ACCOUNT_ID"
  echo "  export CLOUDFLARE_ACCOUNT_ID='your-account-id'"
  exit 1
fi

cd "$(dirname "$0")/app"

echo "1/4 安装依赖..."
npm install --legacy-peer-deps --no-audit --no-fund > /dev/null 2>&1 || {
  echo "依赖安装失败，请检查网络"
  exit 1
}

echo "2/4 构建..."
npm run cf-build > /dev/null 2>&1 || {
  echo "构建失败"
  exit 1
}

echo "3/4 设置 SFU 密钥..."
if [ -n "$SFU_APP_SECRET" ]; then
  echo "$SFU_APP_SECRET" | npx wrangler secret put SFU_APP_SECRET > /dev/null 2>&1
  echo "  SFU_APP_SECRET 已设置"
else
  echo "  跳过（未设置 SFU_APP_SECRET 环境变量）"
  echo "  请手动运行：wrangler secret put SFU_APP_SECRET"
fi

echo "4/4 部署..."
npx wrangler deploy 2>&1 | grep -E "workers.dev|Deployed|Error" | head -5

echo ""
echo "5/5 启用 workers.dev..."
curl -s -X POST \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true}' \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/scripts/free4chat-test/subdomain" \
  | grep -o '"enabled":true' > /dev/null && echo "  workers.dev 已启用" || echo "  启用失败，请手动到后台开启"

echo ""
echo "=== 部署完成 ==="
