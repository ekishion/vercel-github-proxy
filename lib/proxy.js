// 核心转发模块（Web 标准实现，运行于 Vercel Edge Runtime）
// 上游域名白名单、手动重定向逐跳校验、流式回传、Range 透传、内存级限速
import { homeHtml, disguisedHtml } from './pages.js';

// ---------- 配置（全部来自环境变量，字面量引用） ----------
const config = {
  // GitHub 个人访问令牌，用于访问私有仓库
  githubToken: process.env.GITHUB_TOKEN || '',
  // 设置后，主页将显示为伪装页面
  disguiseUrl: process.env.URL || '',
  // 设置后，访问主页将 302 跳转到指定 URL
  redirectUrl: process.env.URL302 || '',
  // 路径自定义前缀，默认为空
  prefix: process.env.PREFIX || '',
  // 只允许代理以下 GitHub 用户/组织的仓库，空数组则不限制
  whitelist: (process.env.WHITELIST || '').split(',').map(s => s.trim()).filter(Boolean),
  // 要屏蔽的用户代理关键词（过滤空项，避免空关键词拦截所有请求）
  blockedUserAgents: (process.env.BLOCKED_USER_AGENTS || 'bot,spider,crawler')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
  // 每 IP 每分钟最大请求数，0 或非法值表示不限制
  rateLimit: parseInt(process.env.RATE_LIMIT || '0', 10) || 0
};

// 上游域名白名单：只代理 GitHub 系资源域名
const UPSTREAM_HOSTS = new Set([
  'github.com',
  'raw.githubusercontent.com',
  'gist.githubusercontent.com',
  'gist.github.com',
  'codeload.github.com',
  'objects.githubusercontent.com',
  'release-assets.githubusercontent.com',
  'media.githubusercontent.com'
]);

// 允许携带 GITHUB_TOKEN 的主机（签名 URL 主机不携带，避免令牌外发）
const TOKEN_HOSTS = new Set([
  'github.com',
  'gist.github.com',
  'raw.githubusercontent.com',
  'gist.githubusercontent.com',
  'codeload.github.com'
]);

const MAX_REDIRECTS = 5;
// Edge Runtime 要求 25 秒内开始发送响应，上游响应头超时须小于该值
const UPSTREAM_HEADER_TIMEOUT_MS = 20000;
const DEFAULT_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// 逐跳头由平台处理；content-encoding/content-length 不回传，避免解压后与实际字节不一致
const SKIPPED_RESPONSE_HEADERS = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade',
  'content-encoding', 'content-length', 'content-disposition', 'set-cookie'
]);

// 只透传这些请求头（accept-encoding 交给运行时自己协商）
const FORWARD_REQUEST_HEADERS = ['accept', 'accept-language', 'range', 'content-type'];
const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const ATTACHMENT_EXT_RE = /\.(zip|tar\.gz|tgz|tar\.bz2|tar\.xz|tar|exe|dmg|apk|jar|iso|bin|rar|7z|gz|xz|msi|deb|rpm|appimage)$/i;

// ---------- 通用检查 ----------
function isBot(userAgent) {
  if (!userAgent || config.blockedUserAgents.length === 0) return false;
  const ua = String(userAgent).toLowerCase();
  return config.blockedUserAgents.some(keyword => ua.includes(keyword));
}

const rateBuckets = new Map();
function checkRateLimit(request) {
  if (!config.rateLimit) return true;
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  const window = Math.floor(Date.now() / 60000);
  let bucket = rateBuckets.get(ip);
  if (!bucket || bucket.window !== window) {
    bucket = { window, count: 0 };
    rateBuckets.set(ip, bucket);
    if (rateBuckets.size > 10000) {
      for (const [key, b] of rateBuckets) {
        if (b.window !== window) rateBuckets.delete(key);
      }
    }
  }
  bucket.count += 1;
  return bucket.count <= config.rateLimit;
}

// ---------- URL 工具 ----------
// 兼容 Vercel 把 https:// 规范成 https:/ 的路径格式
function fixUrl(url) {
  return url
    .replace(/^https:\/(?!\/)/i, 'https://')
    .replace(/^http:\/(?!\/)/i, 'http://');
}

function isAllowedUrl(urlStr) {
  try {
    return UPSTREAM_HOSTS.has(new URL(urlStr).hostname);
  } catch {
    return false;
  }
}

function extractOwner(urlStr) {
  try {
    const u = new URL(urlStr);
    const ownerHosts = ['github.com', 'gist.github.com', 'raw.githubusercontent.com', 'gist.githubusercontent.com', 'codeload.github.com'];
    if (ownerHosts.includes(u.hostname)) {
      return u.pathname.split('/').filter(Boolean)[0] || '';
    }
  } catch {
    // 非法 URL 交给上游流程处理
  }
  return '';
}

function isOwnerAllowed(owner) {
  if (config.whitelist.length === 0) return true;
  if (!owner) return true;
  return config.whitelist.includes(owner);
}

