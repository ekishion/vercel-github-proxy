# Vercel GitHub Proxy

基于 Vercel Functions 的 GitHub 资源加速代理，可加速访问 GitHub 的 release、archive、raw、blob 等资源。

## 功能特点

- 运行于 Node.js 运行时（Fluid 计算默认启用）：流式响应、冷启动快、免费额度内可用
- 支持加速 GitHub 的 release、archive、raw、blob、gist 等资源
- 支持 git clone 加速（智能协议，POST 请求体全量透传）
- 流式转发，内存占用低，支持 Range 断点续传
- 支持访问私有仓库（需配置 GitHub Token）
- 提供简洁的 Web 界面，生成加速链接并可一键复制
- 支持主页伪装和 302 跳转
- 内置爬虫屏蔽和上游域名白名单（只代理 GitHub 系域名）
- 支持仓库 owner 白名单与简单的 IP 限速
- 支持直接在域名后添加完整 GitHub 链接的方式

## 快速部署

### 方法一：通过 Vercel 控制台部署

1. Fork 本仓库
2. 在 [Vercel 控制台](https://vercel.com/dashboard) 中导入项目
3. 在 Settings → Environment Variables 中配置环境变量（可选）
4. 点击部署

### 方法二：通过 Vercel CLI 部署

1. 安装 Vercel CLI：`npm i -g vercel`
2. 克隆本仓库：`git clone https://github.com/ekishion/vercel-github-proxy.git`
3. 进入项目目录：`cd vercel-github-proxy`
4. 部署到 Vercel：`vercel --prod`

## 配置选项

在 Vercel 项目的 Settings → Environment Variables 中配置以下环境变量：

| 环境变量 | 说明 | 默认值 |
| --- | --- | --- |
| `GITHUB_TOKEN` | GitHub 个人访问令牌（需 `repo` 权限），用于访问私有仓库 | 空 |
| `WHITELIST` | 只允许代理这些 GitHub 用户/组织的仓库，用逗号分隔，留空不限制 | 空 |
| `PREFIX` | 路径自定义前缀 | 空 |
| `URL` | 设置后，主页将显示为伪装页面（nginx 404 样式） | 空 |
| `URL302` | 设置后，访问主页将 302 跳转到指定 URL | 空 |
| `BLOCKED_USER_AGENTS` | 要屏蔽的用户代理关键词，用逗号分隔，留空则不屏蔽 | bot,spider,crawler |
| `RATE_LIMIT` | 每 IP 每分钟最大请求数，0 或留空不限制 | 0 |

## 使用方法

### 方法一：直接添加完整 GitHub 链接（推荐）

直接在域名后添加完整的 GitHub 链接：

```
https://your-vercel-app.vercel.app/https://github.com/owner/repo/releases/download/tag/file.zip
```

这种方式与 CF-Workers-GitHub 项目完全兼容，方便迁移和使用。

### 方法二：简化路径格式

```
https://your-vercel-app.vercel.app/owner/repo/releases/download/tag/file.zip
```

### 加速 GitHub Release 文件下载

原始链接：
```
https://github.com/owner/repo/releases/download/tag/file.zip
```

加速链接（方法一）：
```
https://your-vercel-app.vercel.app/https://github.com/owner/repo/releases/download/tag/file.zip
```

加速链接（方法二）：
```
https://your-vercel-app.vercel.app/owner/repo/releases/download/tag/file.zip
```

### 加速 GitHub Raw 文件

原始链接：
```
https://github.com/owner/repo/raw/branch/file.txt
```

加速链接（方法一）：
```
https://your-vercel-app.vercel.app/https://github.com/owner/repo/raw/branch/file.txt
```

加速链接（方法二）：
```
https://your-vercel-app.vercel.app/owner/repo/raw/branch/file.txt
```

### 加速 Git Clone

原始命令：
```
git clone https://github.com/owner/repo.git
```

加速命令（方法一）：
```
git clone https://your-vercel-app.vercel.app/https://github.com/owner/repo.git
```

加速命令（方法二）：
```
git clone https://your-vercel-app.vercel.app/owner/repo.git
```

## 平台限制说明

- 函数时长：Fluid 计算下 Hobby 套餐默认且最长 300 秒，Pro 套餐可配置到 800 秒。超过时长的大文件下载会被中断，建议配合下载工具的断点续传使用。
- 请求体上限：4.5 MB（git clone 的 POST 请求体通常远小于此值，不受影响）。
- 流式转发：响应体全程流式回传，不会在内存中缓冲整个文件；raw/gist 等小文本响应附带边缘缓存头。
- 修改环境变量后需要重新部署才能生效。

## 安全说明

- 上游域名白名单：只代理 `github.com`、`*.githubusercontent.com`、`codeload.github.com` 等 GitHub 系域名，其余一律 403，防止被当作开放代理滥用。
- GitHub Token 只发送给 GitHub 代码/仓库域名，不会跟随重定向发送到签名 URL 主机（如 `objects.githubusercontent.com`）。
- `RATE_LIMIT` 限速是单实例内存级缓解手段，如需更强的防护建议配合 Vercel Firewall 使用。

## 最近更新（v2.1）

- 采用 Web 标准 Request/Response 实现核心转发（`lib/proxy.js`），入口做 Node 桥接；曾试迁 Edge Runtime，因 Vercel 已弃用 Edge（官方建议 Node.js 运行时）而保留 Node + Fluid 方案
- v2.0：重构为单入口（`api/index.js` + `lib/` 共享模块），删除了 direct/proxy/debug/test 等冗余端点；改用原生 fetch 修复流式转发失效；支持 git clone 智能协议；新增 Range 断点续传；私有仓库 Token 覆盖 raw/gist/codeload；新增上游域名白名单与重定向逐跳校验；配置项全部环境变量化；首页支持生成加速链接并一键复制；修复 `URL`/`URL302` 伪装功能不生效的问题；移除 jsDelivr 自代理分支
