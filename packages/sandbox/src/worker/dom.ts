import { createDocument } from "../worker-dom/document.js";

export function createWindow() {
  return createDocument().defaultView;
}
