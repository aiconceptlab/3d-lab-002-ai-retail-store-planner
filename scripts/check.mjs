import { readdir, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
for (const folder of ["public", "lib", "scripts", "tests", "marketing"])
  for (const file of await readdir(new URL(`../${folder}/`, import.meta.url))) {
    if (!/\.(mjs|js)$/.test(file)) continue;
    const r = spawnSync(
      process.execPath,
      ["--check", fileURLToPath(new URL(`../${folder}/${file}`, import.meta.url))],
      { stdio: "inherit" },
    );
    if (r.status) process.exit(r.status);
  }
const r = spawnSync(process.execPath, ["--check", "server.mjs"], { stdio: "inherit" });
if (r.status) process.exit(r.status);
JSON.parse(await readFile(new URL("../data/store.json", import.meta.url), "utf8"));
console.log("Syntax and sample JSON checked.");
