import { readFile, stat } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const required = [
  "public/index.html",
  "public/app.js",
  "public/style.css",
  "public/assets/current-shop.png",
  "public/assets/current-flow.mp4",
  "public/assets/revised-shop.png",
  "public/assets/revised-flow.mp4",
  "sample/observations.json",
  "docs/higgsfield.md",
  "README.md",
  "BUILD.md",
  ".env.example",
  "marketing/caption.txt",
];

for (const file of required) {
  const info = await stat(new URL(file, root));
  if (!info.isFile() || info.size === 0) throw new Error(`Missing or empty: ${file}`);
}

const [html, app, readme, caption] = await Promise.all([
  readFile(new URL("public/index.html", root), "utf8"),
  readFile(new URL("public/app.js", root), "utf8"),
  readFile(new URL("README.md", root), "utf8"),
  readFile(new URL("marketing/caption.txt", root), "utf8"),
]);

for (const text of [html, readme, caption]) {
  if (!/concept simulation/i.test(text)) throw new Error("Claim boundary is missing.");
}
if (/OPENAI_API_KEY|github_pat_|AIza[0-9A-Za-z_-]{20,}/.test(html + app + readme + caption)) {
  throw new Error("Possible secret found in public source.");
}
if (!/Comment [“\"]CODE[”\"]/.test(caption)) throw new Error("Caption CTA is missing.");
console.log("Static checks passed.");
