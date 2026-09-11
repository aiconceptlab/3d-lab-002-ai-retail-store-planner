# Build notes — 3D LAB // 002

## Architecture

`Store JSON + goal → optional Responses planner → validation → Three.js viewer + measured SVG plan`

The model returns only `{ summary, placements: [{ fixtureId, bayId }] }`. It never produces executable code. Three movable fixtures occupy three immutable bays; checkout is pinned to its original bay. Every returned object and position is checked against the catalogue. Model prose goes into `textContent`, never HTML.

The geometry module is shared by the browser, HTTP server, tests and GLB exporter. Validation rejects unknown or repeated IDs, duplicate bay occupancy, moved checkout, fixtures outside the room, overlapping fixtures, reserved routes narrower than 1.5 m and route intrusions. Movement uses padded fixture rectangles and bounded 50 ms steps to prevent crossing a display at ordinary walking speed.

The free demonstration has a pre-authored proposal and makes zero AI requests. It visibly labels its provenance. Live mode uses `gpt-6-astra`; the model is configurable but is never silently replaced. There is no automatic retry or fallback masquerading as live AI.

## Official integration references checked 10 September 2026

- [GPT-6 Astra model documentation](https://developers.openai.com/api/docs/models/gpt-6-astra): model ID, Responses support, structured output, low reasoning effort.
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs): strict JSON schema in Responses `text.format`.
- [Higgsfield 3D Jutsu overview](https://higgsfield.ai/blog/higgsfield-3d-jutsu): editable scene workflow and GLB exports.
- [Higgsfield plans](https://higgsfield.ai/creator-hub/help-center/plans/how-do-higgsfield-plans-work): model access depends on plan and rollout.
- [Higgsfield credit packs](https://higgsfield.ai/creator-hub/help-center/credits/how-credit-packs-work): extra credits do not unlock plan features.

No public 3D Jutsu REST endpoint was verified. The repository works without Higgsfield and does not call private browser endpoints.

## Local verification

- Node.js 24.10.0 on Windows; dependency installation completed with zero reported vulnerabilities.
- 20 automated tests pass, including both binary GLB files and their fixture transforms.
- Browser comparison shows 7.9 m / 3.3 m entrance-distance values, two moved fixtures, fixed checkout and 1.5 m reserved routes.
- Desktop and mobile visual checks, walking controls, fixture selection and artifact exports are part of the release review.
- Live Responses calls are mocked in tests. No paid OpenAI request was made for release verification.
- A Starter-enabled Higgsfield account was used to complete one editable 3D Jutsu scene with **Auto · Free**. The corrected scene reached revision 12, contained 392 objects during the verification pass, and reported zero intrusions in the 1.5 m central aisle, both cross-aisles and the queue zone.
- The named vendor project, entrance camera and editor state were visually checked. The supplied screenshots are direct captures of that project. GPT-6 Astra was not used for the vendor scene.

## What this does not measure

The display-distance value is not an exposure score. This POC has no sight-line calculation, customer simulation, traffic data, A/B test, commercial optimizer or code-compliance engine. The proposal is a plausible merchandising hypothesis, not a result from a validated retail model. Verify aisle dimensions independently for a real building.

## File map

- `data/store.json`: fictional shop, fixtures, bays, reserved routes and two layouts.
- `public/planner.js`: geometry validation, metrics and walking bounds.
- `public/scene-factory.js`: reproducible scene geometry.
- `public/app.js`: view switching, movement, inspection, plan requests and PNG/JSON exports.
- `lib/ai.mjs`: one Responses request and strict response validation.
- `server.mjs`: static allowlist, bounded JSON input, live access token and cooldown.
- `scripts/export-scenes.mjs`: Node-side GLB export, using a small Blob/FileReader bridge.
- `tests/planner.test.mjs`: meaningful success and failure checks.

The rate limit is intentionally process-local. Restarting the server resets it. Do not expose paid mode publicly without a production authentication and budget layer.

Final visual review: the 390 px mobile layout has no horizontal overflow; the overview camera now fits the complete shop. Both layout switches, the aisle overlay and fixture inspection were exercised in Edge. Actual view PNGs and a mobile browser capture are in marketing/screenshots/. The supplied carousel was visually reviewed slide by slide and checked at 1080 × 1350.

Detail update: modeled resealable coffee bags, pantry jars, hollow mugs with handles, gooseneck kettles, pour-over equipment, espresso machine, POS terminal, shelf tickets, fluted joinery, board flooring, brass trim, pendant diffusers and raised mesh signage. Added a test of the actual scene bounds against every fixture footprint. The open-source app and supplied GLBs remain fully local; the optional vendor scene was created separately in Higgsfield.
