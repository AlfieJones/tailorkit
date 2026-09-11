export function mount({ root }) {
  root.replaceChildren();
  const layout = document.createElement("tailorkit-flex");
  layout.setAttribute("direction", "column");
  layout.setAttribute("gap", "md");
  const heading = document.createElement("tailorkit-box");
  heading.textContent = "Messages";
  const button = document.createElement("tailorkit-button");
  button.setAttribute(
    "data-tailorkit-callbacks",
    JSON.stringify({ tailorkitcallbackonclick: { callback: "onClick", inputCount: 0 } }),
  );
  button.textContent = "Mark as read";
  button.addEventListener("tailorkitcallbackonclick", () => {
    button.textContent = "All caught up ✓";
  });
  layout.append(heading, button);
  root.append(layout);
}