// ---------- GitHub URL 类型匹配 ----------
// 支持带或不带协议头；前三种为固定域名，其余兼容 /owner/repo/... 简化格式
const MATCHERS = [
  { re: /^(?:https?:\/\/)?raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/(.+)$/i,
    build: ([, owner, repo, ref]) => `https://raw.githubusercontent.com/${owner}/${repo}/${ref}` },
  { re: /^(?:https?:\/\/)?gist\.github\.com\/([^\/]+)\/([^\/]+)\/raw\/(.+)$/i,
    build: ([, owner, gistId, file]) => `https://gist.githubusercontent.com/${owner}/${gistId}/raw/${file}` },
  { re: /^(?:https?:\/\/)?gist\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/raw\/(.+)$/i,
    build: ([, owner, gistId, file]) => `https://gist.githubusercontent.com/${owner}/${gistId}/raw/${file}` },
  { re: /^(?:(?:https?:\/\/)?github\.com\/)?([^\/]+)\/([^\/]+)\/releases\/download\/([^\/]+)\/(.+)$/i,
    build: ([, owner, repo, tag, file]) => `https://github.com/${owner}/${repo}/releases/download/${tag}/${file}` },
  { re: /^(?:(?:https?:\/\/)?github\.com\/)?([^\/]+)\/([^\/]+)\/releases\/tag\/([^\/]+)$/i,
    build: ([, owner, repo, tag]) => `https://github.com/${owner}/${repo}/releases/tag/${tag}` },
  { re: /^(?:(?:https?:\/\/)?github\.com\/)?([^\/]+)\/([^\/]+)\/archive\/(.+)$/i,
    build: ([, owner, repo, ref]) => `https://github.com/${owner}/${repo}/archive/${ref}` },
  { re: /^(?:(?:https?:\/\/)?github\.com\/)?([^\/]+)\/([^\/]+)\/blob\/(.+)$/i,
    build: ([, owner, repo, ref]) => `https://raw.githubusercontent.com/${owner}/${repo}/${ref}` },
  { re: /^(?:(?:https?:\/\/)?github\.com\/)?([^\/]+)\/([^\/]+)\/raw\/(.+)$/i,
    build: ([, owner, repo, ref]) => `https://raw.githubusercontent.com/${owner}/${repo}/${ref}` },
  // git 智能协议：clone 时的 info/refs 与 git-upload-pack
  { re: /^(?:(?:https?:\/\/)?github\.com\/)?([^\/]+)\/([^\/]+?)(?:\.git)?\/(info\/refs|git-upload-pack)$/i,
    build: ([, owner, repo, gitPath]) => `https://github.com/${owner}/${repo}.git/${gitPath}` },
  // git clone：带域名时 .git 可省略，不带域名时必须以 .git 结尾（避免误吞任意两段路径）
  { re: /^(?:https?:\/\/)?github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/i,
    build: ([, owner, repo]) => `https://github.com/${owner}/${repo}.git` },
  { re: /^([^\/]+)\/([^\/]+?\.git)$/i,
    build: ([, owner, repo]) => `https://github.com/${owner}/${repo}` }
];

