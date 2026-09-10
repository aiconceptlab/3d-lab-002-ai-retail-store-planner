# Instagram upload — 3D LAB // 002

Upload only the five numbered PNG files in `instagram-4x5`, in numerical order. Each is exactly **1080 × 1350 pixels (4:5)**. Select 4:5 on the first slide and apply the same ratio to the carousel. These are not 3:4 exports and require no crop. Do not upload the SVG source files or a contact sheet.

AI CONCEPT LAB and the series badge are inset at least 78 px from the top; the layout uses 90 px side margins. Footer text is inside the bottom safe area. If the upload UI zooms in, reset its crop before posting.

Use `caption.txt` as the caption. The last slide asks viewers to comment CODE. Nothing has been posted to Instagram automatically.

## Provenance

The room images are actual renders captured from the working Three.js app. The labelled AI Layout is the included sample proposal, not a paid live generation. Floor plans are drawn directly from the checked store JSON. The source SVG layouts and `render.mjs` make the graphics editable and reproducible.

These images do not depict a completed Higgsfield generation. Vendor logos and “Powered by Higgsfield + GPT-6 Astra” are intentionally reserved for a release with verified vendor output. GPT-6 Astra appears as the optional planner actually supported by this starter.

## Re-render

```sh
npm ci
node marketing/render.mjs
```

Rendering uses the pinned development dependency `@resvg/resvg-js` and local system fonts (Arial preferred). Inspect text spacing if substituting fonts. PNGs are supplied ready to upload.

## Suggested alt text

1. AI Concept Lab retail planner cover with an actual 3D render of a small coffee shop and the hook about selling more coffee. Clearly labelled concept visualization and sample layout.
2. Two measured floor plans compare coffee at the rear with coffee near the entrance. Straight-line distance changes from 7.9 to 3.3 metres; no sales improvement is claimed.
3. Floor plan highlights a fixed checkout, reserved 1.5-metre aisles and unchanged fixtures.
4. Build diagram: shop JSON and goal, optional GPT-6 Astra planner, geometry validation, interactive Three.js viewer.
5. Free source-code invitation with a store render and the instruction to comment CODE for the link.
