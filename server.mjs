import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("./public", import.meta.url)));
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".mp4": "video/mp4",
  ".json": "application/json; charset=utf-8",
};

function resolvePublic(pathname) {
  const decoded = decodeURIComponent(pathname === "/" ? "/index.html" : pathname);
  const target = resolve(join(root, decoded.replace(/^\/+/, "")));
  if (target !== root && !target.startsWith(root + sep)) return null;
  return target;
}

export function createApp() {
  return createServer(async (req, res) => {
    try {
      if (!["GET", "HEAD"].includes(req.method || "")) {
        res.writeHead(405, { Allow: "GET, HEAD" });
        return res.end();
      }
      const url = new URL(req.url || "/", "http://localhost");
      const target = resolvePublic(url.pathname);
      if (!target) {
        res.writeHead(403);
        return res.end("Forbidden");
      }
      const info = await stat(target);
      if (!info.isFile()) throw new Error("Not found");
      const bytes = await readFile(target);
      const range = req.headers.range;
      if (range && extname(target).toLowerCase() === ".mp4") {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        if (!match) {
          res.writeHead(416, { "Content-Range": `bytes */${bytes.length}` });
          return res.end();
        }
        const start = match[1] ? Number(match[1]) : 0;
        const end = match[2] ? Math.min(Number(match[2]), bytes.length - 1) : bytes.length - 1;
        if (start > end || start >= bytes.length) {
          res.writeHead(416, { "Content-Range": `bytes */${bytes.length}` });
          return res.end();
        }
        res.writeHead(206, {
          "Content-Type": "video/mp4",
          "Content-Length": end - start + 1,
          "Content-Range": `bytes ${start}-${end}/${bytes.length}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=3600",
          "X-Content-Type-Options": "nosniff",
        });
        return res.end(req.method === "HEAD" ? undefined : bytes.subarray(start, end + 1));
      }
      const headers = {
        "Content-Type": types[extname(target).toLowerCase()] || "application/octet-stream",
        "Content-Length": bytes.length,
        "Cache-Control": extname(target) === ".html" ? "no-cache" : "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        ...(extname(target).toLowerCase() === ".mp4" ? { "Accept-Ranges": "bytes" } : {}),
      };
      res.writeHead(200, headers);
      res.end(req.method === "HEAD" ? undefined : bytes);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const host = process.env.HOST || "127.0.0.1";
  const port = Number(process.env.PORT || 3014);
  createApp().listen(port, host, () => console.log(`Retail flow simulator: http://${host}:${port}`));
}
