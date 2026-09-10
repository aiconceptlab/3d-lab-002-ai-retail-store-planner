import * as THREE from "three";
import { footprints } from "./planner.js";
export function buildStore(store, plan) {
  const world = new THREE.Group();
  world.name = "DAILY_Retail_Concept";
  const mat = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.72 });
  const oak = mat("#a77d50"),
    cream = mat("#e9e1cd"),
    dark = mat("#303d36"),
    metal = mat("#27332d");
  const addBox = (parent, name, w, h, d, x, y, z, material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  addBox(world, "Floor_8x10m", 8, 0.12, 10, 0, -0.06, 0, mat("#ccc1ac"));
  for (let x = -3.9; x < 4; x += 0.4)
    addBox(world, "Floor_joint", 0.012, 0.002, 10, x, 0.003, 0, mat("#b8ac99"));
  addBox(world, "Rear_wall", 8, 3.4, 0.12, 0, 1.7, -5.06, cream);
  // Side walls below eye level keep the overview readable; vertical frames imply glazing.
  for (const side of [-1, 1]) {
    addBox(world, "Side_plinth", 0.12, 0.65, 10, side * 4.06, 0.325, 0, cream);
    for (const z of [-5, -2.5, 0, 2.5, 5])
      addBox(world, "Window_frame", 0.08, 3.4, 0.08, side * 4, 1.7, z, dark);
    addBox(world, "Roof_beam", 0.12, 0.15, 10, side * 4, 3.4, 0, dark);
  }
  for (const z of [-3, 0, 3]) {
    addBox(world, "Ceiling_beam", 8, 0.12, 0.1, 0, 3.4, z, oak);
    for (const x of [-2.25, 2.25]) {
      const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.32, 0.28, 20), metal);
      shade.position.set(x, 2.95, z);
      world.add(shade);
      addBox(world, "Pendant_cable", 0.015, 0.3, 0.015, x, 3.23, z, metal);
    }
  }
  addBox(world, "Brand_panel", 3.2, 1.0, 0.045, -1.1, 2.3, -4.97, dark);
  // Letter-like slats are a geometric wall motif, not a vendor logo.
  for (let i = 0; i < 7; i++)
    addBox(world, "Brand_motif", 0.16, 0.45, 0.035, -2.2 + i * 0.36, 2.3, -4.93, oak);
  for (const f of footprints(store, plan)) {
    const g = new THREE.Group();
    g.name = f.id;
    g.userData = { fixtureId: f.id, label: f.label, bay: f.bayId };
    g.position.set(f.x, 0, f.z);
    world.add(g);
    if (f.id === "checkout") {
      addBox(g, "Fixed_checkout", f.w, f.h, f.d, 0, f.h / 2, 0, dark);
      addBox(g, "Countertop", f.w + 0.02, 0.07, f.d + 0.02, 0, f.h, 0, oak);
      addBox(g, "POS_stand", 0.12, 0.18, 0.12, 0.6, 1.15, 0, metal);
      const pos = addBox(g, "POS_screen", 0.36, 0.26, 0.05, 0.6, 1.34, 0, metal);
      pos.rotation.x = -0.2;
      addBox(g, "POS_display", 0.3, 0.2, 0.008, 0.6, 1.34, 0.03, mat("#75a995"));
      continue;
    }
    addBox(g, "Display_base", f.w, 0.15, f.d, 0, 0.075, 0, dark);
    for (const x of [-f.w / 2 + 0.035, f.w / 2 - 0.035])
      for (const z of [-f.d / 2 + 0.035, f.d / 2 - 0.035])
        addBox(g, "Upright", 0.07, f.h, 0.07, x, f.h / 2, z, oak);
    const levels = f.id === "brew" ? 2 : 3;
    for (let k = 0; k < levels; k++) {
      const y = 0.23 + k * 0.46;
      addBox(g, "Shelf", f.w, 0.055, f.d, 0, y, 0, oak);
      for (let i = 0; i < 4; i++)
        for (const z of [-0.31, 0.31]) {
          const x = -0.48 + i * 0.32;
          if (f.id === "brew") {
            const mug = new THREE.Mesh(
              new THREE.CylinderGeometry(0.095, 0.08, 0.19, 16),
              mat(i % 2 ? "#e6dcc5" : "#55746b"),
            );
            mug.position.set(x, y + 0.12, z);
            mug.castShadow = true;
            g.add(mug);
          } else {
            addBox(
              g,
              "Sample_product",
              0.23,
              0.31,
              0.17,
              x,
              y + 0.18,
              z,
              mat(i % 2 ? f.color : "#dccaaa"),
            );
            addBox(g, "Paper_label", 0.16, 0.1, 0.005, x, y + 0.2, z + 0.087, cream);
          }
        }
    }
    addBox(g, "Category_header", f.w, 0.23, 0.08, 0, f.h, 0, mat(f.color));
  }
  return world;
}
