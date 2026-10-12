# fork-free4chat 一键部署（从零开始）

## 前置（手动，一次性，约 3 分钟）

### 1. 创建 API Token

1. 访问 https://dash.cloudflare.com/profile/api-tokens
2. **Create Token** → **Create Custom Token**
3. 权限勾选：
   - **Workers Scripts** → **Edit**
   - **Calls** → **Edit**（用于自动创建 SFU App）
4. **Account Resources** → **Include** → 你的账号
5. 创建并复制 token（只显示一次）

### 2. （可选）Fork 本仓库到 GitHub

如果要用 GitHub Actions 自动部署，先 fork。

## 方式一：本地一键部署

```bash
export CLOUDFLARE_API_TOKEN='你的token'
export CLOUDFLARE_ACCOUNT_ID='你的账号ID'  # 在 Cloudflare 后台 URL 里

./one-click-deploy.sh
```

脚本会自动：
1. 调用 API 创建 SFU App（拿到 App ID + Secret）
2. `npm install` + `npm run cf-build`
3. `wrangler deploy`（带上 SFU_APP_ID）
4. `wrangler secret put SFU_APP_SECRET`
5. 调用 API 启用 workers.dev

完成后输出访问地址。**请保存好输出的 SFU App Secret**，下次更新代码时需要它。

### 更新代码（非首次）

```bash
export CLOUDFLARE_API_TOKEN='你的token'
export CLOUDFLARE_ACCOUNT_ID='你的账号ID'
export SFU_APP_SECRET='之前保存的Secret'

# 修改 wrangler.jsonc，把 SFU_APP_ID 填进去，或用 --var 参数
cd app && npm run cf-build && npx wrangler deploy --var "SFU_APP_ID:<你的AppID>"
echo "$SFU_APP_SECRET" | npx wrangler secret put SFU_APP_SECRET
```

## 方式二：GitHub Actions（一键，最推荐）

### 首次部署

1. Fork 仓库后，到 **Settings** → **Secrets and variables** → **Actions** 添加：
   - `CLOUDFLARE_API_TOKEN`：你的 token
   - `CLOUDFLARE_ACCOUNT_ID`：你的账号 ID

2. 到 **Actions** → **One-Click Deploy** → **Run workflow**
   - 选 `fresh_install: true`
   - 点 **Run workflow**

3. 等 workflow 跑完，它会自动创建 SFU App、部署、设密钥、开 workers.dev。
   - 跑完后去 workflow 日志里找到 `SFU_APP_ID`，添加到 Secrets
   - 把 `SFU_APP_SECRET`（脚本输出时显示）也添加到 Secrets

### 日常更新

直接 `git push`，Actions 自动重新部署（用已保存的 SFU 凭证，不会重复创建）。

## 验证

访问 `https://<worker名>.<你的子域>.workers.dev/room?id=test`，能进房就是成功。

## 故障排查

| 问题 | 原因 | 解法 |
|------|------|------|
| `forbidden_origin` | 域名不在白名单 | 检查 `src/common/origin.ts`，加上你的域名 |
| `Unable to create SFU session` | SFU 密钥不对 | 检查 `SFU_APP_SECRET` 是否正确设置 |
| workers.dev 打不开 | 子域没启用 | 手动到后台 **Workers** → **Settings** → **Domains & Routes** 开启 |
