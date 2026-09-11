export function mount({ root }) {
  root.replaceChildren();
  const layout = document.createElement("tailorkit-flex");
  layout.setAttribute("direction", "column");
  layout.setAttribute("gap", "md");
  layout.setAttribute("padding", "md");
  const title = document.createElement("tailorkit-box");
  title.setAttribute("textColor", "default");
  title.textContent = "Payments, at a glance";
  const summary = document.createElement("tailorkit-box");
  summary.setAttribute("textColor", "muted");
  summary.textContent = "MONTHLY RECURRING REVENUE · $18,480 · ↑ 14% from last month";
  const button = document.createElement("tailorkit-button");
  button.setAttribute(
    "data-tailorkit-callbacks",
    JSON.stringify({ tailorkitcallbackonclick: { callback: "onClick", inputCount: 0 } }),
  );
  button.addEventListener("tailorkitcallbackonclick", () => {
    button.textContent =
      button.textContent === "Connect Stripe" ? "Stripe connected ✓" : "Connect Stripe";
  });
  button.textContent = "Connect Stripe";
  layout.append(title, summary, button);
  root.append(layout);
}
