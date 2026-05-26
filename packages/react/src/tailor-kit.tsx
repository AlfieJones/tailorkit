import { createContext, useContext, useEffect, useId, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { StandardJSONSchemaV1 } from "@standard-schema/spec";
import type { TailorKitSchemaSpecType } from "@tailorkit/core/spec";
import type {
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

interface TailorKitAppsSnapshot {
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

interface ScreenMatchEntry {
  context: unknown;
  depth: number;
  id: symbol;
  isLoading: boolean;
  order: number;
  params?: Record<string, string | undefined>;
  pattern: string;
  screen: string;
}

type ScreenContext<TScreen> =
  TScreen extends ScreenDefinition<infer TContext>
    ? TContext extends StandardJSONSchemaV1
      ? StandardJSONSchemaV1.InferOutput<TContext>
      : Record<string, never>
    : never;

type ScreenName<TScreens extends Record<string, ScreenDefinition>> = keyof TScreens & string;

interface ScreenMatchLoadingProps<
  TScreens extends Record<string, ScreenDefinition>,
  TScreen extends ScreenName<TScreens>,
> {
  children?: ReactNode;
  context?: ScreenContext<TScreens[TScreen]>;
  isLoading: true;
  params?: Record<string, string | undefined>;
  pattern: string;
  screen: TScreen;
}

interface ScreenMatchReadyProps<
  TScreens extends Record<string, ScreenDefinition>,
  TScreen extends ScreenName<TScreens>,
> {
  children?: ReactNode;
  context: ScreenContext<TScreens[TScreen]>;
  isLoading?: false;
  params?: Record<string, string | undefined>;
  pattern: string;
  screen: TScreen;
}

type ScreenMatchProps<
  TScreens extends Record<string, ScreenDefinition>,
  TScreen extends ScreenName<TScreens> = ScreenName<TScreens>,
> =
  TScreen extends ScreenName<TScreens>
    ? ScreenMatchLoadingProps<TScreens, TScreen> | ScreenMatchReadyProps<TScreens, TScreen>
    : never;

interface ScreenProps {
  app: TailorKitApp;
  createWorker?: (url: URL, options: WorkerOptions) => Worker;
  workerUrl?: string | URL;
}

const componentTagPrefix = "tailorkit-";
const ScreenMatchDepthContext = createContext(0);

const toComponentTagName = (name: string): string =>
  `${componentTagPrefix}${name
    .replaceAll(/([a-z0-9])([A-Z])/gu, "$1-$2")
    .replaceAll(/[\s_]+/gu, "-")
    .toLowerCase()}`;

export interface TailorKitInstance<
  TScreens extends Record<string, ScreenDefinition> = Record<string, never>,
> {
  Screen: (props: ScreenProps) => ReactNode;
  ScreenMatch: <TScreen extends ScreenName<TScreens>>(
    props: ScreenMatchProps<TScreens, TScreen>,
  ) => ReactNode;
  getApp: (id: string) => TailorKitApp | undefined;
  getApps: () => TailorKitApp[];
  useApps: () => TailorKitAppsSnapshot;
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
  components?: ComponentRenderers<ServerComponents<TTailor>>;
}): TailorKitInstance<ServerScreens<TTailor>> {
  return createReactTailorKitClient<ServerComponents<TTailor>, ServerScreens<TTailor>>(options);
}

function createReactTailorKitClient<
  TComponents extends Record<string, AnyComponentDefinition>,
  TScreens extends Record<string, ScreenDefinition> = Record<string, never>,
>(options: {
  baseUrl: string | URL;
  components?: ComponentRenderers<TComponents>;
}): TailorKitInstance<TScreens> {
  const wrappedComponents: Record<string, unknown> = {};
  const store = createTailorKitStore(options.baseUrl);

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

  const useApps = (): TailorKitAppsSnapshot => {
    const snapshot = useSyncExternalStore(
      store.subscribe,
      store.getAppsSnapshot,
      store.getAppsSnapshot,
    );

    useEffect(() => {
      void store.fetchApps();
    }, []);

    return snapshot;
  };

  const ScreenMatch = <TScreen extends ScreenName<TScreens>>({
    children,
    context,
    isLoading = false,
    params,
    pattern,
    screen,
  }: ScreenMatchProps<TScreens, TScreen>): ReactNode => {
    const id = useMemo(() => Symbol("tailorkit-screen-match"), []);
    const parentDepth = useContext(ScreenMatchDepthContext);
    const depth = parentDepth + 1;

    useEffect(() => {
      store.registerMatch({
        context,
        depth,
        id,
        isLoading,
        params,
        pattern,
        screen,
      });

      return () => {
        store.unregisterMatch(id);
      };
    }, [context, depth, id, isLoading, params, pattern, screen]);

    return (
      <ScreenMatchDepthContext.Provider value={depth}>{children}</ScreenMatchDepthContext.Provider>
    );
  };

  const Screen = ({ app, createWorker, workerUrl }: ScreenProps): ReactNode => {
    const reactId = useId();
    const match = useSyncExternalStore(
      store.subscribe,
      store.getCurrentMatch,
      store.getCurrentMatch,
    );
    const props = useMemo(
      () =>
        match === null
          ? undefined
          : {
              context: match.context,
              isLoading: match.isLoading,
              screen: match.screen,
            },
      [match],
    );
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

    if (match === null || appUrl === null) {
      return null;
    }

    const theme = {};
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

  return {
    Screen,
    ScreenMatch,
    getApp: store.getApp,
    getApps: store.getApps,
    useApps,
  };
}

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
      if (
        selected === null ||
        match.depth > selected.depth ||
        (match.depth === selected.depth && match.order > selected.order)
      ) {
        selected = match;
      }
    }
    currentMatch = selected;
  };

  return {
    baseUrl,
    fetchApps: (): Promise<void> => {
      if (fetchAppsPromise) {
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
