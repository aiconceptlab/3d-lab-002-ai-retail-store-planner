// Shared by browser, server, tests and GLB exporter. X/Z are floor coordinates.
export function rectanglesOverlap(a, b, padding = 0) {
  return (
    Math.abs(a.x - b.x) < (a.w + b.w) / 2 + padding - 1e-8 &&
    Math.abs(a.z - b.z) < (a.d + b.d) / 2 + padding - 1e-8
  );
}
export function footprints(store, plan) {
  return plan.placements.map((p) => {
    const fixture = store.fixtures.find((f) => f.id === p.fixtureId);
    const bay = store.bays.find((b) => b.id === p.bayId);
    if (!fixture || !bay) throw Error("Unknown fixture or bay.");
    return { ...fixture, ...bay, id: fixture.id, bayId: bay.id };
  });
}
export function validatePlan(store, plan) {
  if (
    !plan ||
    typeof plan.summary !== "string" ||
    !plan.summary.trim() ||
    plan.summary.length > 600 ||
    !Array.isArray(plan.placements) ||
    plan.placements.length !== store.fixtures.length
  )
    throw Error("Plan must contain a short explanation and every fixture exactly once.");
  const ids = new Set(),
    bays = new Set();
  for (const p of plan.placements) {
    if (!p || Object.keys(p).sort().join(",") !== "bayId,fixtureId")
      throw Error("Invalid placement fields.");
    if (ids.has(p.fixtureId) || bays.has(p.bayId)) throw Error("Repeated fixture or occupied bay.");
    ids.add(p.fixtureId);
    bays.add(p.bayId);
    const original = store.current.placements.find((c) => c.fixtureId === p.fixtureId);
    if (store.fixtures.find((f) => f.id === p.fixtureId)?.fixed && p.bayId !== original?.bayId)
      throw Error("Checkout must stay in its original position.");
  }
  const boxes = footprints(store, plan);
  for (const box of boxes) {
    if (
      Math.abs(box.x) + box.w / 2 > store.room.width / 2 ||
      Math.abs(box.z) + box.d / 2 > store.room.depth / 2
    )
      throw Error("Fixture extends outside the shop.");
    for (const aisle of store.aisles) {
      if (Math.min(aisle.w, aisle.d) < 1.5) throw Error("Reserved aisle is narrower than 1.5 m.");
      if (rectanglesOverlap(box, aisle)) throw Error("A fixture blocks a reserved aisle.");
    }
  }
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++)
      if (rectanglesOverlap(boxes[i], boxes[j])) throw Error("Fixtures overlap.");
  return { summary: plan.summary.trim(), placements: plan.placements.map((p) => ({ ...p })) };
}
export function metrics(store, plan) {
  validatePlan(store, plan);
  const coffee = footprints(store, plan).find((f) => f.id === "coffee");
  return {
    coffeeDistance: Math.hypot(coffee.x - store.entrance.x, coffee.z - store.entrance.z),
    moved: plan.placements.filter(
      (p) => store.current.placements.find((c) => c.fixtureId === p.fixtureId)?.bayId !== p.bayId,
    ).length,
    aisleWidth: Math.min(...store.aisles.map((a) => Math.min(a.w, a.d))),
  };
}
export function canStand(store, plan, x, z, radius = 0.25) {
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(z) ||
    Math.abs(x) > store.room.width / 2 - radius ||
    Math.abs(z) > store.room.depth / 2 - radius
  )
    return false;
  return !footprints(store, plan).some(
    (b) => Math.abs(x - b.x) < b.w / 2 + radius && Math.abs(z - b.z) < b.d / 2 + radius,
  );
}
export function movePosition(store, plan, position, yaw, forward, side, distance) {
  let { x, z } = position;
  const length = Math.hypot(forward, side) || 1;
  const steps = Math.max(1, Math.ceil(Math.abs(distance) / 0.08));
  const dx = (((-Math.sin(yaw) * forward + Math.cos(yaw) * side) / length) * distance) / steps;
  const dz = (((-Math.cos(yaw) * forward - Math.sin(yaw) * side) / length) * distance) / steps;
  for (let i = 0; i < steps; i++) {
    if (canStand(store, plan, x + dx, z)) x += dx;
    if (canStand(store, plan, x, z + dz)) z += dz;
  }
  return { x, z };
}
