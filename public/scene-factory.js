import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import fontData from "./assets/sign-font.json" with { type: "json" };
import { footprints } from "./planner.js";
const font = new FontLoader().parse(fontData);
// Merchandise stays inside the checked fixture footprints. Architectural trim
// is shallow and above the circulation volume; pendants are overhead.
export function buildStore(store, plan) {
  const world = new THREE.Group();
  world.name = "DAILY_Retail_Concept";
  const materials = new Map(),
    geometries = new Map();
  const mat = (color, roughness = 0.7, metalness = 0) => {
    const key = [color, roughness, metalness].join("/");
    if (!materials.has(key))
      materials.set(key, new THREE.MeshStandardMaterial({ color, roughness, metalness }));
    return materials.get(key);
  };
  const oak = mat("#ac8153"),
    edge = mat("#d3ae77"),
    cream = mat("#e9e1cf"),
    green = mat("#273e34"),
    black = mat("#202b26"),
    brass = mat("#b89a5b", 0.3, 0.7),
    paper = mat("#f8f0da"),
    steel = mat("#b0b6af", 0.27, 0.8),
    terra = mat("#b85738");
  const mesh = (parent, name, geometry, material, x, y, z) => {
    const m = new THREE.Mesh(geometry, material);
    m.name = name;
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const box = (p, n, w, h, d, x, y, z, m) => {
    const k = `box/${w}/${h}/${d}`;
    if (!geometries.has(k)) geometries.set(k, new THREE.BoxGeometry(w, h, d));
    return mesh(p, n, geometries.get(k), m, x, y, z);
  };
  const cyl = (p, n, t, b, h, x, y, z, m) => {
    const k = `cyl/${t}/${b}/${h}`;
    if (!geometries.has(k)) geometries.set(k, new THREE.CylinderGeometry(t, b, h, 20));
    return mesh(p, n, geometries.get(k), m, x, y, z);
  };
  const text = (p, label, size, x, y, z, m = paper) => {
    const k = `text/${label}/${size}`;
    if (!geometries.has(k)) {
      const g = new THREE.ExtrudeGeometry(font.generateShapes(label, size), {
        depth: 0.003,
        bevelEnabled: false,
        curveSegments: 3,
      });
      g.computeBoundingBox();
      g.translate(-(g.boundingBox.max.x + g.boundingBox.min.x) / 2, 0, 0);
      geometries.set(k, g);
    }
    return mesh(p, "Lettering_" + label, geometries.get(k), m, x, y, z);
  };
  const tube = (p, n, points, r, m) =>
    mesh(
      p,
      n,
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points.map((v) => new THREE.Vector3(...v))),
        12,
        r,
        8,
        false,
      ),
      m,
      0,
      0,
      0,
    );
  const mug = (p, x, y, z, m = cream) => {
    if (!geometries.has("mug"))
      geometries.set(
        "mug",
        new THREE.LatheGeometry(
          [
            [0, 0],
            [0.072, 0],
            [0.09, 0.025],
            [0.095, 0.17],
            [0.079, 0.17],
            [0.075, 0.045],
            [0, 0.045],
          ].map((v) => new THREE.Vector2(...v)),
          20,
        ),
      );
    mesh(p, "Ceramic_mug", geometries.get("mug"), m, x, y, z);
    mesh(
      p,
      "Mug_handle",
      new THREE.TorusGeometry(0.047, 0.013, 8, 14, Math.PI * 1.65),
      m,
      x + 0.096,
      y + 0.092,
      z,
    ).rotation.z = -Math.PI * 0.825;
  };
  const bag = (p, x, y, z, tone, variant) => {
    if (!geometries.has("bag")) geometries.set("bag", new THREE.CapsuleGeometry(0.075, 0.18, 3, 8));
    mesh(p, "Resealable_coffee_bag", geometries.get("bag"), tone, x, y + 0.165, z).scale.set(
      1.4,
      1,
      0.82,
    );
    box(p, "Folded_bag_seal", 0.205, 0.025, 0.12, x, y + 0.326, z, black);
    box(p, "Roast_label", 0.16, 0.13, 0.006, x, y + 0.19, z + 0.064, paper);
    text(p, "DAILY", 0.025, x, y + 0.208, z + 0.069, green);
    box(p, "Roast_colour", 0.13, 0.018, 0.008, x, y + 0.155, z + 0.07, variant ? terra : green);
    cyl(p, "Degassing_valve", 0.012, 0.012, 0.004, x, y + 0.275, z + 0.07, black).rotation.x =
      Math.PI / 2;
  };
  const jar = (p, x, y, z, tone) => {
    cyl(p, "Pantry_jar", 0.08, 0.075, 0.24, x, y + 0.12, z, tone);
    cyl(p, "Brass_jar_lid", 0.083, 0.083, 0.025, x, y + 0.25, z, brass);
    box(p, "Jar_label", 0.12, 0.095, 0.006, x, y + 0.125, z + 0.078, paper);
    box(p, "Label_rule", 0.09, 0.012, 0.008, x, y + 0.13, z + 0.082, green);
  };
  const kettle = (p, x, y, z) => {
    mesh(p, "Kettle_body", new THREE.SphereGeometry(0.12, 20, 12), steel, x, y + 0.13, z).scale.set(
      1,
      0.9,
      1,
    );
    cyl(p, "Kettle_lid", 0.085, 0.085, 0.017, x, y + 0.238, z, black);
    cyl(p, "Kettle_knob", 0.024, 0.028, 0.035, x, y + 0.26, z, oak);
    tube(
      p,
      "Gooseneck_spout",
      [
        [x + 0.08, y + 0.1, z],
        [x + 0.17, y + 0.1, z],
        [x + 0.2, y + 0.21, z],
        [x + 0.22, y + 0.25, z],
      ],
      0.012,
      steel,
    );
    tube(
      p,
      "Kettle_handle",
      [
        [x - 0.085, y + 0.2, z],
        [x - 0.165, y + 0.25, z],
        [x - 0.185, y + 0.09, z],
        [x - 0.09, y + 0.08, z],
      ],
      0.016,
      black,
    );
  };
  box(world, "Floor_8x10m", 8, 0.13, 10, 0, -0.065, 0, mat("#a79881"));
  const tones = ["#d5c3a4", "#cfbc9c", "#d9caad", "#cdb999", "#d7c5a6"];
  for (let row = 0; row < 10; row++)
    for (let col = 0; col < 10; col++) {
      const x = -3.6 + col * 0.8,
        z = -4.5 + row;
      box(
        world,
        "Oak_floorboard",
        0.792,
        0.018,
        0.991,
        x,
        0.009,
        z,
        mat(tones[(row * 3 + col * 7) % 5]),
      );
      for (let grain = 0; grain < 2; grain++)
        box(
          world,
          "Wood_grain",
          0.004,
          0.001,
          0.7,
          x - 0.22 + grain * 0.31,
          0.019,
          z + 0.08,
          mat("#bfad8e"),
        );
    }
  box(world, "Rear_wall", 8, 3.4, 0.12, 0, 1.7, -5.12, cream);
  box(world, "Rear_wainscot", 8, 0.95, 0.045, 0, 0.475, -5.025, green);
  box(world, "Brass_wall_trim", 8, 0.022, 0.022, 0, 0.965, -5.015, brass);
  for (let x = -3.85; x < 4; x += 0.13)
    box(world, "Fluted_wall_panelling", 0.055, 0.84, 0.018, x, 0.48, -5.02, mat("#345043"));
  for (const side of [-1, 1]) {
    box(world, "Side_plinth", 0.12, 0.55, 10, side * 4.06, 0.275, 0, cream);
    box(world, "Window_sill", 0.15, 0.045, 10, side * 3.985, 0.57, 0, oak);
    for (const z of [-5, -2.5, 0, 2.5, 5]) {
      box(world, "Window_frame", 0.065, 3.4, 0.065, side * 4.04, 1.7, z, black);
      box(world, "Brass_frame_inlay", 0.012, 3.3, 0.07, side * 3.998, 1.72, z, brass);
    }
    box(world, "Roof_beam", 0.12, 0.15, 10, side * 4.03, 3.4, 0, green);
    box(world, "Window_transom", 0.055, 0.045, 10, side * 4.03, 2.75, 0, black);
  }
  box(world, "Entry_threshold", 1.5, 0.021, 0.09, 0, 0.021, 4.94, brass);
  box(world, "Brand_panel", 3.2, 1.04, 0.055, -1, 2.15, -4.965, green);
  box(world, "Sign_top_trim", 3.22, 0.026, 0.02, -1, 2.685, -4.93, brass);
  box(world, "Sign_bottom_trim", 3.22, 0.026, 0.02, -1, 1.615, -4.93, brass);
  text(world, "DAILY", 0.53, -1, 2.07, -4.925);
  text(world, "COFFEE & PROVISIONS", 0.095, -1, 1.82, -4.92, edge);
  text(world, "SMALL BATCH. EVERY DAY.", 0.07, -1, 1.68, -4.92);
  box(world, "Menu_frame", 1.47, 1.45, 0.055, 2.4, 2.2, -4.965, oak);
  box(world, "Menu_board", 1.38, 1.36, 0.012, 2.4, 2.2, -4.93, green);
  text(world, "THE COFFEE EDIT", 0.09, 2.4, 2.7, -4.912);
  ["HOUSE BLEND", "SINGLE ORIGIN", "DECAF", "BREW AT HOME"].forEach((s, i) => {
    text(world, s, 0.065, 2.4, 2.43 - i * 0.18, -4.91, edge);
    box(world, "Menu_separator", 1.06, 0.005, 0.008, 2.4, 2.38 - i * 0.18, -4.913, mat("#5f7360"));
  });
  text(world, "ROASTED FOR YOUR DAILY RITUAL", 0.047, 2.4, 1.63, -4.91);
  const glow = new THREE.MeshStandardMaterial({
    color: "#fff0c6",
    emissive: "#ffcc77",
    emissiveIntensity: 1.5,
  });
  for (const z of [-3, 0, 3]) {
    box(world, "Ceiling_beam", 8, 0.11, 0.09, 0, 3.42, z, oak);
    for (const x of [-2.25, 2.25]) {
      cyl(world, "Ceiling_rose", 0.075, 0.075, 0.03, x, 3.34, z, black);
      cyl(world, "Pendant_cable", 0.007, 0.007, 0.44, x, 3.11, z, black);
      cyl(world, "Pendant_brass_neck", 0.055, 0.055, 0.12, x, 2.9, z, brass);
      cyl(world, "Pendant_shade", 0.1, 0.29, 0.22, x, 2.75, z, green);
      cyl(world, "Pendant_luminous_diffuser", 0.255, 0.255, 0.016, x, 2.633, z, glow);
      cyl(world, "Pendant_rim", 0.292, 0.292, 0.018, x, 2.644, z, brass);
    }
  }
  for (const f of footprints(store, plan)) {
    const g = new THREE.Group();
    g.name = f.id;
    g.userData = { fixtureId: f.id, label: f.label, bay: f.bayId };
    g.position.set(f.x, 0, f.z);
    world.add(g);
    if (f.fixed) {
      box(g, "Fixed_checkout", f.w, 0.98, f.d, 0, 0.49, 0, green);
      for (let x = -1.035; x < 1.05; x += 0.085)
        box(g, "Counter_fluting", 0.038, 0.8, 0.025, x, 0.49, 0.38, oak);
      box(g, "Stone_countertop", f.w, 0.075, f.d, 0, 1.015, 0, mat("#e5d7bd", 0.4));
      box(g, "Counter_kickplate", 2.06, 0.08, 0.035, 0, 0.045, 0.375, brass);
      box(g, "POS_base", 0.28, 0.028, 0.22, 0.69, 1.064, 0.03, black);
      box(g, "POS_stand", 0.055, 0.22, 0.07, 0.69, 1.17, -0.02, steel);
      box(g, "POS_screen", 0.36, 0.25, 0.045, 0.69, 1.31, 0, black);
      box(g, "POS_display", 0.31, 0.202, 0.006, 0.69, 1.31, 0.026, mat("#a5c3af"));
      text(g, "DAILY", 0.036, 0.69, 1.335, 0.032, green);
      box(g, "POS_button", 0.21, 0.035, 0.008, 0.69, 1.262, 0.03, green);
      box(g, "Espresso_machine", 0.64, 0.36, 0.38, -0.47, 1.235, -0.09, steel);
      box(g, "Machine_front_panel", 0.59, 0.26, 0.026, -0.47, 1.22, 0.11, green);
      box(g, "Drip_tray", 0.58, 0.025, 0.23, -0.47, 1.073, 0.19, black);
      for (let i = 0; i < 9; i++)
        box(g, "Drip_tray_grille", 0.012, 0.006, 0.2, -0.71 + i * 0.06, 1.089, 0.19, steel);
      for (const x of [-0.63, -0.33]) {
        cyl(g, "Group_head", 0.045, 0.045, 0.06, x, 1.22, 0.17, steel);
        cyl(g, "Portafilter_handle", 0.018, 0.018, 0.115, x, 1.19, 0.255, black).rotation.x =
          Math.PI / 2;
      }
      cyl(g, "Pressure_gauge", 0.035, 0.035, 0.014, -0.47, 1.335, 0.133, paper).rotation.x =
        Math.PI / 2;
      mug(g, -0.58, 1.43, -0.1);
      mug(g, -0.31, 1.43, -0.1);
      cyl(g, "Takeaway_cup", 0.056, 0.043, 0.14, 0.15, 1.126, 0.16, paper);
      cyl(g, "Cup_lid", 0.06, 0.06, 0.018, 0.15, 1.206, 0.16, black);
      continue;
    }
    box(g, "Display_base", f.w, 0.13, f.d, 0, 0.105, 0, green);
    for (const x of [-0.61, 0.61])
      for (const z of [-0.5, 0.5]) cyl(g, "Levelling_foot", 0.033, 0.033, 0.05, x, 0.025, z, brass);
    for (const x of [-f.w / 2 + 0.035, f.w / 2 - 0.035])
      for (const z of [-f.d / 2 + 0.035, f.d / 2 - 0.035]) {
        box(g, "Oak_upright", 0.065, f.h, 0.065, x, f.h / 2, z, oak);
        for (const y of [0.23, 0.7, 1.17].filter((y) => y < f.h))
          cyl(g, "Shelf_fixing", 0.009, 0.009, 0.004, x, y, z + 0.03, brass).rotation.x =
            Math.PI / 2;
      }
    for (let x = -0.6; x <= 0.61; x += 0.12)
      box(g, "Display_back_slat", 0.06, f.h - 0.25, 0.035, x, (f.h + 0.12) / 2, 0, oak);
    const levels = f.id === "brew" ? 2 : 3;
    for (let level = 0; level < levels; level++) {
      const y = 0.22 + level * 0.46;
      box(g, "Oak_shelf", f.w, 0.055, f.d, 0, y, 0, oak);
      for (const side of [-1, 1]) {
        box(g, "Shelf_edge_lip", f.w, 0.06, 0.018, 0, y + 0.016, side * 0.583, edge);
        box(g, "Shelf_price_rail", f.w - 0.07, 0.043, 0.01, 0, y - 0.009, side * 0.59, brass);
        for (let i = 0; i < 4; i++)
          box(
            g,
            "Shelf_ticket",
            0.19,
            0.044,
            0.004,
            -0.465 + i * 0.31,
            y - 0.008,
            side * 0.597,
            paper,
          );
      }
      for (const z of [-0.3, 0.3])
        for (let i = 0; i < 4; i++) {
          const x = -0.465 + i * 0.31;
          if (f.id === "coffee")
            bag(g, x, y + 0.035, z, mat((i + level) % 2 ? "#b45637" : "#d2af75"), (i + level) % 2);
          else if (f.id === "pantry")
            jar(g, x, y + 0.03, z, mat(["#a59158", "#849379", "#b88153", "#719080"][i]));
          else if (level === 0) mug(g, x, y + 0.03, z, i % 2 ? green : cream);
          else if (i % 2 === 0) kettle(g, x + 0.035, y + 0.03, z);
          else {
            cyl(
              g,
              "Glass_coffee_server",
              0.072,
              0.09,
              0.17,
              x,
              y + 0.115,
              z,
              mat("#82978c", 0.3, 0.25),
            );
            cyl(g, "Pour_over_dripper", 0.11, 0.045, 0.14, x, y + 0.27, z, paper);
            cyl(g, "Filter_rim", 0.113, 0.113, 0.012, x, y + 0.345, z, edge);
          }
        }
    }
    box(g, "Category_header", f.w, 0.2, 0.055, 0, f.h, 0, mat(f.color));
    const label =
      f.id === "coffee" ? "SPECIALTY COFFEE" : f.id === "brew" ? "BREW AT HOME" : "EVERYDAY PANTRY";
    text(g, label, 0.084, 0, f.h - 0.032, 0.031);
    text(g, label, 0.084, 0, f.h - 0.032, -0.031).rotation.y = Math.PI;
  }
  return world;
}
