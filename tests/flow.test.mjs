import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { once } from "node:events";
import { createApp } from "../server.mjs";

const root = new URL("../", import.meta.url);

test("public copy states the product flow and its limits", async () => {
  const html = await readFile(new URL("public/index.html", root), "utf8");
  assert.match(html, /Upload a shop/);
  assert.match(html, /Watch people use it/);
  assert.match(html, /AI concept simulation/);
  assert.match(html, /do not measure real footfall/);
});

test("sample images and videos have valid signatures", async () => {
  for (const name of ["current-shop.png", "revised-shop.png"]) {
    const bytes = await readFile(new URL("public/assets/" + name, root));
    assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.ok(bytes.length > 500_000);
  }
  for (const name of ["current-flow.mp4", "revised-flow.mp4"]) {
    const bytes = await readFile(new URL("public/assets/" + name, root));
    assert.equal(bytes.subarray(4, 8).toString("ascii"), "ftyp");
    assert.ok(bytes.length > 1_000_000);
  }
});

test("server serves the app with security headers", async (t) => {
  const server = createApp().listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => server.close());
  const port = server.address().port;
  const response = await fetch(`http://127.0.0.1:${port}/`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /^text\/html/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.match(await response.text(), /AI Retail Flow Simulator/);
});

test("server supports MP4 byte ranges", async (t) => {
  const server = createApp().listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => server.close());
  const port = server.address().port;
  const response = await fetch(`http://127.0.0.1:${port}/assets/current-flow.mp4`, {
    headers: { Range: "bytes=0-99" },
  });
  assert.equal(response.status, 206);
  assert.equal(response.headers.get("accept-ranges"), "bytes");
  assert.match(response.headers.get("content-range"), /^bytes 0-99\//);
  assert.equal((await response.arrayBuffer()).byteLength, 100);
});

test("server rejects writes and escaped paths", async (t) => {
  const server = createApp().listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => server.close());
  const port = server.address().port;
  assert.equal((await fetch(`http://127.0.0.1:${port}/`, { method: "POST" })).status, 405);
  assert.notEqual((await fetch(`http://127.0.0.1:${port}/..%2Fserver.mjs`)).status, 200);
});

test("Instagram exports are all 1080 by 1350 PNGs", async () => {
  for (let i = 1; i <= 5; i++) {
    const names = ["cover", "input", "observation", "rerun", "cta"];
    const file = new URL(`marketing/instagram-4x5/0${i}-${names[i - 1]}.png`, root);
    const bytes = await readFile(file);
    assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(bytes.readUInt32BE(16), 1080);
    assert.equal(bytes.readUInt32BE(20), 1350);
    assert.ok((await stat(file)).size > 20_000);
  }
});
