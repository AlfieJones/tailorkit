import { useEffect, useId, useMemo, useRef, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { TailorKitSchemaSpecType } from "@tailorkit/core/spec";
import type {
  TailorKitTheme,
  CallbackMap,
  ComponentDefinition,
  ComponentProps,
  Schema,
  ViewDefinition,
  SlotDefinitions,
  TailorKitSchema,
} from "@tailorkit/core/schema";
import type { primitives } from "./primitives";
import { useTailorRootContext } from "./components/context";

import type { ViewOptions, ViewName } from "./hooks/use-view";
import { buildThemeCss, PrimitiveThemeContext } from "./primitives";
import { RemoteViewHost } from "./remote-view";

type AnyComponentDefinition = ComponentDefinition<
  Schema | undefined,
  CallbackMap,
  boolean | undefined
>;

type ComponentRenderer<TComponent extends AnyComponentDefinition> = (args: {
  props: ComponentProps<TComponent>;
  children?: TComponent extends { children: true } ? ReactNode : never;
}) => ReactNode;

type ComponentRenderers<TComponents extends Record<string, AnyComponentDefinition>> = {
  [TName in keyof TComponents]?: ComponentRenderer<TComponents[TName]>;
};

type CompleteComponentRenderers<TComponents extends Record<string, AnyComponentDefinition>> = {
  [TName in keyof TComponents]-?: ComponentRenderer<TComponents[TName]>;
};

export interface TailorKitApp {
  clientPath?: string;
  description?: string;
  id: string;
  logoPaths?: {
    dark?: string;
    light?: string;
  };
  projectId?: string;
  currentDeployment?: {
    id: string;
  } | null;
  name?: string;
}

export interface TailorKitAppsSnapshot {
  apps: TailorKitApp[];
  error: Error | null;
  status: "error" | "idle" | "loading" | "ready";
}

interface TailorKitMetaSnapshot {
  assetsBaseUrl: string | null;
  error: Error | null;
  schema: TailorKitSchemaSpecType | null;
  status: "error" | "idle" | "loading" | "ready";
}

export interface CurrentViewEntry {
  context: unknown;
  id: symbol;
  order: number;
  view: string;
  status: "error" | "loading" | "ready";
}

interface AppViewBaseProps {
  app: TailorKitApp;
  createIframe?: () => HTMLIFrameElement;
  fallback?: ReactNode;
}

type AppViewViewProps<
  TViews extends Record<string, ViewDefinition>,
  TView extends ViewName<TViews> = ViewName<TViews>,
> = [ViewName<TViews>] extends [never]
  ? {
      context?: never;
      view?: never;
      status?: never;
    }
  :
      | {
          context?: never;
          view?: never;
          status?: never;
        }
      | ViewOptions<TViews, TView>;

export type AppViewProps<
  TViews extends Record<string, ViewDefinition> = RegisteredViews,
  TView extends ViewName<TViews> = ViewName<TViews>,
> = {
  [V in RegisteredSlots]: AppViewBaseProps & { slot: V } & AppViewViewProps<
      TViews,
      Extract<TView, SlotView<V>>
    >;
}[RegisteredSlots];

const componentTagPrefix = "tailorkit-";

const toComponentTagName = (name: string): string =>
  `${componentTagPrefix}${name
    .replaceAll(/([a-z0-9])([A-Z])/gu, "$1-$2")
    .replaceAll(/[\s_]+/gu, "-")
    .toLowerCase()}`;

// Augment Register once in the host to type the context-based hooks.
// oxlint-disable-next-line typescript-eslint/no-empty-interface, typescript-eslint/no-empty-object-type
export interface Register {}
export type RegisteredViews = Register extends { client: TailorKitInstance<infer S> }
  ? S
  : Record<`/${string}`, ViewDefinition>;
type RegisteredSlotMap = Register extends { client: { readonly $slots?: infer V } }
  ? V
  : SlotDefinitions;
export type RegisteredSlots = keyof RegisteredSlotMap & string;
type SlotView<V extends RegisteredSlots> = RegisteredSlotMap[V] extends {
  views: readonly (infer P)[];
}
  ? Extract<P, string>
  : never;
export interface TailorKitInstance<
  TViews extends Record<string, ViewDefinition> = Record<string, ViewDefinition>,
  TSlots extends SlotDefinitions = SlotDefinitions,
> {
  readonly $slots?: TSlots;
  readonly $views?: TViews;
  readonly baseUrl: string | URL;
  readonly components: Record<string, unknown>;
  readonly theme: TailorKitTheme;
}

type PrimitiveRenderers = typeof primitives;
type CustomComponentRenderers<TComponents extends Record<string, AnyComponentDefinition>> = {
  [TName in Exclude<keyof TComponents, keyof PrimitiveRenderers>]?: ComponentRenderer<
    TComponents[TName]
  >;
};

export function components<TComponents extends Record<string, AnyComponentDefinition>>(
  _schema: TailorKitSchema<TComponents, Record<string, ViewDefinition>>,
  customComponents: CustomComponentRenderers<TComponents>,
): ComponentRenderers<TComponents> {
  return customComponents as ComponentRenderers<TComponents>;
}

interface TailorKitServerShape {
  $internal: {
    schema: {
      components: Record<string, unknown>;
      views: Record<string, unknown>;
    };
  };
}

type ServerComponentMap<TTailor extends TailorKitServerShape> =
  TTailor["$internal"]["schema"]["components"];

type ServerComponents<TTailor extends TailorKitServerShape> = {
  [
    TName in keyof ServerComponentMap<TTailor>
  ]: ServerComponentMap<TTailor>[TName] extends AnyComponentDefinition
    ? ServerComponentMap<TTailor>[TName]
    : never;
};

type ServerViewMap<TTailor extends TailorKitServerShape> = TTailor["$internal"]["schema"]["views"];

type ServerViews<TTailor extends TailorKitServerShape> = {
  [TName in keyof ServerViewMap<TTailor>]: ServerViewMap<TTailor>[TName] extends ViewDefinition
    ? ServerViewMap<TTailor>[TName]
    : never;
};

export function createTailorKitClient<TTailor extends TailorKitServerShape>(options: {
  baseUrl: string | URL;
  components?: CompleteComponentRenderers<ServerComponents<TTailor>>;
  theme?: TailorKitTheme;
}): TailorKitInstance<
  ServerViews<TTailor>,
  TTailor extends { readonly $slots?: infer V extends SlotDefinitions } ? V : SlotDefinitions
> {
  return createReactTailorKitClient<
    ServerComponents<TTailor>,
    ServerViews<TTailor>,
    TTailor extends { readonly $slots?: infer V extends SlotDefinitions } ? V : SlotDefinitions
  >(options);
}

function createReactTailorKitClient<
  TComponents extends Record<string, AnyComponentDefinition>,
  TViews extends Record<string, ViewDefinition> = Record<string, never>,
  TSlots extends SlotDefinitions = SlotDefinitions,
>(options: {
  baseUrl: string | URL;
  components?: ComponentRenderers<TComponents>;
  theme?: TailorKitTheme;
}): TailorKitInstance<TViews, TSlots> {
  const wrappedComponents: Record<string, unknown> = {};

  const theme = options.theme ?? {};

  for (const [name, renderer] of Object.entries(options.components ?? {})) {
    if (renderer) {
      const TailorKitComponent = function TailorKitComponent({
        children,
        ...props
      }: Record<string, unknown> & { children?: ReactNode }) {
        return (renderer as ComponentRenderer<ComponentDefinition & { children: true }>)({
          props: props as ComponentProps<ComponentDefinition>,
          children,
        });
      };
      wrappedComponents[name] = TailorKitComponent;
      wrappedComponents[toComponentTagName(name)] = TailorKitComponent;
    }
  }

  return { baseUrl: options.baseUrl, components: wrappedComponents, theme };
}

export const AppView = ({
  app,
  slot,
  createIframe,
  fallback = null,
  ...viewProps
}: AppViewProps): ReactNode => {
  const { store, client } = useTailorRootContext("AppView");
  const { theme, components: wrappedComponents } = client;
  const reactId = useId();
  const currentView = useSyncExternalStore(
    store.subscribe,
    store.getCurrentView,
    store.getCurrentView,
  );
  const view = (viewProps as { view?: string }).view;
  const suppliedContext = (viewProps as { context?: unknown }).context;
  const contextKey = JSON.stringify(suppliedContext);
  const contextRef = useRef({ key: contextKey, value: suppliedContext });
  if (contextRef.current.key !== contextKey) {
    contextRef.current = { key: contextKey, value: suppliedContext };
  }
  const context = contextRef.current.value;
  const status = (viewProps as { status?: "error" | "loading" | "ready" }).status ?? "ready";
  const props = useMemo(() => {
    if (view !== undefined) {
      return {
        slot,
        view,
        layers: [
          ...(currentView?.layers ?? []).filter(
            (layer) =>
              layer.path !== view && (layer.path === "/" || view.startsWith(`${layer.path}/`)),
          ),
          { path: view, context, status },
        ],
      };
    }
    return currentView === null ? undefined : { slot, ...currentView };
  }, [context, currentView, view, status, slot]);
  const meta = useSyncExternalStore(store.subscribe, store.getMetaSnapshot, store.getMetaSnapshot);
  const runtimeProps = useMemo(
    () =>
      props === undefined
        ? undefined
        : {
            ...props,
            declaredViews: Object.keys(meta.schema?.views ?? {}),
            supportedViews: meta.schema?.slots[slot]?.views ?? [],
          },
    [props, meta.schema, slot],
  );
  const assetsBaseUrl = app.clientPath ? null : meta.assetsBaseUrl;
  const appUrl = useMemo(
    () => resolveAppUrl(app, store.baseUrl, assetsBaseUrl),
    [app, assetsBaseUrl, store.baseUrl],
  );

  useEffect(() => {
    void store.fetchMeta();
  }, [store]);

  if (
    props === undefined ||
    appUrl === null ||
    (meta.schema === null && !(app.clientPath && view === "/"))
  ) {
    return fallback;
  }

  const viewId = `tailorkit-view-${reactId.replaceAll(":", "")}`;

  return (
    <PrimitiveThemeContext.Provider value={{ viewId, theme }}>
      <div data-tailorkit-view={viewId}>
        <style data-tailorkit-theme-style={viewId}>{buildThemeCss(viewId, theme)}</style>
        <RemoteViewHost
          appUrl={appUrl.toString()}
          components={wrappedComponents}
          createIframe={createIframe}
          props={runtimeProps}
        />
      </div>
    </PrimitiveThemeContext.Provider>
  );
};

export type TailorKitStore = ReturnType<typeof createTailorKitStore>;

export function createTailorKitStore(baseUrlInput: string | URL) {
  const baseUrl = toBaseUrl(baseUrlInput);
  const listeners = new Set<() => void>();
  const views = new Map<symbol, CurrentViewEntry>();
  let appsSnapshot: TailorKitAppsSnapshot = {
    apps: [],
    error: null,
    status: "idle",
  };
  let metaSnapshot: TailorKitMetaSnapshot = {
    assetsBaseUrl: null,
    error: null,
    schema: null,
    status: "idle",
  };
  let currentView: {
    view: string;
    layers: { path: string; context: unknown; status: "ready" | "loading" | "error" }[];
  } | null = null;
  let scheduled = false;
  let fetchAppsPromise: Promise<void> | null = null;
  let fetchMetaPromise: Promise<void> | null = null;
  let fetchAppsRequestId = 0;
  let nextOrder = 0;

  const emit = (): void => {
    for (const listener of listeners) {
      listener();
    }
  };

  const selectCurrentView = (): void => {
    let selected: CurrentViewEntry | null = null;

    for (const view of views.values()) {
      const depth = getViewDepth(view.view);
      const selectedDepth = selected === null ? -1 : getViewDepth(selected.view);

      if (selected === null || depth > selectedDepth) {
        selected = view;
      }

      if (selected !== null && depth === selectedDepth && view.order > selected.order) {
        selected = view;
      }
    }

    const deepestViews =
      selected === null
        ? []
        : [...views.values()].filter(
            (view) => getViewDepth(view.view) === getViewDepth(selected.view),
          );

    if (typeof console !== "undefined" && selected !== null && deepestViews.length > 1) {
      const viewNames = deepestViews.map((view) => `"${view.view}"`).join(", ");
      console.warn(
        `TailorKit found multiple active views at the same hierarchy depth: ${viewNames}. TailorKit selected "${selected.view}" by mount order. Only one route at a hierarchy depth should call useView.`,
      );
    }

    currentView =
      selected === null
        ? null
        : {
            view: selected.view,
            layers: [...views.values()]
              .filter(
                (entry) =>
                  entry.view === "/" ||
                  entry.view === selected.view ||
                  selected.view.startsWith(`${entry.view}/`),
              )
              .toSorted((a, b) => getViewDepth(a.view) - getViewDepth(b.view))
              .map((entry) => ({
                path: entry.view,
                context: entry.context,
                status: entry.status,
              })),
          };
  };

  // Publish once after the commit's registration effects and cleanups settle.
  const scheduleViews = () => {
    if (scheduled) {
      return;
    }
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      selectCurrentView();
      emit();
    });
  };

  return {
    baseUrl,
    fetchApps: (options: { force?: boolean } = {}): Promise<void> => {
      if (fetchAppsPromise && !options.force) {
        return fetchAppsPromise;
      }

      appsSnapshot = { ...appsSnapshot, status: "loading" };
      emit();

      const requestId = ++fetchAppsRequestId;

      fetchAppsPromise = fetch(new URL("apps", baseUrl))
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Unable to fetch TailorKit apps from ${baseUrl.toString()}.`);
          }
          const apps = (await response.json()) as TailorKitApp[];
          if (requestId !== fetchAppsRequestId) {
            return;
          }
          appsSnapshot = {
            apps,
            error: null,
            status: "ready",
          };
          emit();
        })
        .catch((error: unknown) => {
          if (requestId !== fetchAppsRequestId) {
            return;
          }
          appsSnapshot = {
            ...appsSnapshot,
            error: error instanceof Error ? error : new Error(String(error)),
            status: "error",
          };
          emit();
        });

      return fetchAppsPromise;
    },
    fetchMeta: (): Promise<void> => {
      if (fetchMetaPromise) {
        return fetchMetaPromise;
      }

      metaSnapshot = { ...metaSnapshot, status: "loading" };
      emit();

      fetchMetaPromise = fetch(new URL("meta", baseUrl))
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Unable to fetch TailorKit metadata from ${baseUrl.toString()}.`);
          }
          const meta = (await response.json()) as {
            assetsBaseUrl?: string | null;
            schema: TailorKitSchemaSpecType;
          };
          metaSnapshot = {
            assetsBaseUrl: meta.assetsBaseUrl ?? null,
            error: null,
            schema: meta.schema,
            status: "ready",
          };
          emit();
        })
        .catch((error: unknown) => {
          metaSnapshot = {
            ...metaSnapshot,
            error: error instanceof Error ? error : new Error(String(error)),
            status: "error",
          };
          emit();
        });

      return fetchMetaPromise;
    },
    getApp: (id: string): TailorKitApp | undefined =>
      appsSnapshot.apps.find((app) => app.id === id),
    getApps: (): TailorKitApp[] => appsSnapshot.apps,
    getAppsSnapshot: (): TailorKitAppsSnapshot => appsSnapshot,
    getCurrentView: () => currentView,
    getMetaSnapshot: (): TailorKitMetaSnapshot => metaSnapshot,
    registerView: (entry: Omit<CurrentViewEntry, "order">): void => {
      const existing = views.get(entry.id);
      views.set(entry.id, {
        ...entry,
        order: existing?.order ?? nextOrder,
      });
      if (!existing) {
        nextOrder += 1;
      }
      scheduleViews();
    },
    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    unregisterView: (id: symbol): void => {
      views.delete(id);
      scheduleViews();
    },
  };
}

function getViewDepth(view: string): number {
  return view === "/" ? 0 : view.split("/").filter(Boolean).length;
}

export type { ViewOptions } from "./hooks/use-view";

function resolveAppUrl(app: TailorKitApp, baseUrl: URL, assetsBaseUrl: string | null): URL | null {
  if (app.clientPath) {
    return new URL(app.clientPath, baseUrl);
  }

  if (!assetsBaseUrl || !app.projectId || !app.currentDeployment?.id) {
    return null;
  }

  return new URL(
    `projects/${app.projectId}/apps/${app.id}/deployments/${app.currentDeployment.id}/files/client.js`,
    toBaseUrl(assetsBaseUrl),
  );
}

export function toBaseUrl(value: string | URL): URL {
  const url = value instanceof URL ? new URL(value) : new URL(value);
  if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }
  return url;
}
