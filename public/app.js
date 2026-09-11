import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { buildStore } from "./scene-factory.js";
import { footprints, metrics, canStand, validatePlan, movePosition } from "./planner.js";
const $ = (id) => document.getElementById(id);
let config;
try {
  const r = await fetch("/api/store");
  if (!r.ok) throw Error();
  config = await r.json();
} catch {
  $("status").textContent = "The store could not load. Restart the local server and refresh.";
  throw Error("Store unavailable");
}
const { store, mode } = config;
let proposal = store.proposal,
  active = store.current,
  source = "sample",
  which = "current",
  selected = "coffee";
let renderer,
  scene,
  camera,
  controls,
  world,
  aisleGroup,
  walking = false,
  showAisles = false,
  yaw = 0,
  pointer = null;
const keys = new Set();
function text(id, value) {
  $(id).textContent = value;
}
function svgNode(tag, attrs) {
  const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}
function drawPlan() {
  const svg = $("floorplan");
  svg.replaceChildren();
  svg.append(
    svgNode("rect", {
      x: -4,
      y: -5,
      width: 8,
      height: 10,
      fill: "#d4c8b2",
      stroke: "#344e3c",
      "stroke-width": 0.07,
    }),
  );
  for (const a of store.aisles)
    svg.append(
      svgNode("rect", {
        x: a.x - a.w / 2,
        y: a.z - a.d / 2,
        width: a.w,
        height: a.d,
        fill: "#a9d5d2",
        opacity: 0.8,
      }),
    );
  for (const f of footprints(store, active)) {
    svg.append(
      svgNode("rect", {
        x: f.x - f.w / 2,
        y: f.z - f.d / 2,
        width: f.w,
        height: f.d,
        fill: f.color,
        stroke: f.id === selected ? "#fff" : "#263c30",
        "stroke-width": f.id === selected ? 0.12 : 0.03,
      }),
    );
    const t = svgNode("text", {
      x: f.x,
      y: f.z + 0.07,
      "text-anchor": "middle",
      fill: "#fff",
      "font-size": 0.22,
      "font-family": "Arial",
    });
    t.textContent = f.id === "checkout" ? "CHECKOUT" : f.id.toUpperCase();
    svg.append(t);
  }
  const t = svgNode("text", {
    x: 0,
    y: 5.38,
    "text-anchor": "middle",
    fill: "#344e3c",
    "font-size": 0.22,
  });
  t.textContent = "ENTRANCE ↑ · 1.5 m CLEAR ROUTE";
  svg.append(t);
}
function inspect(id) {
  selected = id;
  const f = footprints(store, active).find((f) => f.id === id);
  text("fixture-title", f.label);
  text(
    "fixture-info",
    `${f.fixed ? "Fixed position" : f.margin + " margin category"} · ${f.w.toFixed(1)} × ${f.d.toFixed(1)} m footprint · ${f.bayId.replaceAll("-", " ")} bay.`,
  );
  for (const b of $("fixture-list").children) b.setAttribute("aria-pressed", b.dataset.id === id);
  drawPlan();
}
for (const f of store.fixtures) {
  const b = document.createElement("button");
  b.textContent = f.label;
  b.dataset.id = f.id;
  b.onclick = () => inspect(f.id);
  $("fixture-list").append(b);
}
function dispose(group) {
  if (!group) return;
  const materials = new Set();
  group.traverse((o) => {
    o.geometry?.dispose();
    if (o.material)
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) materials.add(m);
  });
  for (const m of materials) {
    m.map?.dispose();
    m.dispose();
  }
  scene.remove(group);
}
function rebuild() {
  if (!renderer) return;
  dispose(world);
  world = buildStore(store, active);
  scene.add(world);

  if (!aisleGroup) {
    aisleGroup = new THREE.Group();
    for (const a of store.aisles) {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(a.w, a.d),
        new THREE.MeshBasicMaterial({
          color: "#3ebcb1",
          transparent: true,
          opacity: 0.34,
          depthWrite: false,
        }),
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(a.x, 0.025, a.z);
      aisleGroup.add(mesh);
    }
    scene.add(aisleGroup);
  }
  aisleGroup.visible = showAisles;
  if (walking && !canStand(store, active, camera.position.x, camera.position.z)) {
    camera.position.set(0, 1.65, 4.5);
    yaw = 0;
  }
}
function update() {
  active = which === "current" ? store.current : proposal;
  validatePlan(store, active);
  const m = metrics(store, active);
  $("current").setAttribute("aria-pressed", which === "current");
  $("proposal").setAttribute("aria-pressed", which === "proposal");
  text(
    "scene-source",
    which === "current"
      ? "Existing layout"
      : source === "live"
        ? `Generated with ${config.model}`
        : "Included sample proposal",
  );
  text(
    "layout-name",
    which === "current" ? "CURRENT" : source === "live" ? "AI LAYOUT" : "AI LAYOUT / SAMPLE",
  );
  text("distance", m.coffeeDistance.toFixed(1) + " m");
  text("moves", m.moved);
  text("clearance", m.aisleWidth.toFixed(1) + " m");
  text("rationale", active.summary);
  inspect(selected);
  rebuild();
}
$("current").onclick = () => {
  which = "current";
  update();
};
$("proposal").onclick = () => {
  which = "proposal";
  update();
};
$("generate").onclick = async () => {
  const button = $("generate");
  button.disabled = true;
  text("status", mode === "demo" ? "Loading the included sample…" : "Requesting one AI proposal…");
  try {
    const r = await fetch("/api/plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(mode === "openai" ? { Authorization: "Bearer " + $("token").value } : {}),
      },
      body: JSON.stringify({ goal: $("goal").value }),
    });
    const result = await r.json();
    if (!r.ok) throw Error(result.error || "Planning failed.");
    proposal = validatePlan(store, result.plan);
    source = result.source;
    which = "proposal";
    $("proposal").querySelector("small").textContent = source === "live" ? "live" : "sample";
    update();
    text(
      "status",
      source === "live"
        ? "Layout validated. Checkout and reserved aisles are preserved."
        : "Sample loaded. This fixed example demonstrates the coffee brief; enable live mode for custom goals.",
    );
  } catch (e) {
    text("status", e.message);
  } finally {
    button.disabled = false;
  }
};
text(
  "mode-note",
  mode === "demo"
    ? "Demo mode · no keys, no credits. The included proposal is pre-authored."
    : `Live planner · ${config.model}. One paid request per click; no automatic retries.`,
);
$("live-settings").hidden = mode !== "openai";
if (mode === "openai") text("generate", "Generate AI layout →");
$("download-plan").onclick = () => {
  const blob = new Blob(
    [
      JSON.stringify(
        {
          series: "3D LAB // 002",
          source: which === "current" ? "current" : source,
          claim: "AI concept visualization",
          units: "metres",
          plan: active,
          checks: metrics(store, active),
        },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = "retail-layout.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
$("save-view").onclick = () => {
  if (!renderer) {
    text("status", "3D export requires WebGL. The layout JSON is still available.");
    return;
  }
  const originalSize = renderer.getSize(new THREE.Vector2());
  const originalRatio = renderer.getPixelRatio();
  const exportScale = 2400 / Math.max(originalSize.x, originalSize.y);
  let png;
  try {
    renderer.setPixelRatio(1);
    renderer.setSize(
      Math.round(originalSize.x * exportScale),
      Math.round(originalSize.y * exportScale),
      false,
    );
    renderer.render(scene, camera);
    png = renderer.domElement.toDataURL("image/png");
  } finally {
    renderer.setPixelRatio(originalRatio);
    renderer.setSize(originalSize.x, originalSize.y, false);
    renderer.render(scene, camera);
  }
  const image = document.createElement("img");
  image.alt = `Exported ${which} layout from the working 3D viewer`;
  image.src = png;
  const link = document.createElement("a");
  link.href = image.src;
  link.download = `daily-${which}-${which === "current" ? "existing" : source}.png`;
  link.textContent = "Download this PNG ↓";
  link.className = "download";
  let panel = $("export-preview");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "export-preview";
    $("save-view").after(panel);
  }
  panel.replaceChildren(link, image);
  text(
    "status",
    "View captured below the export button. Use the PNG download link, or save the preview image.",
  );
};
function overview() {
  walking = false;
  keys.clear();
  $("move-pad").hidden = true;
  $("walk").setAttribute("aria-pressed", "false");
  if (!renderer) return;
  controls.enabled = true;
  camera.position.set(8, 8.4, 11.2).multiplyScalar(Math.max(1, 1.4 / camera.aspect));
  camera.up.set(0, 1, 0);
  controls.target.set(0, 0.5, 0);
  controls.update();
  text("controls-help", "Drag to orbit · Scroll to zoom · Click a display");
}
$("overview").onclick = overview;
$("walk").onclick = () => {
  if (!renderer) return;
  walking = true;
  controls.enabled = false;
  keys.clear();
  camera.position.set(0, 1.65, 4.5);
  yaw = 0;
  $("move-pad").hidden = false;
  $("walk").setAttribute("aria-pressed", "true");
  text("controls-help", "Drag to look · WASD / arrows to move · Escape to overview");
};
$("aisles").onclick = () => {
  showAisles = !showAisles;
  if (aisleGroup) aisleGroup.visible = showAisles;
  $("aisles").setAttribute("aria-pressed", showAisles);
};
try {
  renderer = new THREE.WebGLRenderer({
    canvas: $("scene"),
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#d6d8cc");
  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.minDistance = 5;
  controls.maxDistance = 26;
  scene.add(new THREE.HemisphereLight("#fff5df", "#6e7566", 1.65));
  const sun = new THREE.DirectionalLight("#ffe7bd", 2.8);
  sun.position.set(4, 9, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.025;
  scene.add(sun);
  new ResizeObserver(() => {
    const { width, height } = $("stage").getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (!walking) overview();
  }).observe($("stage"));
  overview();
  let previous = performance.now();
  renderer.setAnimationLoop((now) => {
    const dt = Math.min((now - previous) / 1000, 0.05);
    previous = now;
    if (walking) {
      let f =
        Number(keys.has("w") || keys.has("arrowup")) -
        Number(keys.has("s") || keys.has("arrowdown"));
      let r =
        Number(keys.has("d") || keys.has("arrowright")) -
        Number(keys.has("a") || keys.has("arrowleft"));
      const next = movePosition(store, active, camera.position, yaw, f, r, dt * 2.2);
      camera.position.x = next.x;
      camera.position.z = next.z;
      camera.lookAt(camera.position.x - Math.sin(yaw), 1.65, camera.position.z - Math.cos(yaw));
    } else controls.update();
    renderer.render(scene, camera);
  });
  const canvas = $("scene");
  canvas.addEventListener("pointerdown", (e) => {
    pointer = { x: e.clientX, y: e.clientY, last: e.clientX, moved: false };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!pointer) return;
    if (Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) > 5) pointer.moved = true;
    if (walking) yaw -= (e.clientX - pointer.last) * 0.005;
    pointer.last = e.clientX;
  });
  canvas.addEventListener("pointerup", (e) => {
    if (pointer && !pointer.moved) {
      const rect = canvas.getBoundingClientRect();
      const ray = new THREE.Raycaster();
      ray.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          (-(e.clientY - rect.top) / rect.height) * 2 + 1,
        ),
        camera,
      );
      for (const hit of ray.intersectObject(world, true)) {
        let o = hit.object;
        while (o && !o.userData.fixtureId) o = o.parent;
        if (o) {
          inspect(o.userData.fixtureId);
          break;
        }
      }
    }
    pointer = null;
  });
  canvas.addEventListener("pointercancel", () => {
    pointer = null;
  });
} catch {
  $("webgl-error").hidden = false;
  for (const id of ["overview", "walk", "aisles"]) $(id).disabled = true;
}
document.addEventListener("keydown", (e) => {
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if (e.key === "Escape") overview();
  if (
    walking &&
    ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(
      e.key.toLowerCase(),
    )
  ) {
    keys.add(e.key.toLowerCase());
    e.preventDefault();
  }
});
document.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
window.addEventListener("blur", () => keys.clear());
for (const button of $("move-pad").children) {
  const key = { forward: "w", back: "s", left: "a", right: "d" }[button.dataset.move];
  button.onpointerdown = (e) => {
    keys.add(key);
    button.setPointerCapture(e.pointerId);
  };
  button.onpointerup = button.onpointercancel = () => keys.delete(key);
  button.onclick = () => {
    if (!walking) return;
    const next = movePosition(
      store,
      active,
      camera.position,
      yaw,
      Number(key === "w") - Number(key === "s"),
      Number(key === "d") - Number(key === "a"),
      0.28,
    );
    camera.position.x = next.x;
    camera.position.z = next.z;
  };
}
update();
