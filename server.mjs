import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { timingSafeEqual, createHash } from "node:crypto";
import { validatePlan, metrics } from "./public/planner.js";
import { planWithAI } from "./lib/ai.mjs";
const root = new URL("./", import.meta.url);
export const store = JSON.parse(await readFile(new URL("data/store.json", root), "utf8"));
validatePlan(store, store.current);
validatePlan(store, store.proposal);
const html = await readFile(new URL("public/index.html", root), "utf8");
const importmap = html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1];
const hash = createHash("sha256").update(importmap).digest("base64");
const files = new Map([
  ["/assets/sign-font.json", ["public/assets/sign-font.json", "application/json"]],
  [
    "/vendor/loaders/FontLoader.js",
    ["node_modules/three/examples/jsm/loaders/FontLoader.js", "text/javascript"],
  ],
  ["/", ["public/index.html", "text/html; charset=utf-8"]],
  ...["app.js", "planner.js", "scene-factory.js", "style.css"].map((f) => [
    "/" + f,
    ["public/" + f, f.endsWith(".css") ? "text/css" : "text/javascript"],
  ]),
  ["/vendor/three.module.js", ["node_modules/three/build/three.module.js", "text/javascript"]],
  ["/vendor/three.core.js", ["node_modules/three/build/three.core.js", "text/javascript"]],
  [
    "/vendor/OrbitControls.js",
    ["node_modules/three/examples/jsm/controls/OrbitControls.js", "text/javascript"],
  ],
  [
    "/vendor/GLTFExporter.js",
    ["node_modules/three/examples/jsm/exporters/GLTFExporter.js", "text/javascript"],
  ],
  [
    "/vendor/utils/TextureUtils.js",
    ["node_modules/three/examples/jsm/utils/TextureUtils.js", "text/javascript"],
  ],
  ["/assets/current.glb", ["public/assets/current.glb", "model/gltf-binary"]],
  ["/assets/ai-layout.glb", ["public/assets/ai-layout.glb", "model/gltf-binary"]],
]);
function sameToken(value, expected) {
  const a = Buffer.from(value || ""),
    b = Buffer.from(expected || "");
  return a.length === b.length && timingSafeEqual(a, b);
}
async function body(req) {
  let size = 0,
    chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 4096) throw Object.assign(Error("Request is too large."), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    throw Object.assign(Error("Invalid JSON."), { status: 400 });
  }
}
export function createApp(config = {}, fetchImpl = fetch) {
  const mode = config.mode || "demo";
  let busy = false,
    nextCall = 0;
  if (!["demo", "openai"].includes(mode)) throw Error("AI_MODE must be demo or openai.");
  if (mode === "openai" && (!config.key || !config.token || config.token.length < 32))
    throw Error("Live mode requires OPENAI_API_KEY and a PLANNER_TOKEN of at least 32 characters.");
  return http.createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader(
      "Content-Security-Policy",
      `default-src 'self'; script-src 'self' 'sha256-${hash}'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'`,
    );
    const json = (status, data) => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    };
    try {
      const url = new URL(req.url, "http://localhost");
      if (req.method === "GET" && url.pathname === "/api/store")
        return json(200, { store, mode, model: config.model || "gpt-6-astra" });
      if (req.method === "POST" && url.pathname === "/api/plan") {
        if (
          req.headers.origin &&
          req.headers.origin !== `http://${req.headers.host}` &&
          req.headers.origin !== `https://${req.headers.host}`
        )
          return json(403, { error: "Origin is not allowed." });
        if (!String(req.headers["content-type"] || "").startsWith("application/json"))
          return json(415, { error: "Send application/json." });
        if (mode === "openai" && !sameToken(req.headers.authorization, `Bearer ${config.token}`))
          return json(401, { error: "Enter the planner access token." });
        const input = await body(req);
        if (typeof input.goal !== "string" || !input.goal.trim() || input.goal.length > 1200)
          return json(400, { error: "Write a goal of 1–1200 characters." });
        if (mode === "demo")
          return json(200, {
            plan: store.proposal,
            source: "sample",
            metrics: metrics(store, store.proposal),
          });
        if (busy || Date.now() < nextCall)
          return json(429, { error: "Please wait before requesting another paid layout." });
        busy = true;
        nextCall = Date.now() + 30000;
        try {
          const plan = await planWithAI(store, input.goal, config, fetchImpl);
          return json(200, { plan, source: "live", metrics: metrics(store, plan) });
        } catch {
          return json(502, {
            error:
              "Live planning failed or returned an invalid layout. The previous layout has been kept. Check model access and server configuration.",
          });
        } finally {
          busy = false;
        }
      }
      const target = files.get(url.pathname);
      if (req.method === "GET" && target) {
        const bytes = await readFile(new URL(target[0], root));
        res.writeHead(200, { "Content-Type": target[1] });
        return res.end(bytes);
      }
      json(404, { error: "Not found." });
    } catch (e) {
      json(e.status || 500, { error: e.status ? e.message : "Unable to complete request." });
    }
  });
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const host = process.env.HOST || "127.0.0.1",
    port = Number(process.env.PORT || 3014);
  const app = createApp({
    mode: process.env.AI_MODE || "demo",
    model: process.env.OPENAI_MODEL || "gpt-6-astra",
    key: process.env.OPENAI_API_KEY,
    token: process.env.PLANNER_TOKEN,
  });
  app.listen(port, host, () => console.log(`Retail concept planner: http://${host}:${port}`));
}
