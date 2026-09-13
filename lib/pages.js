// 页面模板：加速首页（报纸风格，全行内 CSS） + 主页伪装页
export const homeHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>GitHub 文件加速</title>
</head>
<body style="margin:0;padding:36px 16px;min-height:100vh;box-sizing:border-box;background-color:#f3edde;background-image:radial-gradient(circle at 10% 14%, rgba(176,141,62,0.16) 0px, rgba(176,141,62,0) 34%),radial-gradient(circle at 90% 86%, rgba(140,47,36,0.10) 0px, rgba(140,47,36,0) 40%),repeating-linear-gradient(0deg, rgba(120,100,60,0.05) 0px, rgba(120,100,60,0.05) 1px, transparent 1px, transparent 26px);font-family:-apple-system,'Segoe UI','Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif;color:#2b2620;display:flex;justify-content:center;align-items:flex-start;">
  <main style="position:relative;width:100%;max-width:880px;background-color:#fffdf6;border:1px solid #d9cdb4;box-shadow:0 10px 30px rgba(90,70,40,0.16),0 2px 6px rgba(90,70,40,0.08);padding:34px 46px 36px;box-sizing:border-box;overflow:hidden;">
    <div style="position:absolute;top:10px;left:10px;right:10px;bottom:10px;border:1px solid rgba(140,47,36,0.22);pointer-events:none;"></div>
    <div style="position:absolute;top:7px;left:7px;width:7px;height:7px;background-color:#8c2f24;transform:rotate(45deg);pointer-events:none;"></div>
    <div style="position:absolute;top:7px;right:7px;width:7px;height:7px;background-color:#8c2f24;transform:rotate(45deg);pointer-events:none;"></div>
    <div style="position:absolute;bottom:7px;left:7px;width:7px;height:7px;background-color:#8c2f24;transform:rotate(45deg);pointer-events:none;"></div>
    <div style="position:absolute;bottom:7px;right:7px;width:7px;height:7px;background-color:#8c2f24;transform:rotate(45deg);pointer-events:none;"></div>
    <div style="position:absolute;right:-16px;bottom:110px;font-family:Georgia,'Times New Roman',serif;font-size:180px;line-height:1;color:rgba(140,47,36,0.05);transform:rotate(-12deg);pointer-events:none;">G</div>

    <header style="text-align:center;position:relative;">
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;letter-spacing:2px;color:#8a7d68;">
        <span>VERCEL GITHUB PROXY</span>
        <span id="dateline">···</span>
        <span>SERVERLESS · STREAMING</span>
      </div>
      <div style="height:5px;border-top:2px solid #2b2620;border-bottom:1px solid #2b2620;margin-top:10px;"></div>
      <h1 style="font-family:Georgia,'Times New Roman','Noto Serif SC',serif;font-weight:700;font-size:clamp(30px, 8.5vw, 46px);letter-spacing:2px;color:#2b2620;margin:24px 0 8px;">GitHub <span style="white-space:nowrap;">文件加速</span></h1>
      <div style="font-size:12.5px;letter-spacing:3px;color:#8c2f24;margin-bottom:16px;">RELEASE · ARCHIVE · RAW · BLOB · GIST · GIT CLONE</div>
      <div style="height:5px;border-top:1px solid #2b2620;border-bottom:2px solid #2b2620;"></div>
    </header>

    <p style="text-align:center;max-width:640px;margin:22px auto 0;font-size:14.5px;line-height:2;color:#5d5344;">在域名后拼接完整 GitHub 链接，即可加速下载 Release 附件、源码压缩包与项目文件；亦支持简化路径与 git 克隆。响应全程流式转发，支持 Range 断点续传，生成的加速链接可直接交给下载工具使用。</p>

    <form onsubmit="toSubmit(event)" style="display:flex;max-width:640px;margin:24px auto 0;position:relative;">
      <input type="text" name="q" placeholder="请输入 GitHub 文件链接，如 github.com/owner/repo/releases/download/v1.0/file.zip" pattern="^((https|http)://)?(github\\.com/[^/]+/[^/]+(/(releases|archive|blob|raw|suites|info)/.+)?|((?:raw|gist)\\.(?:githubusercontent|github)\\.com)/.+)$" required style="flex:1;min-width:0;height:50px;box-sizing:border-box;padding:0 16px;font-size:14px;color:#2b2620;background-color:#fffef9;border:1px solid #c9b992;border-right:none;outline:none;">
      <button type="submit" style="height:50px;padding:0 24px;background-color:#8c2f24;color:#fdf7ea;border:1px solid #8c2f24;font-size:14px;letter-spacing:4px;cursor:pointer;font-family:Georgia,'Times New Roman','Noto Serif SC',serif;">转 换</button>
    </form>
    <p style="text-align:center;margin:12px 0 0;font-size:12px;color:#8a7d68;">✨ 支持带协议头或不带的完整链接，也可直接粘贴简化路径　·　⚠️ 暂不支持文件夹下载</p>

    <div id="result" hidden style="max-width:640px;margin:18px auto 0;border:1px solid #d9cdb4;background-color:#f8f2e3;padding:14px 18px;position:relative;">
      <div style="font-size:12px;letter-spacing:2px;color:#8c2f24;margin-bottom:8px;">加速链接已生成 · READY</div>
      <div id="resultUrl" style="font-family:Consolas,Menlo,monospace;font-size:12.5px;color:#2b2620;word-break:break-all;line-height:1.7;margin-bottom:12px;"></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button type="button" onclick="copyResult()" style="padding:7px 16px;background-color:#8c2f24;color:#fdf7ea;border:1px solid #8c2f24;font-size:12.5px;cursor:pointer;letter-spacing:1px;">复制链接</button>
        <a id="resultOpen" href="#" target="_blank" rel="noopener" style="padding:7px 16px;border:1px solid #8c2f24;color:#8c2f24;font-size:12.5px;text-decoration:none;letter-spacing:1px;background-color:transparent;">打开下载</a>
      </div>
    </div>

    <h2 style="display:flex;align-items:center;gap:14px;margin:36px 0 16px;font-family:Georgia,'Times New Roman','Noto Serif SC',serif;font-size:20px;letter-spacing:2px;color:#2b2620;"><span style="flex:1;height:1px;background-color:#d9cdb4;"></span>使用方法<span style="flex:1;height:1px;background-color:#d9cdb4;"></span></h2>
    <section style="display:flex;flex-wrap:wrap;">
      <div style="flex:1 1 300px;box-sizing:border-box;padding:0 20px 0 0;">
        <h3 style="margin:0 0 8px;font-family:Georgia,'Times New Roman','Noto Serif SC',serif;font-size:15.5px;color:#8c2f24;">方法一 · 完整链接式（推荐）</h3>
        <p style="margin:0 0 10px;font-size:13px;line-height:1.9;color:#5d5344;">在域名后直接拼接完整的 GitHub 链接，与 CF-Workers-GitHub 用法完全兼容，迁移零成本。</p>
        <div style="font-family:Consolas,Menlo,monospace;font-size:12px;line-height:1.7;background-color:#f7f1e3;border:1px solid #e0d3b6;padding:10px 12px;color:#4a4234;word-break:break-all;">https://your-domain.com/https://github.com/owner/repo/releases/download/v1.0/file.zip</div>
      </div>
      <div style="flex:none;width:1px;background-color:#e2d7bf;"></div>
      <div style="flex:1 1 300px;box-sizing:border-box;padding:0 0 0 20px;">
        <h3 style="margin:0 0 8px;font-family:Georgia,'Times New Roman','Noto Serif SC',serif;font-size:15.5px;color:#8c2f24;">方法二 · 简化路径式</h3>
        <p style="margin:0 0 10px;font-size:13px;line-height:1.9;color:#5d5344;">省略协议与域名，仅保留仓库路径，链接更短，便于记录与分享。</p>
        <div style="font-family:Consolas,Menlo,monospace;font-size:12px;line-height:1.7;background-color:#f7f1e3;border:1px solid #e0d3b6;padding:10px 12px;color:#4a4234;word-break:break-all;">https://your-domain.com/owner/repo/releases/download/v1.0/file.zip</div>
      </div>
    </section>

    <h2 style="display:flex;align-items:center;gap:14px;margin:36px 0 16px;font-family:Georgia,'Times New Roman','Noto Serif SC',serif;font-size:20px;letter-spacing:2px;color:#2b2620;"><span style="flex:1;height:1px;background-color:#d9cdb4;"></span>支持类型<span style="flex:1;height:1px;background-color:#d9cdb4;"></span></h2>
    <section style="display:flex;flex-wrap:wrap;gap:12px;">
      <div style="flex:1 1 250px;box-sizing:border-box;border:1px solid #e2d7bf;background-color:#fbf6ea;padding:12px 14px;display:flex;gap:10px;align-items:flex-start;">
        <span style="flex:none;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(140,47,36,0.35);border-radius:50%;color:#8c2f24;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"></path><path d="M4 7.5l8 4.5 8-4.5M12 12v9"></path></svg></span>
        <div style="min-width:0;"><div style="font-size:13.5px;font-weight:600;color:#2b2620;">Release 附件</div><div style="font-size:12px;color:#6b6154;line-height:1.6;margin-top:2px;">发布页构建产物直链下载</div></div>
      </div>
      <div style="flex:1 1 250px;box-sizing:border-box;border:1px solid #e2d7bf;background-color:#fbf6ea;padding:12px 14px;display:flex;gap:10px;align-items:flex-start;">
        <span style="flex:none;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(140,47,36,0.35);border-radius:50%;color:#8c2f24;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="5"></rect><path d="M6 9v10h12V9M10 13h4"></path></svg></span>
        <div style="min-width:0;"><div style="font-size:13.5px;font-weight:600;color:#2b2620;">源码压缩包</div><div style="font-size:12px;color:#6b6154;line-height:1.6;margin-top:2px;">分支与标签打包 zip / tar.gz</div></div>
      </div>
      <div style="flex:1 1 250px;box-sizing:border-box;border:1px solid #e2d7bf;background-color:#fbf6ea;padding:12px 14px;display:flex;gap:10px;align-items:flex-start;">
        <span style="flex:none;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(140,47,36,0.35);border-radius:50%;color:#8c2f24;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l4 4v14H7z"></path><path d="M14 3v4h4M10 12h5M10 16h5"></path></svg></span>
        <div style="min-width:0;"><div style="font-size:13.5px;font-weight:600;color:#2b2620;">项目文件</div><div style="font-size:12px;color:#6b6154;line-height:1.6;margin-top:2px;">raw / blob 任意分支与提交</div></div>
      </div>
      <div style="flex:1 1 250px;box-sizing:border-box;border:1px solid #e2d7bf;background-color:#fbf6ea;padding:12px 14px;display:flex;gap:10px;align-items:flex-start;">
        <span style="flex:none;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(140,47,36,0.35);border-radius:50%;color:#8c2f24;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 8l-4 4 4 4M15 8l4 4-4 4"></path></svg></span>
        <div style="min-width:0;"><div style="font-size:13.5px;font-weight:600;color:#2b2620;">Gist 片段</div><div style="font-size:12px;color:#6b6154;line-height:1.6;margin-top:2px;">代码片段与脚本直读</div></div>
      </div>
      <div style="flex:1 1 250px;box-sizing:border-box;border:1px solid #e2d7bf;background-color:#fbf6ea;padding:12px 14px;display:flex;gap:10px;align-items:flex-start;">
        <span style="flex:none;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(140,47,36,0.35);border-radius:50%;color:#8c2f24;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.2"></circle><circle cx="6" cy="18" r="2.2"></circle><circle cx="18" cy="7" r="2.2"></circle><path d="M6 8.2v7.6M18 9.2c0 4.5-5 4-9.3 4.9"></path></svg></span>
        <div style="min-width:0;"><div style="font-size:13.5px;font-weight:600;color:#2b2620;">Git 克隆</div><div style="font-size:12px;color:#6b6154;line-height:1.6;margin-top:2px;">智能协议全量透传</div></div>
      </div>
      <div style="flex:1 1 250px;box-sizing:border-box;border:1px solid #e2d7bf;background-color:#fbf6ea;padding:12px 14px;display:flex;gap:10px;align-items:flex-start;">
        <span style="flex:none;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(140,47,36,0.35);border-radius:50%;color:#8c2f24;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12l-8 8-9-9V4h7z"></path><circle cx="7.5" cy="7.5" r="1.3"></circle></svg></span>
        <div style="min-width:0;"><div style="font-size:13.5px;font-weight:600;color:#2b2620;">Release 页面</div><div style="font-size:12px;color:#6b6154;line-height:1.6;margin-top:2px;">发布页 HTML 直读</div></div>
      </div>
    </section>

    <h2 style="display:flex;align-items:center;gap:14px;margin:36px 0 16px;font-family:Georgia,'Times New Roman','Noto Serif SC',serif;font-size:20px;letter-spacing:2px;color:#2b2620;"><span style="flex:1;height:1px;background-color:#d9cdb4;"></span>样例 · 合法输入<span style="flex:1;height:1px;background-color:#d9cdb4;"></span></h2>
    <div style="border:1px dashed #c9b992;background-color:#faf4e6;padding:16px 20px;font-family:Consolas,Menlo,monospace;font-size:12.5px;line-height:2.1;color:#4a4234;word-break:break-all;">
      <div><span style="color:#8c2f24;">Release 文件</span>　(https://)github.com/owner/repo/releases/download/v1.0/example.zip</div>
      <div><span style="color:#8c2f24;">Release 源码</span>　(https://)github.com/owner/repo/archive/v0.1.0.tar.gz</div>
      <div><span style="color:#8c2f24;">分支源码</span>　　(https://)github.com/owner/repo/archive/master.zip</div>
      <div><span style="color:#8c2f24;">项目文件</span>　　(https://)github.com/owner/repo/blob/main/README.md</div>
      <div><span style="color:#8c2f24;">Gist 片段</span>　　(https://)gist.githubusercontent.com/user/id/raw/cmd.py</div>
      <div><span style="color:#8c2f24;">Git 克隆</span>　　 (https://)github.com/owner/repo.git</div>
    </div>

    <h2 style="display:flex;align-items:center;gap:14px;margin:36px 0 16px;font-family:Georgia,'Times New Roman','Noto Serif SC',serif;font-size:20px;letter-spacing:2px;color:#2b2620;"><span style="flex:1;height:1px;background-color:#d9cdb4;"></span>服务公告<span style="flex:1;height:1px;background-color:#d9cdb4;"></span></h2>
    <section style="display:flex;flex-wrap:wrap;">
      <div style="flex:1 1 300px;box-sizing:border-box;padding:0 20px 0 0;">
        <h3 style="margin:0 0 10px;font-family:Georgia,'Times New Roman','Noto Serif SC',serif;font-size:15.5px;color:#2b2620;border-bottom:1px solid #e2d7bf;padding-bottom:8px;">平台限制</h3>
        <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.9;color:#5d5344;">
          <li style="margin-bottom:8px;">单次流式响应最长 300 秒，超大文件请配合断点续传</li>
          <li style="margin-bottom:8px;">请求体上限 4.5 MB，不影响下载方向</li>
          <li>raw / gist 小文本附 5 分钟边缘缓存</li>
        </ul>
      </div>
      <div style="flex:none;width:1px;background-color:#e2d7bf;"></div>
      <div style="flex:1 1 300px;box-sizing:border-box;padding:0 0 0 20px;">
        <h3 style="margin:0 0 10px;font-family:Georgia,'Times New Roman','Noto Serif SC',serif;font-size:15.5px;color:#2b2620;border-bottom:1px solid #e2d7bf;padding-bottom:8px;">安全说明</h3>
        <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.9;color:#5d5344;">
          <li style="margin-bottom:8px;">仅代理 GitHub 系域名，拒绝充当开放代理</li>
          <li style="margin-bottom:8px;">访问令牌不随重定向发往签名地址</li>
          <li>爬虫自动屏蔽，可选按 IP 限速</li>
        </ul>
      </div>
    </section>

    <div style="display:flex;align-items:center;gap:12px;margin:32px 0 0;color:#b08d3e;">
      <span style="flex:1;height:1px;background-color:#d9cdb4;"></span>
      <span style="font-size:18px;line-height:1;">❦</span>
      <span style="flex:1;height:1px;background-color:#d9cdb4;"></span>
    </div>

    <footer style="margin-top:18px;">
      <div style="text-align:center;font-size:12px;letter-spacing:3px;color:#8a7d68;margin-bottom:10px;">参考链接 · REFERENCES</div>
      <ul style="list-style:none;margin:0;padding:0;text-align:center;font-size:12.5px;line-height:2.2;color:#5d5344;">
        <li><a href="https://github.com/ekishion/vercel-github-proxy" style="color:#8c2f24;text-decoration:none;border-bottom:1px solid rgba(140,47,36,0.4);">项目文档 · README</a></li>
        <li><a href="https://vercel.com" style="color:#8c2f24;text-decoration:none;border-bottom:1px solid rgba(140,47,36,0.4);">Vercel 平台</a>　·　<a href="https://vercel.com/docs/functions" style="color:#8c2f24;text-decoration:none;border-bottom:1px solid rgba(140,47,36,0.4);">Vercel Functions 文档</a></li>
      </ul>
      <div style="text-align:center;margin-top:14px;padding-top:12px;border-top:1px solid #e2d7bf;font-size:11.5px;letter-spacing:1px;color:#8a7d68;">Powered by Vercel Functions · 流式转发 · 断点续传 · 开源自托管</div>
    </footer>
  </main>
  <script>
    document.getElementById('dateline').textContent = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    function toSubmit(e) {
      e.preventDefault();
      const input = document.getElementsByName('q')[0];
      const value = input.value.trim();
      if (!value) return;
      const proxied = location.origin + '/' + value;
      document.getElementById('resultUrl').textContent = proxied;
      document.getElementById('resultOpen').href = proxied;
      const result = document.getElementById('result');
      result.hidden = false;
      result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    function copyResult() {
      const text = document.getElementById('resultUrl').textContent;
      const done = function () {
        const btn = document.querySelector('#result button');
        const original = btn.textContent;
        btn.textContent = '✅ 已复制';
        setTimeout(function () { btn.textContent = original; }, 1500);
      };
      const fallback = function () {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (err) {}
        ta.remove();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else {
        fallback();
      }
    }
  </script>
</body>
</html>`;

// 维护模式页面：MAINTENANCE 环境变量开启时整站返回
export const maintenanceHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>服务维护中 · 503</title>
</head>
<body style="margin:0;padding:24px 16px;min-height:100vh;box-sizing:border-box;background-color:#f3edde;background-image:radial-gradient(circle at 12% 18%, rgba(176,141,62,0.16) 0px, rgba(176,141,62,0) 34%),radial-gradient(circle at 88% 82%, rgba(140,47,36,0.10) 0px, rgba(140,47,36,0) 40%),repeating-linear-gradient(0deg, rgba(120,100,60,0.05) 0px, rgba(120,100,60,0.05) 1px, transparent 1px, transparent 26px);font-family:-apple-system,'Segoe UI','Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif;color:#2b2620;display:flex;justify-content:center;align-items:center;">
  <main style="position:relative;width:100%;max-width:520px;background-color:#fffdf6;border:1px solid #d9cdb4;box-shadow:0 10px 30px rgba(90,70,40,0.16),0 2px 6px rgba(90,70,40,0.08);padding:42px 36px 30px;text-align:center;box-sizing:border-box;">
    <div style="position:absolute;top:8px;left:8px;right:8px;bottom:8px;border:1px solid rgba(140,47,36,0.22);pointer-events:none;"></div>
    <div style="position:absolute;top:5px;left:5px;width:6px;height:6px;background-color:#8c2f24;transform:rotate(45deg);"></div>
    <div style="position:absolute;top:5px;right:5px;width:6px;height:6px;background-color:#8c2f24;transform:rotate(45deg);"></div>
    <div style="position:absolute;bottom:5px;left:5px;width:6px;height:6px;background-color:#8c2f24;transform:rotate(45deg);"></div>
    <div style="position:absolute;bottom:5px;right:5px;width:6px;height:6px;background-color:#8c2f24;transform:rotate(45deg);"></div>
    <div style="font-size:11px;letter-spacing:3px;color:#8a7d68;">SERVICE NOTICE · 503</div>
    <h1 style="font-family:Georgia,'Times New Roman','Noto Serif SC',serif;font-size:30px;letter-spacing:2px;color:#2b2620;margin:16px 0 12px;">服务维护中</h1>
    <div style="display:flex;align-items:center;gap:10px;color:#b08d3e;margin-bottom:16px;"><span style="flex:1;height:1px;background-color:#d9cdb4;"></span><span style="font-size:15px;line-height:1;">❦</span><span style="flex:1;height:1px;background-color:#d9cdb4;"></span></div>
    <p style="font-size:14px;line-height:2.1;color:#5d5344;margin:0 0 18px;">服务正在升级维护，暂停访问。<br>维护完成后即可恢复正常使用，感谢理解。</p>
    <div style="padding-top:14px;border-top:1px solid #e2d7bf;font-size:11.5px;letter-spacing:1px;color:#8a7d68;">Maintenance in progress · Please check back later</div>
  </main>
</body>
</html>`;

// 主页伪装页：看起来像一台 nginx 服务器的 404 页面（与首页一致，全行内 CSS）
export const disguisedHtml = `<!DOCTYPE html>
<html>
<head>
<title>404 Not Found</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family:Tahoma,Arial,sans-serif;margin:0;padding:30px;background-color:#f0f0f0;color:#333;">
  <div style="max-width:600px;margin:0 auto;background-color:#fff;padding:30px;border-radius:5px;box-shadow:0 2px 5px rgba(0,0,0,0.1);">
    <h1 style="font-size:24px;margin:0 0 20px;">404 Not Found</h1>
    <p style="margin:10px 0;">The requested URL was not found on this server.</p>
    <hr style="border:0;border-top:1px solid #ccc;margin:20px 0;">
    <p style="margin:10px 0;">nginx/1.18.0</p>
  </div>
</body>
</html>`;
