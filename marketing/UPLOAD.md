# Instagram upload — 3D LAB // 002

Upload only the five numbered PNG files in `instagram-4x5`, in numerical order. Each is exactly **1080 × 1350 pixels (4:5)**. Select 4:5 on the first slide and apply the same ratio to the carousel. These are not 3:4 exports and require no crop. Do not upload the SVG source files or a contact sheet.

AI CONCEPT LAB and the series badge are inset at least 78 px from the top; the layout uses 90 px side margins. Footer text is inside the bottom safe area. If the upload UI zooms in, reset its crop before posting.

Use `caption.txt` as the caption. The last slide asks viewers to comment CODE. Nothing has been posted to Instagram automatically.

## Provenance

The room images are actual renders captured from the working Three.js app. The cover is a direct capture of the named Higgsfield 3D Jutsu project. The labelled AI Layout is the included sample proposal, not a claim of proven retail optimization. Floor plans are drawn directly from the checked store JSON. The source SVG layouts and `render.mjs` make the graphics editable and reproducible.

The vendor scene was generated with the model selector showing **Auto · Free** in a Starter-enabled account. The cover therefore says **Higgsfield 3D Jutsu · Auto**. Do not replace that attribution with GPT-6 Astra; Astra is supported only as the starter's optional live layout planner and was not used for the vendor scene.

## Re-render

```sh
npm ci
node marketing/render.mjs
```

Rendering uses the pinned development dependency `@resvg/resvg-js` and local system fonts (Arial preferred). Inspect text spacing if substituting fonts. PNGs are supplied ready to upload.

## Suggested alt text

1. AI Concept Lab retail planner cover with a real Higgsfield 3D Jutsu editor capture, the hook about selling more coffee and an Auto model attribution.
2. Two measured floor plans compare coffee at the rear with coffee near the entrance. Straight-line distance changes from 7.9 to 3.3 metres; no sales improvement is claimed.
3. Floor plan highlights a fixed checkout, reserved 1.5-metre aisles and unchanged fixtures.
4. Build diagram: retail brief, Higgsfield 3D Jutsu Auto scene, geometry validation and interactive Three.js viewer.
5. Free source-code invitation with a store render and the instruction to comment CODE for the link.
