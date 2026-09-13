# 部署指南

本文档提供了将 Vercel GitHub Proxy 部署到 Vercel 平台的详细步骤。

## 通过 Vercel 控制台部署

1. 登录 [Vercel 控制台](https://vercel.com/dashboard)
2. 点击 "Add New..." -> "Project"
3. 导入 GitHub 仓库（如果是第一次使用，需要先授权 Vercel 访问你的 GitHub 账号）
4. 选择包含 vercel-github-proxy 代码的仓库
5. 配置项目（可以保持默认设置）
6. 在环境变量部分，可以按需添加（均为可选）：
   - `GITHUB_TOKEN`：GitHub 个人访问令牌（需 `repo` 权限），用于访问私有仓库
   - `WHITELIST`：只允许代理这些 GitHub 用户/组织的仓库，用逗号分隔，留空不限制
   - `PREFIX`：路径自定义前缀
   - `URL`：设置后，主页将显示为伪装页面
   - `URL302`：设置后，访问主页将 302 跳转到指定 URL
   - `BLOCKED_USER_AGENTS`：要屏蔽的用户代理关键词，用逗号分隔
   - `RATE_LIMIT`：每 IP 每分钟最大请求数，0 或留空不限制
   - `MAINTENANCE`：维护模式开关，设为 `1` 后所有请求返回 503 维护页，留空或 `0` 为在线
7. 点击 "Deploy" 按钮开始部署
8. 等待部署完成后，Vercel 会提供一个 `*.vercel.app` 域名

## 配置自定义域名（可选）

1. 在项目页面，点击 "Settings" -> "Domains"
2. 添加你的自定义域名
3. 按照 Vercel 的指引配置 DNS 记录
4. 等待 DNS 生效

## 更新已部署的项目

1. 在本地修改代码后，将更改推送到 GitHub 仓库
2. Vercel 会自动检测更改并重新部署
3. 也可以在 Vercel 控制台手动触发重新部署

## 常见问题

### 部署失败

如果部署失败，请检查：
1. 确保 package.json 文件正确
2. 检查是否有语法错误
3. 查看 Vercel 的构建日志以获取详细错误信息

### 无法访问私有仓库

确保已正确设置 `GITHUB_TOKEN` 环境变量，并且该 Token 具有访问私有仓库的 `repo` 权限。

### 大文件下载中断

函数时长上限为 300 秒（Hobby 套餐，Fluid 计算默认值），超过后下载会被中断：
1. 使用支持断点续传的下载工具（本项目已透传 Range 请求头，支持从断点恢复）
2. Pro 套餐可在 vercel.json 中将 `maxDuration` 调整到最高 800 秒
3. 单次请求体上限为 4.5 MB，只影响上传方向，不影响下载
4. 修改环境变量后需要重新部署才能生效

### 请求返回 403 Forbidden: Only GitHub URLs are allowed

本项目只代理 GitHub 系域名（github.com、*.githubusercontent.com、codeload.github.com 等），以防止被当作开放代理滥用。如需扩展代理域名，可修改 `lib/proxy.js` 中的 `UPSTREAM_HOSTS`。

## 性能优化建议

1. 使用自定义域名并配置 CDN
2. 选择离用户最近的 Vercel 区域部署（Settings → Functions → Function Region）
3. raw/gist 等小文本响应自带 5 分钟边缘缓存（`s-maxage=300`）
