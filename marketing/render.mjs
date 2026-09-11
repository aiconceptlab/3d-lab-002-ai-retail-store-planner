import { readFile, writeFile, mkdir } from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";
import { footprints } from "../public/planner.js";
const store = JSON.parse(await readFile(new URL("../data/store.json", import.meta.url), "utf8"));
const out = new URL("./instagram-4x5/", import.meta.url);
await mkdir(out, { recursive: true });
const C = {
  bg: "#11221d",
  ink: "#f4f1e7",
  muted: "#b5c7bd",
  accent: "#eca774",
  line: "#476457",
  teal: "#80cbc1",
};
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const t = (x, y, text, size = 30, fill = C.ink, weight = 400, extra = "") =>
  `<text x="${x}" y="${y}" fill="${fill}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" ${extra}>${esc(text)}</text>`;
const lines = (x, y, list, size = 30, fill = C.ink, weight = 400, gap = size * 1.22) =>
  list.map((s, i) => t(x, y + i * gap, s, size, fill, weight)).join("");
const rect = (x, y, w, h, fill, stroke = "none", r = 0) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
const rule = (x, y, w) => `<path d="M${x} ${y}h${w}" stroke="${C.line}"/>`;
const header = () =>
  t(90, 113, "AI CONCEPT LAB", 22, C.ink, 500, 'letter-spacing="4"') +
  rect(730, 78, 260, 53, "none", C.accent, 3) +
  t(752, 113, "3D LAB // 002", 23, C.accent, 600) +
  rule(90, 151, 900);
const footer = (i) =>
  rule(90, 1210, 900) +
  t(90, 1255, "AI RETAIL STORE PLANNER", 17, C.muted, 500, 'letter-spacing="2"') +
  t(990, 1262, `0${i} / 05`, 31, C.ink, 600, 'text-anchor="end"');
const photo = async (file, x, y, w, h, fit = "xMidYMid meet") =>
  `<image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${fit}" href="data:image/png;base64,${(await readFile(new URL("./screenshots/" + file, import.meta.url))).toString("base64")}"/>`;
const card = (y, title, description, n) =>
  rect(90, y, 900, 146, "#193329", C.line, 12) +
  t(124, y + 54, n, 28, C.accent, 700) +
  t(184, y + 54, title, 31, C.ink, 700) +
  lines(184, y + 94, description, 23, C.muted, 400, 30);
