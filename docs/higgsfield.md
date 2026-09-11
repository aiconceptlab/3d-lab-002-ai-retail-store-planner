# Optional 3D Jutsu workflow

The starter itself renders with Three.js. Both scenes are supplied as GLB files under `public/assets/`. They are actual exports of the same geometry used by the app.

## Verified release scene

The completed vendor scene is named **3D LAB 002 — AI Retail Store Planner**:

https://higgsfield.ai/3d-jutsu/dedde3ff-5ea4-455c-a369-4c5e459e4eac

It was created in a Starter-enabled account with the model selector showing **Auto · Free** and generation set to Allow mode. The build used editable primitive geometry and solid materials. It did not request external images, video, audio or textures.

The final verification pass reported 392 objects, a clear 1.5 m central aisle, clear cross-aisles, a clear queue zone and four fixture groups inside their planned footprints. Higgsfield rebuilt the scene after detecting that its first box helper anchored geometry at corners. The corrected build reached revision 12 before verification.

Two direct captures are supplied in `marketing/screenshots/`: the full editor state and a clean entrance-camera crop. The second overview camera exists but its saved composition points into the ceiling, so it is not used as promotional evidence. The open-source app's measured floor plan remains the reliable layout comparison.

The social cover uses Higgsfield's current official icon from `https://higgsfield.ai/icon.png`, paired with the text “Higgsfield 3D Jutsu · Auto”.

GPT-6 Astra was not used for this 3D Jutsu scene. Do not attribute the vendor output to Astra.

## Reusable scene brief

The original brief is preserved below so the experiment can be repeated. Check the model label and displayed cost before a new run.

```text
Build a premium but simple editable 3D retail concept called DAILY / coffee & provisions. Use primitive geometry and solid materials only; do not generate images, video, audio, textures or external paid assets. This is an AI concept visualization, not proven sales optimization.

Create two labelled comparison groups, CURRENT and AI LAYOUT, with the same 8 m × 10 m store and 3.4 m height. Keep local coordinates for each room: x from -4 to 4, z from -5 (rear) to 5 (entrance), floor y=0.

Fixed checkout in both: centre x=2.25, z=-4.15, footprint 2.2 × 0.8 m, height 1.05 m. Never move it.
Three display bays: front-left (-2.25,2.6), front-right (2.25,2.6), rear-left (-2.25,-2.6).
Coffee and pantry displays: footprint 1.4 × 1.2 m, height 1.65 m. Brewing display: same footprint, height 1.25 m.
CURRENT: coffee rear-left, pantry front-left, brew front-right.
AI LAYOUT: coffee front-left, pantry rear-left, brew front-right.

Keep the full 1.5 m central aisle (x -0.75 to 0.75), full 1.5 m cross aisle (z -0.75 to 0.75), and checkout approach (x -0.75 to 3.95, z -3.5 to -2.0) free of fixtures. Colour these floor overlays pale teal for inspection. Do not add plants or stools in these routes.

Warm oak shelving, cream floor, forest-green checkout, copper coffee packaging, simple pendant lights. Use existing mesh objects. Clear named groups, overview cameras and eye-level entrance cameras for both layouts. Do not claim increased conversion or revenue. The goal is to bring the coffee display closer to the entrance while preserving the constraints.
```

## Attribution rule

Capture the actual scene and record the model used. Compare checkout coordinates and aisle routes with the supplied JSON. If the output differs, label it as an illustrative vendor rendering rather than verified dimensional evidence. Do not claim GPT-6 Astra created an Auto-selected output.

Use the original vendor logo assets only when appropriate, with AI Concept Lab remaining the primary brand. A model's availability in a menu is not evidence that it generated this project's scene.
