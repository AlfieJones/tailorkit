import { getViewHierarchy } from "@tailorkit/core/views";
import type { ActiveView, ViewStatus } from "@tailorkit/core/views";

export interface ViewRequest extends ActiveView {
  slot: string;
  declaredViews: readonly string[];
  supportedViews: readonly string[];
}

export type ResolvedViewProps =
  | { view: string; status: "ready"; context: Record<string, unknown> }
  | { view: string; status: "loading" | "error"; context?: never };

export interface AppViewDefinition {
  component: (props: ResolvedViewProps) => unknown;
}

export interface AppClient {
  slots: Record<string, Record<string, AppViewDefinition | false>>;
  $runtime: {
    h: (component: AppViewDefinition["component"], props: ResolvedViewProps) => unknown;
    render: (node: unknown, root: Element) => void;
  };
}

export function resolveView(client: AppClient, request: ViewRequest) {
  const views = client.slots[request.slot];
  const selected =
    views &&
    getViewHierarchy(request.view).find(
      (path) => request.supportedViews.includes(path) && Object.hasOwn(views, path),
    );
  if (!selected || views[selected] === false) {
    return null;
  }
  const definition = views[selected];
  if (!definition || typeof definition.component !== "function") {
    throw new TypeError(`TailorKit app client view "${selected}" is missing a component.`);
  }

  return { component: definition.component, props: composeViewContext(selected, request) };
}

function composeViewContext(selected: string, request: ViewRequest): ResolvedViewProps {
  let status: ViewStatus = "ready";
  const context: Record<string, unknown> = {};
  for (const path of getViewHierarchy(selected).toReversed()) {
    const layer = request.layers.find((entry) => entry.path === path);
    if (!layer) {
      if (request.declaredViews.includes(path) || path === selected) {
        status = "error";
      }
      continue;
    }
    if (layer.status === "error") {
      status = "error";
    } else if (layer.status === "loading" && status !== "error") {
      status = "loading";
    }
    if (layer.status !== "ready" || layer.context === undefined) {
      continue;
    }
    if (
      layer.context === null ||
      typeof layer.context !== "object" ||
      Array.isArray(layer.context)
    ) {
      status = "error";
      continue;
    }
    for (const [key, value] of Object.entries(layer.context)) {
      if (Object.hasOwn(context, key)) {
        throw new Error(`Duplicate view context field "${key}".`);
      }
      Object.defineProperty(context, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }
  }
  const props: ResolvedViewProps =
    status === "ready"
      ? { view: selected, status, context }
      : { view: selected, status, context: undefined };
  return props;
}

export function renderClient(client: AppClient, request: ViewRequest, root: Element): void {
  const selected = resolveView(client, request);
  client.$runtime.render(
    selected ? client.$runtime.h(selected.component, selected.props) : null,
    root,
  );
}

export function assertAppClient(value: unknown): asserts value is AppClient {
  const client = value as Partial<AppClient> | null | undefined;
  if (
    !client?.slots ||
    !client.$runtime ||
    typeof client.$runtime.h !== "function" ||
    typeof client.$runtime.render !== "function"
  ) {
    throw new TypeError(
      "TailorKit app must default-export a defineClient() client with slots and its bundled runtime.",
    );
  }
}
