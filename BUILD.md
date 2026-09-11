# Build notes — 3D LAB // 002

## Product boundary

The POC tells one sequence:

```text
Shop image → shopper-flow video → visible observations → one layout edit → revised video
```

The videos are qualitative concept simulations. The app never calls them analytics and does not calculate traffic, dwell time, conversion, sales uplift, accessibility or code compliance.

A selected local image is shown with `URL.createObjectURL` and never leaves the browser. The public app exports a generation brief instead of hiding an undocumented or credential-dependent vendor call behind the upload button.

## Sample generation record — 11 September 2026

The two start frames were generated with GPT Image 2 through Higgsfield at 2K, medium quality and 16:9. Each image cost 2 credits.

The two 8-second videos were generated with Higgsfield Cinema Studio Video in standard mode, silent, 16:9, fixed-camera prompts. Each video cost 8 credits.

A Seedance 2.5 preflight estimated 52 credits for one 8-second 720p run. The subsequent submission was refused because Plus was required; no Seedance job was created and no video credits were charged. Cinema Studio accepted the same core brief on Starter and produced the bundled results.

Generation IDs and exact prompts are recorded in [docs/higgsfield.md](docs/higgsfield.md).

## What was reviewed

- Source and revised frames use the same viewpoint and fixed checkout.
- Current video includes natural-looking adult shoppers and shows route convergence beside the island.
- Revised video was reviewed for a visibly open centre route.
- Both MP4s play, seek and switch in the local app.
- The server returns valid 206 responses for MP4 byte ranges.
- Desktop and 390 px mobile layouts have no horizontal overflow.
- All Instagram slides are exactly 1080 × 1350 and keep key text inside a 90 px safe margin.

## Official references checked

- [How do I use Cinema Studio?](https://higgsfield.ai/creator-hub/help-center/tools/how-do-i-use-cinema-studio) — references, camera, lens and lighting controls.
- [Which Higgsfield tool should I use?](https://higgsfield.ai/creator-hub/help-center/tools/which-higgsfield-tool-should-i-use) — current product routing guidance.
- [How do I connect Higgsfield to my AI agent?](https://higgsfield.ai/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent) — connected generation flow and credit charging.

Vendor capabilities, prices and plan gates can change; check the current model picker and estimate before generating.

## Architecture

The app is plain HTML, CSS and JavaScript behind a small Node HTTP server. It has no runtime package dependency and no build step. The server accepts only GET and HEAD, blocks paths outside `public`, sets basic security headers, and implements byte ranges for MP4 playback.

The image upload is intentionally local-only. A production version could put authenticated generation behind a server-side queue, but it should also add user consent, durable storage rules, cost limits, moderation and a review step before presenting conclusions.
