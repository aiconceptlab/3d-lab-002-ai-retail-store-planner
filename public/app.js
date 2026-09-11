const $ = (id) => document.getElementById(id);
const views = {
  current: { video: "/assets/current-flow.mp4", poster: "/assets/current-shop.png", label: "CURRENT LAYOUT · SAMPLE RUN" },
  revised: { video: "/assets/revised-flow.mp4", poster: "/assets/revised-shop.png", label: "REVISED LAYOUT · SAMPLE RUN" },
};
let sourceUrl = null;

function setView(name, autoplay = false) {
  const video = $("simulation");
  const view = views[name];
  video.pause();
  video.poster = view.poster;
  video.src = view.video;
  video.load();
  $("run-label").textContent = view.label;
  document.querySelectorAll("[data-view]").forEach((button) =>
    button.setAttribute("aria-pressed", String(button.dataset.view === name)),
  );
  if (autoplay) video.play().catch(() => {});
}

document.querySelectorAll("[data-view]").forEach((button) =>
  button.addEventListener("click", () => setView(button.dataset.view, true)),
);
$("run-button").addEventListener("click", () => setView("current", true));
$("apply-button").addEventListener("click", () => {
  setView("revised", true);
  $("simulation").scrollIntoView({ behavior: "smooth", block: "center" });
});

function useSample() {
  if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  sourceUrl = null;
  $("shop-file").value = "";
  $("source-preview").src = "/assets/current-shop.png";
  $("source-preview").alt = "Included coffee shop source image";
  $("source-label").textContent = "SAMPLE SOURCE";
  $("source-name").textContent = "coffee-shop.png";
  $("run-button").innerHTML = "Run sample simulation <span>→</span>";
  $("upload-note").textContent =
    "The included run was generated with Higgsfield. A selected image stays in your browser; use the exported brief to generate a new run.";
}

$("sample-button").addEventListener("click", useSample);
$("shop-file").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/") || file.size > 15 * 1024 * 1024) {
    $("upload-note").textContent = "Choose a PNG, JPG or WebP image up to 15 MB.";
    return;
  }
  if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  sourceUrl = URL.createObjectURL(file);
  $("source-preview").src = sourceUrl;
  $("source-preview").alt = `Local preview of ${file.name}`;
  $("source-label").textContent = "LOCAL PREVIEW";
  $("source-name").textContent = file.name;
  $("run-button").innerHTML = "Preview included simulation <span>→</span>";
  $("upload-note").textContent =
    "Your file remains local. Download the generation brief below, then add your Higgsfield result to public/assets to create a custom run.";
});

$("brief-button").addEventListener("click", () => {
  const goal = $("goal").value.trim();
  const brief = `AI RETAIL FLOW SIMULATOR — HIGGSFIELD BRIEF

SOURCE
Use one wide shop photo or floor plan as the starting image.

GOAL
${goal}

CURRENT RUN
Use the supplied shop image as a locked, fixed high-corner camera. Preserve the architecture, fixtures, products, entrance and checkout exactly. Add five generic adult shoppers entering, browsing and queuing naturally. Make path convergence and pauses visible. Realistic walking speed; no camera movement, cuts, text, graphics, new furniture or distorted bodies.

REVIEW
Record only visible observations. Treat them as layout hypotheses, not measured customer analytics.

REVISED RUN
Edit one layout feature while keeping the camera, room and checkout fixed. Generate the same shopper scenario again for a side-by-side concept comparison.
`;
  const url = URL.createObjectURL(new Blob([brief], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "higgsfield-retail-flow-brief.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

useSample();

const captureView = new URLSearchParams(location.search).get("autoplay");
if (captureView === "current" || captureView === "revised") {
  setView(captureView, true);
  requestAnimationFrame(() => $("simulation").scrollIntoView({ block: "center" }));
}