// 解析请求路径，返回 { targetUrl } 或 { status, error }
function resolveTarget(originalUrl) {
  // 完整链接式：域名后直接拼完整 GitHub 链接
  if (/^https?:\/?\/?/i.test(originalUrl)) {
    return { targetUrl: fixUrl(originalUrl) };
  }

  let path = originalUrl;
  if (config.prefix && path.startsWith(config.prefix)) {
    path = path.slice(config.prefix.length).replace(/^\//, '');
  }

  for (const matcher of MATCHERS) {
    const match = path.match(matcher.re);
    if (match) {
      return { targetUrl: matcher.build(match) };
    }
  }

  // 直接输入的 release 下载路径（owner/repo/releases/download/tag/file）
  const directMatch = path.match(/^([^\/]+)\/([^\/]+)\/(.+)$/i);
  if (directMatch && directMatch[3].startsWith('releases/download/')) {
    return { targetUrl: `https://github.com/${path}` };
  }

  return { status: 404, error: 'Not Found: Invalid path format' };
}

// ---------- 上游请求与响应回传 ----------
function textResponse(status, message) {
  return new Response(message + '\n', {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

function buildContentDisposition(filename) {
  if (/^[\x20-\x7e]+$/.test(filename)) {
    return `attachment; filename="${filename.replace(/"/g, '')}"`;
  }
  return `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

function pickFilename(response, finalUrl) {
  let filename = '';
  try {
    const disposition = response.headers.get('content-disposition') || '';
    const starMatch = disposition.match(/filename\*=(?:UTF-8|utf-8)''([^;]+)/i);
    const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
    filename = (starMatch && starMatch[1]) || (plainMatch && plainMatch[1]) || '';
    if (filename) {
      try { filename = decodeURIComponent(filename.trim()); } catch { /* 保留原值 */ }
    }
    if (!filename) {
      filename = decodeURIComponent(new URL(finalUrl).pathname.split('/').pop().split('?')[0] || '');
    }
  } catch {
    // 文件名提取失败不影响转发
  }
  return filename;
}

function buildResponseHeaders(response, finalUrl) {
  const headers = new Headers();

  response.headers.forEach((value, key) => {
    if (SKIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) return;
    try { headers.append(key, value); } catch { /* 忽略无法设置的头 */ }
  });
  if (typeof response.headers.getSetCookie === 'function') {
    for (const cookie of response.headers.getSetCookie()) {
      try { headers.append('Set-Cookie', cookie); } catch { /* 忽略 */ }
    }
  }

  const contentType = response.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);

  const filename = pickFilename(response, finalUrl);
  const isDownload = finalUrl.includes('/releases/download/')
    || finalUrl.includes('/archive/')
    || ATTACHMENT_EXT_RE.test(filename);
  if (filename && isDownload) {
    headers.set('Content-Disposition', buildContentDisposition(filename));
  }

  // raw/gist 等小文本允许边缘缓存，大文件流不缓存
  let host = '';
  try { host = new URL(finalUrl).hostname; } catch { /* ignore */ }
  if (response.status === 200 && !isDownload && host.endsWith('githubusercontent.com')
    && /^(text\/|application\/json)/.test(contentType)) {
    headers.set('Cache-Control', 'public, max-age=0, s-maxage=300');
  }

  return headers;
}

async function forward(request, targetUrl) {
  let method = request.method;
  let body = null;
  if (BODY_METHODS.has(method)) {
    // 平台请求体上限 4.5MB，git 智能协议的 POST 请求体远小于该值
    body = await request.arrayBuffer();
  }

  const baseHeaders = new Headers({ 'user-agent': DEFAULT_UA });
  for (const header of FORWARD_REQUEST_HEADERS) {
    const value = request.headers.get(header);
    if (value !== null) baseHeaders.set(header, value);
  }

  let currentUrl = targetUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let url;
    try {
      url = new URL(currentUrl);
    } catch {
      return textResponse(400, 'Bad Request: invalid upstream URL');
    }
    if (!UPSTREAM_HOSTS.has(url.hostname)) {
      return textResponse(403, 'Forbidden: upstream host not allowed');
    }

    const headers = new Headers(baseHeaders);
    if (config.githubToken && TOKEN_HOSTS.has(url.hostname)) {
      headers.set('authorization', `token ${config.githubToken}`);
    }

    // 超时只约束响应头阶段，正文流不设时限（Edge 为首字节 25 秒、流式最长 300 秒）
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), UPSTREAM_HEADER_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(url.href, {
        method,
        headers,
        body,
        redirect: 'manual',
        signal: controller.signal
      });
    } catch (error) {
      clearTimeout(timer);
      if (controller.signal.aborted) {
        return textResponse(504, 'Gateway Timeout: upstream did not respond in time');
      }
      return textResponse(502, `Bad Gateway: upstream request failed (${error.message})`);
    }
    clearTimeout(timer);

    if (REDIRECT_STATUSES.has(response.status)) {
      const location = response.headers.get('location');
      if (location) {
        try { if (response.body) await response.body.cancel(); } catch { /* 忽略 */ }
        currentUrl = new URL(location, url.href).href;
        if (response.status === 303 && method !== 'HEAD') {
          method = 'GET';
          body = null;
        }
        continue;
      }
    }

    return new Response(response.body, {
      status: response.status,
      headers: buildResponseHeaders(response, url.href)
    });
  }

  return textResponse(502, 'Bad Gateway: too many redirects');
}

// ---------- 主处理入口 ----------
export async function handle(request) {
  try {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;
    const originalUrl = pathname.substring(1);
    const search = url.search;

    if (isBot(request.headers.get('user-agent'))) {
      return textResponse(403, 'Forbidden');
    }
    if (!checkRateLimit(request)) {
      return textResponse(429, 'Too Many Requests');
    }

    if (pathname === '/' || pathname === '') {
      if (config.redirectUrl) {
        return new Response(null, {
          status: 302,
          headers: { Location: config.redirectUrl }
        });
      }
      return new Response(config.disguiseUrl ? disguisedHtml : homeHtml, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    if (pathname === '/favicon.ico') {
      return new Response(null, { status: 204 });
    }

    const resolved = resolveTarget(originalUrl);
    if (resolved.error) {
      return textResponse(resolved.status, resolved.error);
    }
    const targetUrl = resolved.targetUrl + (search && !resolved.targetUrl.includes('?') ? search : '');

    // 上游域名白名单：只允许 GitHub 系域名
    if (!isAllowedUrl(targetUrl)) {
      return textResponse(403, 'Forbidden: Only GitHub URLs are allowed');
    }

    // owner 白名单
    if (!isOwnerAllowed(extractOwner(targetUrl))) {
      return textResponse(403, 'Forbidden: Repository not in whitelist');
    }

    return await forward(request, targetUrl);
  } catch (error) {
    console.error('Unhandled error:', error);
    return textResponse(500, 'Internal Server Error');
  }
}
