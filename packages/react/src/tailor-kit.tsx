import { createContext, useContext, useEffect, useId, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type {
  ComponentDefinition,
  ComponentProps,
  ComponentSlots,
  ScreenDefinition,
  TailorKitSchema,
} from "@tailorkit/core/schema";
import { buildThemeCss, PrimitiveThemeContext } from "./primitives";
import { RemoteViewHost } from "./remote-view";

type ComponentRenderer<TComponent extends ComponentDefinition> = (args: {
  props: ComponentProps<TComponent>;
  slots: ComponentSlots<TComponent>;
}) => ReactNode;

type ComponentRenderers<TComponents extends Record<string, ComponentDefinition>> = {
  [TName in keyof TComponents]?: ComponentRenderer<TComponents[TName]>;
};

export interface TailorKitApp {
  clientPath?: string;
  clientUrl?: string;
  description?: string;
  id: string;
  name?: string;
}

interface TailorKitAppsSnapshot {
  apps: TailorKitApp[];
  error: Error | null;
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
  TScreen extends ScreenDefinition<infer TContext> ? StandardSchemaV1.InferOutput<TContext> : never;

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
    .replaceAll(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replaceAll(/[\s_]+/g, "-")
    .toLowerCase()}`;

export interface TailorKitInstance<
  TComponents extends Record<string, ComponentDefinition>,
  TScreens extends Record<string, ScreenDefinition> = Record<string, never>,
> {
  Screen: (props: ScreenProps) => ReactNode;
  ScreenMatch: <TScreen extends ScreenName<TScreens>>(
    props: ScreenMatchProps<TScreens, TScreen>,
  ) => ReactNode;
  getApp: (id: string) => TailorKitApp | undefined;
  getApps: () => TailorKitApp[];
  schema: TailorKitSchema<TComponents, TScreens>;
  useApps: () => TailorKitAppsSnapshot;
}

export function tailorKit<
  TComponents extends Record<string, ComponentDefinition>,
  TScreens extends Record<string, ScreenDefinition> = Record<string, never>,
>(
  schema: TailorKitSchema<TComponents, TScreens>,
  options: { baseUrl: string | URL; components?: ComponentRenderers<TComponents> },
): TailorKitInstance<TComponents, TScreens> {
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
          slots: { default: children } as ComponentSlots<ComponentDefinition>,
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

    if (match === null) {
      return null;
    }

    const screenId = `tailorkit-screen-${reactId.replaceAll(":", "")}`;

    return (
      <PrimitiveThemeContext.Provider value={{ screenId, theme: schema.theme }}>
        <div data-tailorkit-screen={screenId}>
          <style data-tailorkit-theme-style={screenId}>
            {buildThemeCss(screenId, schema.theme)}
          </style>
          <RemoteViewHost
            appUrl={resolveAppUrl(app, store.baseUrl)}
            components={wrappedComponents}
            createWorker={createWorker}
            props={{
              context: match.context,
              isLoading: match.isLoading,
              screen: match.screen,
            }}
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
    schema,
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
  let currentMatch: ScreenMatchEntry | null = null;
  let fetchPromise: Promise<void> | null = null;
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
      if (fetchPromise) {
        return fetchPromise;
      }

      appsSnapshot = { ...appsSnapshot, status: "loading" };
      emit();

      fetchPromise = fetch(new URL("/apps", baseUrl))
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

      return fetchPromise;
    },
    getApp: (id: string): TailorKitApp | undefined =>
      appsSnapshot.apps.find((app) => app.id === id),
    getApps: (): TailorKitApp[] => appsSnapshot.apps,
    getAppsSnapshot: (): TailorKitAppsSnapshot => appsSnapshot,
    getCurrentMatch: (): ScreenMatchEntry | null => currentMatch,
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

function resolveAppUrl(app: TailorKitApp, baseUrl: URL): URL {
  return new URL(app.clientUrl ?? app.clientPath ?? `/${app.id}/client.js`, baseUrl);
}

function toBaseUrl(value: string | URL): URL {
  return value instanceof URL ? value : new URL(value);
}
