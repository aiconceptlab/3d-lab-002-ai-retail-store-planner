import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validatePlan, metrics, canStand, footprints, movePosition } from "../public/planner.js";
import { planWithAI } from "../lib/ai.mjs";
import { createApp, store } from "../server.mjs";
import { Box3 } from "three";
import { buildStore } from "../public/scene-factory.js";
const clone = (x) => structuredClone(x);
test("detailed merchandise and equipment fit the validated floor footprints", () => {
  for (const plan of [store.current, store.proposal]) {
    const scene = buildStore(store, plan);
    for (const f of footprints(store, plan)) {
      const bounds = new Box3().setFromObject(scene.getObjectByName(f.id));
      assert.ok(
        bounds.min.x >= f.x - f.w / 2 - 1e-5 && bounds.max.x <= f.x + f.w / 2 + 1e-5,
        f.id + " width",
      );
      assert.ok(
        bounds.min.z >= f.z - f.d / 2 - 1e-5 && bounds.max.z <= f.z + f.d / 2 + 1e-5,
        f.id + " depth",
      );
    }
  }
});
test("movement substeps stop at displays and room boundaries, including large moves", () => {
  const stopped = movePosition(store, store.proposal, { x: -2.25, z: 4.5 }, 0, 1, 0, 10);
  assert.ok(stopped.z >= 3.45 && stopped.z < 3.55);
  const wall = movePosition(store, store.proposal, { x: 0, z: 4.5 }, 0, 1, 0, 20);
  assert.ok(wall.z >= -4.75 && wall.z < -4.6);
  const tap = movePosition(store, store.proposal, { x: 0, z: 4.5 }, 0, 1, 0, 0.28);
  assert.ok(Math.abs(tap.z - 4.22) < 1e-8);
});
test("current and sample proposal obey geometry constraints", () => {
  for (const p of [store.current, store.proposal])
    assert.doesNotThrow(() => validatePlan(store, p));
  const before = metrics(store, store.current),
    after = metrics(store, store.proposal);
  assert.equal(after.moved, 2);
  assert.equal(after.aisleWidth, 1.5);
  assert.ok(after.coffeeDistance < before.coffeeDistance);
});
test("every permitted movable-bay permutation preserves reserved circulation", () => {
  const bays = ["front-left", "front-right", "rear-left"];
  for (const a of bays)
    for (const b of bays)
      for (const c of bays) {
        if (new Set([a, b, c]).size !== 3) continue;
        const p = clone(store.proposal);
        [a, b, c].forEach((bayId, i) => (p.placements[i].bayId = bayId));
        assert.doesNotThrow(() => validatePlan(store, p));
      }
});
test("reject moved checkout even when swapped with a legitimate fixture", () => {
  const p = clone(store.proposal);
  [p.placements[3].bayId, p.placements[1].bayId] = [p.placements[1].bayId, p.placements[3].bayId];
  assert.throws(() => validatePlan(store, p), /Checkout/);
});
test("reject missing, duplicate and invented objects", () => {
  let p = clone(store.proposal);
  p.placements.pop();
  assert.throws(() => validatePlan(store, p));
  p = clone(store.proposal);
  p.placements[1] = p.placements[0];
  assert.throws(() => validatePlan(store, p));
  p = clone(store.proposal);
  p.placements[0].fixtureId = "secret-new-display";
  assert.throws(() => validatePlan(store, p));
  p = clone(store.proposal);
  p.placements[0].bayId = "street";
  assert.throws(() => validatePlan(store, p));
});
test("reject extra placement fields and occupied bays", () => {
  const p = clone(store.proposal);
  p.placements[0].x = 0;
  assert.throws(() => validatePlan(store, p));
  delete p.placements[0].x;
  p.placements[0].bayId = p.placements[1].bayId;
  assert.throws(() => validatePlan(store, p));
});
test("reject narrow aisles, intrusion and out-of-room fixtures", () => {
  let s = clone(store);
  s.aisles[0].w = 1.49;
  assert.throws(() => validatePlan(s, s.proposal), /narrower/);
  s = clone(store);
  s.bays[0].x = 0;
  assert.throws(() => validatePlan(s, s.proposal), /blocks/);
  s = clone(store);
  s.bays[0].x = -4;
  assert.throws(() => validatePlan(s, s.proposal), /outside/);
});
test("walking respects fixture footprints and walls, central route remains usable", () => {
  for (const p of [store.current, store.proposal]) {
    for (const b of footprints(store, p)) assert.equal(canStand(store, p, b.x, b.z), false);
    for (let z = -4.5; z <= 4.5; z += 0.25) assert.equal(canStand(store, p, 0, z), true);
    assert.equal(canStand(store, p, 4, 0), false);
    assert.equal(canStand(store, p, NaN, 0), false);
  }
});
const complete = (plan) => ({
  ok: true,
  json: async () => ({
    status: "completed",
    output: [
      {
        type: "message",
        role: "assistant",
        content: [{ type: "output_text", text: JSON.stringify(plan) }],
      },
    ],
  }),
});
test("Responses request uses GPT-6 Astra structured output; no automatic retry", async () => {
  let calls = 0;
  const p = await planWithAI(
    store,
    "Expose coffee",
    { key: "test", model: "gpt-6-astra" },
    async (url, init) => {
      calls++;
      assert.equal(url, "https://api.openai.com/v1/responses");
      const b = JSON.parse(init.body);
      assert.equal(b.model, "gpt-6-astra");
      assert.equal(b.store, false);
      assert.equal(b.reasoning.effort, "low");
      assert.equal(b.text.format.strict, true);
      assert.equal(b.text.format.schema.additionalProperties, false);
      return complete(store.proposal);
    },
  );
  assert.equal(calls, 1);
  assert.equal(p.placements.length, 4);
});
test("provider output still has to pass geometry validation", async () => {
  const p = clone(store.proposal);
  p.placements[3].bayId = "rear-left";
  await assert.rejects(planWithAI(store, "coffee", { key: "x" }, async () => complete(p)));
});
test("refusal, incomplete, invalid JSON and provider errors fail closed", async () => {
  for (const result of [
    { ok: false },
    { ok: true, json: async () => ({ status: "incomplete" }) },
    {
      ok: true,
      json: async () => ({
        status: "completed",
        output: [{ type: "message", role: "assistant", content: [{ type: "refusal" }] }],
      }),
    },
    {
      ok: true,
      json: async () => ({
        status: "completed",
        output: [
          {
            type: "message",
            role: "assistant",
            content: [{ type: "output_text", text: "not json" }],
          },
        ],
      }),
    },
  ])
    await assert.rejects(planWithAI(store, "coffee", { key: "x" }, async () => result));
});
test("invalid briefs are rejected before a paid call", async () => {
  for (const goal of ["", null, "x".repeat(1201)])
    await assert.rejects(
      planWithAI(store, goal, {}, () => {
        assert.fail("must not call provider");
      }),
    );
});
async function running(config, fn, provider) {
  const s = createApp(config, provider);
  await new Promise((r) => s.listen(0, "127.0.0.1", r));
  try {
    await fn(`http://127.0.0.1:${s.address().port}`);
  } finally {
    s.closeAllConnections();
    await new Promise((r) => s.close(r));
  }
}
test("HTTP demo is runnable; sample is explicit and credentials/files stay private", async () => {
  await running({}, async (base) => {
    let r = await fetch(base + "/");
    assert.equal(r.status, 200);
    assert.match(r.headers.get("content-security-policy"), /frame-ancestors 'none'/);
    r = await fetch(base + "/api/store");
    assert.equal((await r.json()).mode, "demo");
    for (const path of [
      "/.env",
      "/server.mjs",
      "/package.json",
      "/node_modules/three/package.json",
    ])
      assert.equal((await fetch(base + path)).status, 404);
    r = await fetch(base + "/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal: "coffee" }),
    });
    assert.equal((await r.json()).source, "sample");
    r = await fetch(base + "/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://wrong.example" },
      body: "{}",
    });
    assert.equal(r.status, 403);
  });
});
test("HTTP rejects malformed JSON, oversized input and wrong content type", async () => {
  await running({}, async (base) => {
    for (const [body, status, type] of [
      ["{", 400, "application/json"],
      ["x".repeat(5000), 413, "application/json"],
      ["{}", 415, "text/plain"],
      ["{}", 400, "application/json"],
    ]) {
      const r = await fetch(base + "/api/plan", {
        method: "POST",
        headers: { "Content-Type": type },
        body,
      });
      assert.equal(r.status, status);
    }
  });
});
test("live startup requires secrets; unauthorized requests never call provider", async () => {
  assert.throws(() => createApp({ mode: "openai" }));
  let calls = 0;
  await running(
    { mode: "openai", key: "test", token: "t".repeat(32) },
    async (base) => {
      const r = await fetch(base + "/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: '{"goal":"coffee"}',
      });
      assert.equal(r.status, 401);
      assert.equal(calls, 0);
    },
    async () => {
      calls++;
      return complete(store.proposal);
    },
  );
});
test("live endpoint marks provenance and rate limits subsequent paid calls", async () => {
  let calls = 0;
  const token = "t".repeat(32);
  await running(
    { mode: "openai", model: "gpt-6-astra", key: "test", token },
    async (base) => {
      const init = {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: '{"goal":"coffee"}',
      };
      let r = await fetch(base + "/api/plan", init);
      assert.equal(r.status, 200);
      assert.equal((await r.json()).source, "live");
      r = await fetch(base + "/api/plan", init);
      assert.equal(r.status, 429);
      assert.equal(calls, 1);
    },
    async () => {
      calls++;
      return complete(store.proposal);
    },
  );
});
test("live endpoint rejects an unsafe generated layout", async () => {
  const bad = clone(store.proposal);
  bad.placements[0].bayId = "entrance";
  const token = "t".repeat(32);
  await running(
    { mode: "openai", key: "test", token },
    async (base) => {
      const r = await fetch(base + "/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: '{"goal":"coffee"}',
      });
      assert.equal(r.status, 502);
    },
    async () => complete(bad),
  );
});
test("both exported GLBs contain the fixed checkout and correct movable positions", async () => {
  for (const [file, plan] of [
    ["current", store.current],
    ["ai-layout", store.proposal],
  ]) {
    const b = await readFile(new URL(`../public/assets/${file}.glb`, import.meta.url));
    assert.equal(b.readUInt32LE(0), 0x46546c67);
    assert.equal(b.readUInt32LE(4), 2);
    assert.equal(b.readUInt32LE(8), b.length);
    const json = JSON.parse(b.subarray(20, 20 + b.readUInt32LE(12)).toString());
    for (const f of footprints(store, plan)) {
      const node = json.nodes.find((n) => n.name === f.id);
      assert.ok(node);
      assert.deepEqual(node.translation || node.matrix.slice(12, 15), [f.x, 0, f.z]);
    }
  }
});
test("all five Instagram exports are exactly 1080 by 1350 pixels", async () => {
  for (const name of ["01-cover", "02-comparison", "03-constraints", "04-build", "05-cta"]) {
    const png = await readFile(new URL(`../marketing/instagram-4x5/${name}.png`, import.meta.url));
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.equal(png.readUInt32BE(16), 1080);
    assert.equal(png.readUInt32BE(20), 1350);
  }
});