function floor(plan, x, y, w, h) {
  const scale = Math.min(w / 8, h / 10);
  let result = rect(x, y, 8 * scale, 10 * scale, "#dfd4bd", C.line, 2);
  for (const a of store.aisles)
    result += rect(
      x + (a.x + 4 - a.w / 2) * scale,
      y + (a.z + 5 - a.d / 2) * scale,
      a.w * scale,
      a.d * scale,
      C.teal,
    );
  for (const f of footprints(store, plan)) {
    result += rect(
      x + (f.x + 4 - f.w / 2) * scale,
      y + (f.z + 5 - f.d / 2) * scale,
      f.w * scale,
      f.d * scale,
      f.color,
    );
    result += t(
      x + (f.x + 4) * scale,
      y + (f.z + 5) * scale + 5,
      f.id.toUpperCase(),
      f.id === "checkout" ? 12 : 13,
      "#fff",
      700,
      'text-anchor="middle"',
    );
  }
  result += t(
    x + 4 * scale,
    y + 10 * scale + 30,
    "ENTRANCE ↑",
    17,
    C.muted,
    500,
    'text-anchor="middle"',
  );
  return result;
}
const slides = [];
slides.push([
  "01-cover",
  lines(90, 252, ["I gave AI a shop", "and a goal:"], 79, C.ink, 700, 90) +
    t(90, 445, "sell more coffee.", 85, C.accent, 700) +
    (await photo("higgsfield-icon.png", 90, 467, 42, 42)) +
    t(151, 498, "HIGGSFIELD 3D JUTSU · AUTO", 22, C.teal, 600, 'letter-spacing="1.5"') +
    rect(90, 552, 900, 498, "#d6d8cc", C.line, 12) +
    (await photo("higgsfield-jutsu-cover.png", 98, 560, 884, 482)) +
    rect(112, 576, 390, 41, "#14241c", "none", 4) +
    t(132, 604, "REAL 3D JUTSU EDITOR CAPTURE", 16, C.ink, 700, 'letter-spacing="1"') +
    t(90, 1105, "Editable scene + open-source walkthrough.", 29, C.ink, 400) +
    t(90, 1160, "AI concept visualization  ·  Swipe to explore →", 24, C.teal, 400),
]);
slides.push([
  "02-comparison",
  lines(90, 249, ["One swap.", "A different first impression."], 61, C.ink, 700, 73) +
    t(90, 404, "CURRENT", 23, C.muted, 700, 'letter-spacing="2"') +
    t(600, 404, "AI LAYOUT · SAMPLE", 23, C.accent, 700, 'letter-spacing="1"') +
    floor(store.current, 90, 446, 380, 475) +
    floor(store.proposal, 600, 446, 380, 475) +
    t(90, 1031, "7.9 m", 68, C.ink, 700) +
    t(600, 1031, "3.3 m", 68, C.accent, 700) +
    t(90, 1074, "Coffee display → entrance", 23, C.muted) +
    t(600, 1074, "Coffee display → entrance", 23, C.muted) +
    lines(
      90,
      1140,
      [
        "Straight-line distance, measured from the sample geometry.",
        "Closer to the entrance does not prove higher sales.",
      ],
      23,
      C.muted,
      400,
      32,
    ),
]);
slides.push([
  "03-constraints",
  lines(90, 250, ["Move the display.", "Keep the rules."], 76, C.ink, 700, 88) +
    t(90, 399, "CONSTRAINTS CHECKED IN CODE", 23, C.teal, 600, 'letter-spacing="2"') +
    floor(store.proposal, 90, 461, 432, 540) +
    t(590, 505, "01", 23, C.accent, 700) +
    lines(590, 553, ["Checkout", "stays put."], 40, C.ink, 700, 46) +
    t(590, 700, "02", 23, C.accent, 700) +
    lines(590, 748, ["Reserved aisles", "stay ≥ 1.5 m."], 35, C.ink, 700, 44) +
    t(590, 895, "03", 23, C.accent, 700) +
    lines(590, 943, ["Same room.", "Same fixtures."], 35, C.ink, 700, 44) +
    rect(90, 1070, 900, 101, "#193329", C.line, 8) +
    lines(
      120,
      1112,
      [
        "Blue = reserved circulation routes.",
        "A toy geometry check, not a building-code certification.",
      ],
      24,
      C.muted,
      400,
      34,
    ),
]);
slides.push([
  "04-build",
  lines(90, 250, ["A tiny build.", "A real walkthrough."], 73, C.ink, 700, 87) +
    t(90, 399, "THE SIMPLE STACK", 23, C.teal, 600, 'letter-spacing="2"') +
    card(440, "Retail brief + constraints", ["One shop. Fixed checkout. Clear aisles."], "01") +
    card(
      603,
      "Higgsfield 3D Jutsu · Auto",
      ["An editable 392-object concept scene."],
      "02",
    ) +
    card(766, "Geometry checks", ["Reject moved checkout or blocked 1.5 m routes."], "03") +
    card(
      929,
      "Interactive Three.js viewer",
      ["Walk through both layouts. Export JSON + GLB."],
      "04",
    ) +
    lines(
      90,
      1130,
      ["The included demo needs no keys.", "Optional live planning uses your API account."],
      24,
      C.muted,
      400,
      33,
    ),
]);
slides.push([
  "05-cta",
  lines(90, 250, ["Explore the idea.", "Make it yours."], 78, C.ink, 700, 89) +
    t(90, 405, "FREE SOURCE CODE", 24, C.teal, 600, 'letter-spacing="3"') +
    rect(90, 446, 900, 347, "#d6d8cc", C.line, 12) +
    (await photo("proposal-view.png", 98, 452, 884, 334)) +
    lines(
      90,
      856,
      [
        "Walkable shop. Two layouts. Constraint checks.",
        "Sample data, setup guide and editable assets.",
      ],
      29,
      C.ink,
      400,
      43,
    ) +
    t(90, 977, "A concept to test — no sales uplift promised.", 25, C.muted) +
    rect(90, 1030, 900, 139, C.accent, "none", 12) +
    t(540, 1088, "Comment “CODE”", 44, "#14241c", 700, 'text-anchor="middle"') +
    t(540, 1137, "to get the link. →", 35, "#14241c", 700, 'text-anchor="middle"'),
]);
for (let i = 0; i < slides.length; i++) {
  const [name, body] = slides[i];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">${rect(0, 0, 1080, 1350, C.bg)}${header()}${body}${footer(i + 1)}</svg>`;
  await writeFile(new URL(name + ".svg", out), svg);
  await writeFile(
    new URL(name + ".png", out),
    new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: "Arial" } })
      .render()
      .asPng(),
  );
  console.log(`${name}: 1080 × 1350`);
}
