// Vercel Node.js Runtime 入口（Fluid 计算默认启用）：
// Node req/res 与 Web 标准 Request/Response 的桥接，全部代理逻辑在 lib/proxy.js
import { Readable } from 'node:stream';
import { handle } from '../lib/proxy.js';

const SKIPPED_REQUEST_HEADERS = new Set(['host', 'connection', 'content-length', 'transfer-encoding']);
const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export default async function handler(req, res) {
  try {
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (!SKIPPED_REQUEST_HEADERS.has(key)) headers[key] = value;
    }
    const request = new Request(`http://${req.headers.host || 'localhost'}${req.url}`, {
      method: req.method,
      headers,
      body: BODY_METHODS.has(req.method) ? Readable.toWeb(req) : undefined,
      duplex: 'half'
    });
    const response = await handle(request);

    response.headers.forEach((value, key) => {
      try { res.appendHeader(key, value); } catch {
        try { res.setHeader(key, value); } catch { /* 忽略无法设置的头 */ }
      }
    });
    res.statusCode = response.status;

    if (response.body) {
      const stream = Readable.fromWeb(response.body);
      stream.on('error', err => {
        console.error('Response stream error:', err.message);
        res.destroy(err);
      });
      res.on('close', () => {
        if (!res.writableEnded) stream.destroy();
      });
      stream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Unhandled error:', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Internal Server Error\n');
    } else {
      res.destroy();
    }
  }
}
