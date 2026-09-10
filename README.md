# 3D LAB // 002 — AI Retail Store Planner

**Give a shop a goal: sell more coffee. Explore a different layout.**

A small, runnable retail concept with a walkable 3D shop, Current / AI Layout comparison, measured floor plan, and an optional GPT-6 Astra layout planner. Part of [AI Concept Lab](https://github.com/aiconceptlab).

![Actual app screenshot showing the sample proposal, fixed checkout and reserved circulation routes](marketing/screenshots/app-desktop.png)

**This is AI concept visualization. It does not predict or prove sales uplift.** The default demo is a clearly labelled, pre-authored example. Live mode asks a model to assign existing fixtures to existing bays, then validates the result before showing it.

## Run in two minutes

Install Node.js 24, then:

```sh
npm ci
npm start
```

Open http://127.0.0.1:3014. No credentials or external services are needed for demo mode. The application serves Three.js locally; it does not depend on a runtime CDN.

1. Click **Explore sample proposal**.
2. Compare **Current** and **AI Layout · sample**.
3. Select **Walk inside**; drag to look and use WASD, arrow keys or the on-screen buttons to move. Escape returns to overview.
4. Turn on **Show aisles** and inspect the measured floor plan.
5. Export layout JSON, a PNG view, or either included GLB scene.

## The experiment

The fictional DAILY shop is 8 × 10 m. It contains a coffee display, pantry display, brewing display and fixed checkout. The sample swaps coffee and pantry:

| Check                          | Current | Sample proposal |
| ------------------------------ | ------: | --------------: |
| Coffee distance from entrance* |   7.9 m |           3.3 m |
| Fixtures moved                 |       0 |               2 |
| Checkout                       |   Fixed |           Fixed |
| Minimum reserved aisle width   |   1.5 m |           1.5 m |

_Euclidean distance between entrance centre and display centre, not walking distance, visibility, footfall or revenue. High/standard margins are fictional category labels, not real commercial data._

Blue floor-plan areas are explicit reserved routes: the entrance spine, cross aisle and checkout approach. Fixtures cannot intrude into those rectangles. This is a geometry check for a simplified model, not an accessibility or building-code certification. A real project needs surveyed dimensions, door swings, queues, staff areas and local requirements.

## Optional live AI planning

Copy `.env.example` to `.env`, then set:

```dotenv
AI_MODE=openai
OPENAI_MODEL=gpt-6-astra
OPENAI_API_KEY=your_local_key
PLANNER_TOKEN=your_random_access_token_at_least_32_characters
```

Restart the server. Enter your planner token in **Live planning access**. The API key stays on the server; the access token is held only in page memory. Generate a random token with:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Live requests use the OpenAI Responses API with strict structured output, low reasoning effort and `store: false`. Each click makes at most one provider request, with a 45-second timeout, a 30-second cooldown and one request in flight. Invalid geometry, refusals and incomplete responses keep the previous layout. API access and billing are separate from a Higgsfield subscription. Live GPT-6 Astra output was not exercised with a paid account during this release; request/response handling is tested with fixtures.

Demo mode always loads the coffee example, even if you edit the goal. Live mode is required to interpret a custom goal. Neither mode can add fixtures or redesign the room: the deliberately small search space is six permutations of three display bays.

## Higgsfield workflow

This release includes two actual GLB scenes and a prepared scene brief in [docs/higgsfield.md](docs/higgsfield.md). Higgsfield is an optional editorial/visualization workflow, not a hidden backend dependency. No undocumented 3D Jutsu API is called. A successful vendor generation and a specific model attribution must be verified before using “Powered by Higgsfield + GPT-6 Astra” on promotional material.

## Check and modify

```sh
npm run check
npm run export:scenes
```

The 19 tests cover geometry, fixed checkout, every bay permutation, walking bounds, Responses request format, invalid/provider-error responses, HTTP access controls, paid-call cooldown and the actual GLB transforms. CI runs on Windows and Linux.

Edit `data/store.json` for fixtures and bay positions, `public/scene-factory.js` for geometry, and `public/style.css` for appearance. Run the exporter after changing the data or scene factory so the downloadable GLBs match. Canvas text labels are added by the web viewer; exported GLBs contain geometry and named fixture nodes, without those canvas labels.

See [BUILD.md](BUILD.md) for architecture, verified references and limitations. Instagram assets and caption live in `marketing/`.

## Public deployment

The default server binds to loopback. It is a local POC, not a hosted multi-user service. If you expose live mode, use HTTPS, real user authentication, provider spend limits and durable rate limiting. The included access token and in-memory cooldown are suitable for a controlled demonstration only. No CRM, sales data, visitor tracking or analytics integration is included.

## License

MIT for the original starter code and original project assets. Three.js is MIT licensed. Vendor names are used descriptively; no affiliation or endorsement is implied.
