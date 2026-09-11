export function mount({ root, props = {} }) {
  root.replaceChildren();
  const layout = document.createElement("tailorkit-flex");
  layout.setAttribute("direction", "column");
  layout.setAttribute("gap", "md");
  const heading = document.createElement("tailorkit-box");
  heading.textContent = props.title || "Tasks";
  const button = document.createElement("tailorkit-button");
  button.setAttribute(
    "data-tailorkit-callbacks",
    JSON.stringify({ tailorkitcallbackonclick: { callback: "onClick", inputCount: 0 } }),
  );
  button.textContent = "Add task";
  button.addEventListener("tailorkitcallbackonclick", () => {
    button.textContent = "Task added ✓";
  });
  layout.append(heading, button);
  root.append(layout);
}
