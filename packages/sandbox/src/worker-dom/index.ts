import { createDocument } from "./document.js";
import { Element } from "./element.js";
import type { Node } from "./node.js";
import { Text } from "./text.js";

const ROOT_HTML_PATTERN = /<([a-z][\w-]*)([^>]*)id=["']root["']([^>]*)>/i;

export interface WorkerDOMOptions {
  html?: string;
}

export function createWorkerDOM(options: string | WorkerDOMOptions = '<div id="root"></div>') {
  const resolvedOptions = typeof options === "string" ? { html: options } : options;
  const document = createDocument();
  const previousGlobals = installGlobals(document.defaultView);
  const root = createRoot(document, resolvedOptions.html ?? '<div id="root"></div>');

  return {
    document,
    root,
    html() {
      return document.body?.childNodes.map(serializeNode).join("") ?? "";
    },
    cleanup() {
      restoreGlobals(previousGlobals);
    },
  };
}

type WorkerGlobalKey =
  | "document"
  | "Document"
  | "Node"
  | "Text"
  | "Element"
  | "Event"
  | "requestAnimationFrame"
  | "cancelAnimationFrame"
  | "window";

function createRoot(document: ReturnType<typeof createDocument>, html: string): Element {
  const match = ROOT_HTML_PATTERN.exec(html);
  const root = document.createElement(match?.[1] ?? "div");
  root.setAttribute("id", "root");
  document.body?.append(root);
  return root;
}

function installGlobals(
  defaultView: Record<string, unknown>,
): Partial<Record<WorkerGlobalKey, unknown>> {
  const previous: Partial<Record<WorkerGlobalKey, unknown>> = {};
  const globals = globalThis as Record<string, unknown>;
  previous.window = globals.window;
  for (const key of Object.keys(defaultView) as WorkerGlobalKey[]) {
    previous[key] = globals[key];
    globals[key] = defaultView[key];
  }
  globals.window = defaultView;
  return previous;
}

function restoreGlobals(previous: Partial<Record<WorkerGlobalKey, unknown>>): void {
  const globals = globalThis as Record<string, unknown>;
  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) {
      Reflect.deleteProperty(globals, key);
    } else {
      globals[key] = value;
    }
  }
}

function serializeNode(node: Node): string {
  if (node instanceof Text) {
    return escapeHtml(node.data);
  }
  if (node instanceof Element) {
    const tag = node.localName;
    const attrs = node.attributes.map(serializeAttribute).join("");
    const children = node.childNodes.map(serializeNode).join("");
    return `<${tag}${attrs}>${children}</${tag}>`;
  }
  return "";
}

function serializeAttribute(attribute: { name: string; value: string }): string {
  return ` ${attribute.name}="${escapeAttribute(attribute.value)}"`;
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replaceAll('"', "&quot;");
}
