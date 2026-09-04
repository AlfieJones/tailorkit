const runtime = globalThis.__tailorkitSandboxRuntime;
const { h, render } = runtime.preact;
const { useState } = runtime.hooks;
const { version: preactVersion } = runtime.packageJson;

function remoteButton({ children, onClick }) {
  const eventName = "tailorkitcallbackonclick";
  return h(
    "tailorkit-button",
    {
      "data-tailorkit-callbacks": JSON.stringify({
        [eventName]: { callback: "onClick", inputCount: 0 },
      }),
      [`on${eventName}`]: () => onClick(),
    },
    children,
  );
}

function RenewalCoach() {
  const [reviewed, setReviewed] = useState(false);
  return h(
    "tailorkit-flex",
    { direction: "column", gap: "md", padding: "md", width: "full" },
    h("tailorkit-box", { textColor: "default" }, "Renewal signals"),
    h(
      "tailorkit-flex",
      { direction: "column", gap: "xs", padding: "md", radius: "md", background: "muted" },
      h("tailorkit-box", { textColor: "muted" }, "LUMA HEALTH · RENEWS IN 24 DAYS"),
      h("tailorkit-box", { textColor: "default" }, "Health score: 72 / 100"),
      h(
        "tailorkit-box",
        { textColor: "muted" },
        "Usage is up 18%, but no executive touchpoint is scheduled.",
      ),
    ),
    h(
      "tailorkit-flex",
      { direction: "column", gap: "xs" },
      h("tailorkit-box", { textColor: "default" }, "Recommended next step"),
      h("tailorkit-box", { textColor: "muted" }, "Send a value recap before Friday."),
    ),
    h(
      remoteButton,
      { onClick: () => setReviewed(true) },
      reviewed ? "Plan reviewed ✓" : "Mark plan reviewed",
    ),
  );
}

export default {
  $meta: { preactVersion },
  $runtime: { h, render },
  screens: { "/": { component: RenewalCoach, path: "/" } },
};
