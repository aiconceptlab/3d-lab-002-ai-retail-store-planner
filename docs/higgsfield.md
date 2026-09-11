# Higgsfield reproduction guide

This project uses one fixed-camera shop image, one layout edit and two matched shopper-flow videos.

## Current source frame

- Model: `gpt_image_2`
- Job: `b237e2de-c79e-4e91-a9b9-61ab24ea2042`
- Settings: 16:9, 2K, medium quality
- Recorded cost: 2 credits

Prompt:

> Photorealistic wide-angle interior photograph of a compact premium coffee retail shop, viewed from a fixed high corner security-camera position so the complete customer path is easy to read. No people. Entrance in the front-left foreground, checkout counter fixed at the back-right, premium coffee shelves and beans display at the back-left, and a large freestanding promotional island near the entrance that visibly narrows the main route and creates a crossing point near the checkout queue. Warm oak shelving, deep teal walls, cream stone, realistic commercial lighting, polished concrete floor, credible real-world retail design, clean but fully stocked. Natural perspective, architectural photography, no text, no logos, no arrows, no floorplan overlay.

## Current shopper-flow run

- Model: `cinematic_studio_video_v2`
- Job: `af0727a7-67f4-4999-bc22-ebbf3629dccf`
- Settings: 16:9, 8 seconds, standard mode, sound off, linear speed, one shot, CFG 0.7
- Recorded cost: 8 credits

Prompt:

> Use the supplied shop photograph as a locked, fixed high-corner camera. Preserve the architecture, shelves, products, central display island, entrance and checkout exactly. Simulate natural shopper use with five generic adult customers: two enter from the left doorway, one pauses at the central island, one crosses toward the back coffee wall, and one queues at the checkout. Their paths briefly converge around the near end of the central island, making the circulation bottleneck visible. Realistic walking speed and body motion, believable retail behavior, no one looks at camera, no camera movement, no zoom, no scene cuts, no text, no graphics, no new furniture.

## Revised frame

- Model: `gpt_image_2`
- Job: `ea7833b8-6ae9-4e03-8db2-6201249325d9`
- Settings: 16:9, 2K, medium quality, current frame as reference
- Recorded cost: 2 credits

Prompt:

> Edit this exact shop photograph into a revised layout while preserving the same fixed high-corner camera, room architecture, entrance, checkout counter, wall shelving, lighting, colors and product style. Remove the large freestanding island from the middle of the floor. Replace it with one slim low display table running along the right-hand perimeter before the checkout, leaving a wide uninterrupted central path from the left entrance to the back wall. Add a small clearly organized queue rail beside the checkout that does not cross the entrance path. Keep the shop photorealistic, fully stocked and believable. No people, no text, no logos, no arrows, no overlay, no camera change.

## Revised shopper-flow run

- Model: `cinematic_studio_video_v2`
- Job: `f591b11e-d238-46d8-bec9-02ae01eee7f3`
- Settings: 16:9, 8 seconds, standard mode, sound off, linear speed, one shot, CFG 0.7
- Recorded cost: 8 credits

Prompt:

> Use the supplied revised shop photograph as a locked, fixed high-corner camera. Preserve the architecture, shelves, products, open central floor, perimeter display, queue rail, entrance and checkout exactly. Simulate the same natural shopper scenario with five distinct generic adult customers: two enter from the left doorway, one walks directly toward the back coffee wall, one browses the low right-side display, and one joins the organized checkout queue. Keep the broad central route visibly open and show people passing without converging at one pinch point. Realistic walking speed and body motion, believable retail behavior, no one looks at camera, no camera movement, no zoom, no scene cuts, no text, no graphics, no new furniture.

## Using your own shop

1. Pick a wide photograph that shows the entrance, key displays and checkout. A simple plan also works, but use the same visual style for both runs.
2. Keep the camera locked. Movement between cameras makes comparison harder.
3. Describe a small set of shopper actions that reveal the route you want to inspect.
4. Write observations from what is actually visible. Avoid invented counts or conversion claims.
5. Change one layout feature, preserve fixed elements, and run the same shopper scenario again.
6. Put the outputs in `public/assets` as `current-shop.png`, `current-flow.mp4`, `revised-shop.png` and `revised-flow.mp4`.

Generation is probabilistic. Inspect hands, bodies, fixtures and continuity before publishing.
