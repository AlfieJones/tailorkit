import { useEffect, useId, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { TailorKitSchemaSpecType } from "@tailorkit/core/spec";
import type {
  TailorKitTheme,
  CallbackMap,
  ComponentDefinition,
  ComponentProps,
  Schema,
  ScopeDefinition,
  TailorKitSchema,
} from "@tailorkit/core/schema";
import type { primitives } from "./primitives";
import { useTailorRootContext } from "./components/context";

import type { ScopeOptions, ScreenName } from "./hooks/use-scope";
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

export interface CurrentScreenEntry {
  context: unknown;
  id: symbol;
  order: number;
  screen: string;
  status: "error" | "loading" | "ready";
}

interface AppViewBaseProps {
  app: TailorKitApp;
  createIframe?: () => HTMLIFrameElement;
  fallback?: ReactNode;
  viewport: RegisteredViewports;
}

type AppViewScreenProps<
  TScreens extends Record<string, ScopeDefinition>,
  TScreen extends ScreenName<TScreens> = ScreenName<TScreens>,
> = [ScreenName<TScreens>] extends [never]
  ? {
      context?: never;
      scope?: never;
      status?: never;
    }
  :
      | {
          context?: never;
          scope?: never;
          status?: never;
        }
      | ScopeOptions<TScreens, TScreen>;

export type AppViewProps<
  TScreens extends Record<string, ScopeDefinition> = RegisteredScopes,
  TScreen extends ScreenName<TScreens> = ScreenName<TScreens>,
> = AppViewBaseProps & AppViewScreenProps<TScreens, TScreen>;

const componentTagPrefix = "tailorkit-";

const toComponentTagName = (name: string): string =>
  `${componentTagPrefix}${name
    .replaceAll(/([a-z0-9])([A-Z])/gu, "$1-$2")
    .replaceAll(/[\s_]+/gu, "-")
    .toLowerCase()}`;

// Augment Register once in the host to type the context-based hooks.
// oxlint-disable-next-line typescript-eslint/no-empty-interface, typescript-eslint/no-empty-object-type
export interface Register {}
export type RegisteredScopes = Register extends { client: TailorKitInstance<infer S> }
  ? S
  : Record<`/${string}`, ScopeDefinition>;
export type RegisteredViewports = Register extends { client: { readonly $viewportNames?: infer V } }
  ? Extract<V, string>
  : string;
export interface TailorKitInstance<
  TScopes extends Record<string, ScopeDefinition> = Record<string, ScopeDefinition>,
  TViewports extends string = string,
> {
  readonly $viewportNames?: TViewports;
  readonly $scopes?: TScopes;
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
  _schema: TailorKitSchema<TComponents, Record<string, ScopeDefinition>>,
  customComponents: CustomComponentRenderers<TComponents>,
): ComponentRenderers<TComponents> {
  return customComponents as ComponentRenderers<TComponents>;
}

interface TailorKitServerShape {
  $internal: {
    schema: {
      components: Record<string, unknown>;
      scopes: Record<string, unknown>;
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

type ServerScreenMap<TTailor extends TailorKitServerShape> =
  TTailor["$internal"]["schema"]["scopes"];

type ServerScreens<TTailor extends TailorKitServerShape> = {
  [TName in keyof ServerScreenMap<TTailor>]: ServerScreenMap<TTailor>[TName] extends ScopeDefinition
    ? ServerScreenMap<TTailor>[TName]
    : never;
};

export function createTailorKitClient<TTailor extends TailorKitServerShape>(options: {
  baseUrl: string | URL;
  components?: CompleteComponentRenderers<ServerComponents<TTailor>>;
  theme?: TailorKitTheme;
}): TailorKitInstance<
  ServerScreens<TTailor>,
  TTailor extends { readonly $viewportNames?: infer V } ? Extract<V, string> : string
> {
  return createReactTailorKitClient<
    ServerComponents<TTailor>,
    ServerScreens<TTailor>,
    TTailor extends { readonly $viewportNames?: infer V } ? Extract<V, string> : string
  >(options);
}

function createReactTailorKitClient<
  TComponents extends Record<string, AnyComponentDefinition>,
  TScreens extends Record<string, ScopeDefinition> = Record<string, never>,
  TViewports extends string = string,
>(options: {
  baseUrl: string | URL;
  components?: ComponentRenderers<TComponents>;
  theme?: TailorKitTheme;
}): TailorKitInstance<TScreens, TViewports> {
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
  viewport,
  createIframe,
  fallback = null,
  ...screenProps
}: AppViewProps): ReactNode => {
  const { store, client } = useTailorRootContext("AppView");
  const { theme, components: wrappedComponents } = client;
  const reactId = useId();
  const currentScreen = useSyncExternalStore(
    store.subscribe,
    store.getCurrentScreen,
    store.getCurrentScreen,
  );
  const scope = (screenProps as { scope?: string }).scope;
  const context = (screenProps as { context?: unknown }).context;
  const status = (screenProps as { status?: "error" | "loading" | "ready" }).status ?? "ready";
  const props = useMemo(() => {
    if (scope !== undefined) {
      return {
        viewport,
        scope,
        layers: [
          ...(currentScreen?.layers ?? []).filter(
            (layer) =>
              layer.path !== scope && (layer.path === "/" || scope.startsWith(`${layer.path}/`)),
          ),
          { path: scope, context, status },
        ],
      };
    }
    return currentScreen === null ? undefined : { viewport, ...currentScreen };
  }, [context, currentScreen, scope, status, viewport]);
  const meta = useSyncExternalStore(store.subscribe, store.getMetaSnapshot, store.getMetaSnapshot);
  const runtimeProps = useMemo(
    () =>
      props === undefined
        ? undefined
        : {
            ...props,
            declaredScopes: Object.keys(meta.schema?.scopes ?? {}),
          },
    [props, meta.schema],
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
    (meta.schema === null && !(app.clientPath && scope === "/"))
  ) {
    return fallback;
  }

  const screenId = `tailorkit-screen-${reactId.replaceAll(":", "")}`;

  return (
    <PrimitiveThemeContext.Provider value={{ screenId, theme }}>
      <div data-tailorkit-screen={screenId}>
        <style data-tailorkit-theme-style={screenId}>{buildThemeCss(screenId, theme)}</style>
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
  const screens = new Map<symbol, CurrentScreenEntry>();
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
  let currentScreen: {
    scope: string;
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

  const selectCurrentScreen = (): void => {
    let selected: CurrentScreenEntry | null = null;

    for (const screen of screens.values()) {
      const depth = getScreenDepth(screen.screen);
      const selectedDepth = selected === null ? -1 : getScreenDepth(selected.screen);

      if (selected === null || depth > selectedDepth) {
        selected = screen;
      }

      if (selected !== null && depth === selectedDepth && screen.order > selected.order) {
        selected = screen;
      }
    }

    const deepestScreens =
      selected === null
        ? []
        : [...screens.values()].filter(
            (screen) => getScreenDepth(screen.screen) === getScreenDepth(selected.screen),
          );

    if (typeof console !== "undefined" && selected !== null && deepestScreens.length > 1) {
      const screenNames = deepestScreens.map((screen) => `"${screen.screen}"`).join(", ");
      console.warn(
        `TailorKit found multiple active scopes at the same hierarchy depth: ${screenNames}. TailorKit selected "${selected.screen}" by mount order. Only one route at a hierarchy depth should call useScope.`,
      );
    }

    currentScreen =
      selected === null
        ? null
        : {
            scope: selected.screen,
            layers: [...screens.values()]
              .filter(
                (entry) =>
                  entry.screen === "/" ||
                  entry.screen === selected.screen ||
                  selected.screen.startsWith(`${entry.screen}/`),
              )
              .toSorted((a, b) => getScreenDepth(a.screen) - getScreenDepth(b.screen))
              .map((entry) => ({
                path: entry.screen,
                context: entry.context,
                status: entry.status,
              })),
          };
  };

  // Publish once after the commit's registration effects and cleanups settle.
  const scheduleScopes = () => {
    if (scheduled) {
      return;
    }
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      selectCurrentScreen();
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
    getCurrentScreen: () => currentScreen,
    getMetaSnapshot: (): TailorKitMetaSnapshot => metaSnapshot,
    registerScreen: (entry: Omit<CurrentScreenEntry, "order">): void => {
      const existing = screens.get(entry.id);
      screens.set(entry.id, {
        ...entry,
        order: existing?.order ?? nextOrder,
      });
      if (!existing) {
        nextOrder += 1;
      }
      scheduleScopes();
    },
    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    unregisterScreen: (id: symbol): void => {
      screens.delete(id);
      scheduleScopes();
    },
  };
}

function getScreenDepth(screen: string): number {
  return screen === "/" ? 0 : screen.split("/").filter(Boolean).length;
}

export type { ScopeOptions } from "./hooks/use-scope";

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

function toBaseUrl(value: string | URL): URL {
  const url = value instanceof URL ? new URL(value) : new URL(value);
  if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }
  return url;
}
