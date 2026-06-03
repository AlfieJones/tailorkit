import { useEffect, useId, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { TailorKitSchemaSpecType } from "@tailorkit/core/spec";
import type {
  TailorKitTheme,
  ActionTree,
  CallbackMap,
  ComponentDefinition,
  ComponentProps,
  ComponentSlots,
  Schema,
  ScreenDefinition,
  TailorKitSchema,
} from "@tailorkit/core/schema";
import type { primitives } from "./primitives";
import { Root, createScreenMatch } from "./components";
import type { ScreenMatchProps, ScreenName } from "./components";
import { createUseApps } from "./hooks/use-apps";
import type { UseAppsResult } from "./hooks/use-apps";
import { buildThemeCss, PrimitiveThemeContext } from "./primitives";
import { RemoteViewHost } from "./remote-view";

type ReactComponentSlots<TComponent> = {
  [TSlot in keyof ComponentSlots<TComponent>]: ReactNode;
};

type AnyComponentDefinition = ComponentDefinition<
  Schema | undefined,
  CallbackMap,
  readonly string[] | undefined
>;

type ComponentRenderer<TComponent extends AnyComponentDefinition> = (args: {
  props: ComponentProps<TComponent>;
  slots: ReactComponentSlots<TComponent>;
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

export interface ScreenMatchEntry {
  context: unknown;
  depth: number;
  id: symbol;
  isLoading: boolean;
  order: number;
  parentId: symbol | null;
  screen: string;
}

interface AppViewBaseProps {
  app: TailorKitApp;
  createWorker?: (url: URL, options: WorkerOptions) => Worker;
  fallback?: ReactNode;
  workerUrl?: string | URL;
}

type AppViewScreenProps<
  TScreens extends Record<string, ScreenDefinition>,
  TScreen extends ScreenName<TScreens> = ScreenName<TScreens>,
> = [ScreenName<TScreens>] extends [never]
  ? {
      context?: never;
      isLoading?: never;
      screen?: never;
    }
  :
      | {
          context?: never;
          isLoading?: never;
          screen?: never;
        }
      | DistributiveOmit<ScreenMatchProps<TScreens, TScreen>, "children">;

type DistributiveOmit<T, TKey extends keyof T> = T extends unknown ? Omit<T, TKey> : never;

export type AppViewProps<
  TScreens extends Record<string, ScreenDefinition>,
  TScreen extends ScreenName<TScreens> = ScreenName<TScreens>,
> = AppViewBaseProps & AppViewScreenProps<TScreens, TScreen>;

const componentTagPrefix = "tailorkit-";

const toComponentTagName = (name: string): string =>
  `${componentTagPrefix}${name
    .replaceAll(/([a-z0-9])([A-Z])/gu, "$1-$2")
    .replaceAll(/[\s_]+/gu, "-")
    .toLowerCase()}`;

export interface TailorKitInstance<
  TScreens extends Record<string, ScreenDefinition> = Record<string, never>,
> {
  AppView: (props: AppViewProps<TScreens>) => ReactNode;
  Root: (props: Omit<Parameters<typeof Root>[0], "tailor">) => ReactNode;
  ScreenMatch: <TScreen extends ScreenName<TScreens>>(
    props: ScreenMatchProps<TScreens, TScreen>,
  ) => ReactNode;
  getApp: (id: string) => TailorKitApp | undefined;
  getApps: () => TailorKitApp[];
  useApps: () => UseAppsResult;
}

type PrimitiveRenderers = typeof primitives;
type CustomComponentRenderers<TComponents extends Record<string, AnyComponentDefinition>> = {
  [TName in Exclude<keyof TComponents, keyof PrimitiveRenderers>]?: ComponentRenderer<
    TComponents[TName]
  >;
};

export function components<TComponents extends Record<string, AnyComponentDefinition>>(
  _schema: TailorKitSchema<TComponents, Record<string, ScreenDefinition>>,
  customComponents: CustomComponentRenderers<TComponents>,
): ComponentRenderers<TComponents> {
  return customComponents as ComponentRenderers<TComponents>;
}

type ServerComponents<TTailor> = TTailor extends {
  $internal: {
    schema: TailorKitSchema<infer TComponents, Record<string, ScreenDefinition>, ActionTree>;
  };
}
  ? TComponents extends Record<string, AnyComponentDefinition>
    ? TComponents
    : never
  : never;

type ServerScreens<TTailor> = TTailor extends {
  $internal: {
    schema: TailorKitSchema<Record<string, AnyComponentDefinition>, infer TScreens, ActionTree>;
  };
}
  ? TScreens extends Record<string, ScreenDefinition>
    ? TScreens
    : never
  : never;

type AnyServerSchema = TailorKitSchema<
  Record<string, AnyComponentDefinition>,
  Record<string, ScreenDefinition>,
  ActionTree
>;

export function createTailorKitClient<
  TTailor extends { $internal: { schema: AnyServerSchema } },
>(options: {
  baseUrl: string | URL;
  components?: CompleteComponentRenderers<ServerComponents<TTailor>>;
  theme?: TailorKitTheme;
}): TailorKitInstance<ServerScreens<TTailor>> {
  return createReactTailorKitClient<ServerComponents<TTailor>, ServerScreens<TTailor>>(options);
}

function createReactTailorKitClient<
  TComponents extends Record<string, AnyComponentDefinition>,
  TScreens extends Record<string, ScreenDefinition> = Record<string, never>,
>(options: {
  baseUrl: string | URL;
  components?: ComponentRenderers<TComponents>;
  theme?: TailorKitTheme;
}): TailorKitInstance<TScreens> {
  const wrappedComponents: Record<string, unknown> = {};
  const store = createTailorKitStore(options.baseUrl);
  const theme = options.theme ?? {};

  for (const [name, renderer] of Object.entries(options.components ?? {})) {
    if (renderer) {
      const TailorKitComponent = function TailorKitComponent({
        children,
        ...props
      }: Record<string, unknown> & { children?: ReactNode }) {
        return (renderer as ComponentRenderer<ComponentDefinition>)({
          props: props as ComponentProps<ComponentDefinition>,
          slots: { default: children } as ReactComponentSlots<ComponentDefinition>,
        });
      };
      wrappedComponents[name] = TailorKitComponent;
      wrappedComponents[toComponentTagName(name)] = TailorKitComponent;
    }
  }

  const useApps = createUseApps(store);
  const ScreenMatch = createScreenMatch<TScreens>(store);

  const AppView = ({
    app,
    createWorker,
    fallback = null,
    workerUrl,
    ...screenProps
  }: AppViewProps<TScreens>): ReactNode => {
    const reactId = useId();
    const match = useSyncExternalStore(
      store.subscribe,
      store.getCurrentMatch,
      store.getCurrentMatch,
    );
    const screen = (screenProps as { screen?: string }).screen;
    const context = (screenProps as { context?: unknown }).context;
    const isLoading = (screenProps as { isLoading?: boolean }).isLoading ?? false;
    const props = useMemo(() => {
      if (screen !== undefined) {
        return {
          matches: [
            {
              context,
              isLoading,
              screen,
            },
          ],
        };
      }

      return match === null
        ? undefined
        : {
            matches: store.getMatchChain(match.id).map((entry) => ({
              context: entry.context,
              isLoading: entry.isLoading,
              screen: entry.screen,
            })),
          };
    }, [context, isLoading, match, screen]);
    const meta = useSyncExternalStore(
      store.subscribe,
      store.getMetaSnapshot,
      store.getMetaSnapshot,
    );
    const assetsBaseUrl = app.clientPath ? null : meta.assetsBaseUrl;
    const appUrl = useMemo(
      () => resolveAppUrl(app, store.baseUrl, assetsBaseUrl),
      [app, assetsBaseUrl],
    );

    useEffect(() => {
      void store.fetchMeta();
    }, []);

    if (props === undefined || appUrl === null) {
      return fallback;
    }

    const screenId = `tailorkit-screen-${reactId.replaceAll(":", "")}`;

    return (
      <PrimitiveThemeContext.Provider value={{ screenId, theme }}>
        <div data-tailorkit-screen={screenId}>
          <style data-tailorkit-theme-style={screenId}>{buildThemeCss(screenId, theme)}</style>
          <RemoteViewHost
            appUrl={appUrl}
            components={wrappedComponents}
            createWorker={createWorker}
            props={props}
            workerUrl={workerUrl}
          />
        </div>
      </PrimitiveThemeContext.Provider>
    );
  };

  const client = {
    AppView,
    Root: (props: Omit<Parameters<typeof Root>[0], "tailor">) => (
      <Root {...props} tailor={client} />
    ),
    ScreenMatch,
    getApp: store.getApp,
    getApps: store.getApps,
    useApps,
  };

  return {
    ...client,
  } as TailorKitInstance<TScreens>;
}

export type TailorKitStore = ReturnType<typeof createTailorKitStore>;

function createTailorKitStore(baseUrlInput: string | URL) {
  const baseUrl = toBaseUrl(baseUrlInput);
  const listeners = new Set<() => void>();
  const matches = new Map<symbol, ScreenMatchEntry>();
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
  let currentMatch: ScreenMatchEntry | null = null;
  let fetchAppsPromise: Promise<void> | null = null;
  let fetchMetaPromise: Promise<void> | null = null;
  let nextOrder = 0;

  const emit = (): void => {
    for (const listener of listeners) {
      listener();
    }
  };

  const selectCurrentMatch = (): void => {
    let selected: ScreenMatchEntry | null = null;

    for (const match of matches.values()) {
      if (selected === null || match.depth > selected.depth) {
        selected = match;
      }

      if (selected !== null && match.depth === selected.depth && match.order > selected.order) {
        selected = match;
      }
    }

    const deepestMatches =
      selected === null
        ? []
        : [...matches.values()].filter((match) => match.depth === selected.depth);

    if (typeof console !== "undefined" && selected !== null && deepestMatches.length > 1) {
      console.warn(
        `TailorKit found multiple active ScreenMatch components at the same depth: ${deepestMatches
          .map((match) => `"${match.screen}"`)
          .join(", ")}. TailorKit selected "${
          selected.screen
        }" by mount order, but same-depth matches are ambiguous. Nest related matches or render one match conditionally.`,
      );
    }

    currentMatch = selected;
  };

  return {
    baseUrl,
    fetchApps: (options: { force?: boolean } = {}): Promise<void> => {
      if (fetchAppsPromise && !options.force) {
        return fetchAppsPromise;
      }

      appsSnapshot = { ...appsSnapshot, status: "loading" };
      emit();

      fetchAppsPromise = fetch(new URL("apps", baseUrl))
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Unable to fetch TailorKit apps from ${baseUrl.toString()}.`);
          }
          const apps = (await response.json()) as TailorKitApp[];
          appsSnapshot = {
            apps,
            error: null,
            status: "ready",
          };
          emit();
        })
        .catch((error: unknown) => {
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
    getCurrentMatch: (): ScreenMatchEntry | null => currentMatch,
    getMatchChain: (id: symbol): ScreenMatchEntry[] => {
      const chain: ScreenMatchEntry[] = [];
      let next = matches.get(id) ?? null;

      while (next !== null) {
        chain.push(next);
        next = next.parentId === null ? null : (matches.get(next.parentId) ?? null);
      }

      return chain;
    },
    getMetaSnapshot: (): TailorKitMetaSnapshot => metaSnapshot,
    registerMatch: (entry: Omit<ScreenMatchEntry, "order">): void => {
      const existing = matches.get(entry.id);
      matches.set(entry.id, {
        ...entry,
        order: existing?.order ?? nextOrder,
      });
      if (!existing) {
        nextOrder += 1;
      }
      selectCurrentMatch();
      emit();
    },
    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    unregisterMatch: (id: symbol): void => {
      matches.delete(id);
      selectCurrentMatch();
      emit();
    },
  };
}

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
