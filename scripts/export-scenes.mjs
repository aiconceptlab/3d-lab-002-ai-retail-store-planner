import { readFile, mkdir, writeFile } from "node:fs/promises";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { buildStore } from "../public/scene-factory.js";
import { validatePlan } from "../public/planner.js";
// GLTFExporter uses FileReader; Node 24 supplies Blob but not this browser helper.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = `data:${blob.type};base64,${Buffer.from(result).toString("base64")}`;
      this.onloadend?.();
    });
  }
};
const store = JSON.parse(await readFile(new URL("../data/store.json", import.meta.url), "utf8"));
const out = new URL("../public/assets/", import.meta.url);
await mkdir(out, { recursive: true });
for (const [name, plan] of [
  ["current", store.current],
  ["ai-layout", store.proposal],
]) {
  validatePlan(store, plan);
  const scene = buildStore(store, plan);
  const bytes = await new GLTFExporter().parseAsync(scene, { binary: true });
  await writeFile(new URL(name + ".glb", out), Buffer.from(bytes));
  console.log(`${name}.glb: ${bytes.byteLength} bytes`);
}
