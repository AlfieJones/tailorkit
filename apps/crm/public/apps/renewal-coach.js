export function mount({ root }) {
  root.replaceChildren();
  const layout = document.createElement("tailorkit-flex");
  layout.setAttribute("direction", "column");
  layout.setAttribute("gap", "md");
  layout.setAttribute("padding", "md");
  const title = document.createElement("tailorkit-box");
  title.setAttribute("textColor", "default");
  title.textContent = "Renewal signals";
  const summary = document.createElement("tailorkit-box");
  summary.setAttribute("textColor", "muted");
  summary.textContent = "LUMA HEALTH · RENEWS IN 24 DAYS · Health score: 72 / 100";
  const button = document.createElement("tailorkit-button");
  button.setAttribute(
    "data-tailorkit-callbacks",
    JSON.stringify({ tailorkitcallbackonclick: { callback: "onClick", inputCount: 0 } }),
  );
  button.addEventListener("tailorkitcallbackonclick", () => {
    button.textContent = "Plan reviewed ✓";
  });
  button.textContent = "Mark plan reviewed";
  layout.append(title, summary, button);
  root.append(layout);
}
