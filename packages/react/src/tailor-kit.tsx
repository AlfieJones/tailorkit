import { useEffect, useId, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { TailorKitSchemaSpecType } from "@tailorkit/core/spec";
import type {
  TailorKitTheme,
  CallbackMap,
  ComponentDefinition,
  ComponentProps,
  ComponentSlots,
  Schema,
  ScreenDefinition,
  TailorKitSchema,
} from "@tailorkit/core/schema";
import type { primitives } from "./primitives";
import { Root } from "./components";
import { createUseApps } from "./hooks/use-apps";
import type { UseAppsResult } from "./hooks/use-apps";
import { createUseCurrentScreen } from "./hooks/use-current-screen";
import type { CurrentScreenOptions, ScreenName } from "./hooks/use-current-screen";
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
  runtimeUrl?: string | URL;
}

type AppViewScreenProps<
  TScreens extends Record<string, ScreenDefinition>,
  TScreen extends ScreenName<TScreens> = ScreenName<TScreens>,
> = [ScreenName<TScreens>] extends [never]
  ? {
      context?: never;
      screen?: never;
      status?: never;
    }
  :
      | {
          context?: never;
          screen?: never;
          status?: never;
        }
      | CurrentScreenOptions<TScreens, TScreen>;

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
  getApp: (id: string) => TailorKitApp | undefined;
  getApps: () => TailorKitApp[];
  useApps: () => UseAppsResult;
  useCurrentScreen: <TScreen extends ScreenName<TScreens>>(
    options: CurrentScreenOptions<TScreens, TScreen>,
  ) => void;
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

interface TailorKitServerShape {
  $internal: {
    schema: {
      components: Record<string, unknown>;
      screens: Record<string, unknown>;
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
  TTailor["$internal"]["schema"]["screens"];

type ServerScreens<TTailor extends TailorKitServerShape> = {
  [
    TName in keyof ServerScreenMap<TTailor>
  ]: ServerScreenMap<TTailor>[TName] extends ScreenDefinition
    ? ServerScreenMap<TTailor>[TName]
    : never;
};

export function createTailorKitClient<TTailor extends TailorKitServerShape>(options: {
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
  const useCurrentScreen = createUseCurrentScreen<TScreens>(store);

  const AppView = ({
    app,
    createIframe,
    fallback = null,
    runtimeUrl,
    ...screenProps
  }: AppViewProps<TScreens>): ReactNode => {
    const reactId = useId();
    const currentScreen = useSyncExternalStore(
      store.subscribe,
      store.getCurrentScreen,
      store.getCurrentScreen,
    );
    const screen = (screenProps as { screen?: string }).screen;
    const context = (screenProps as { context?: unknown }).context;
    const status = (screenProps as { status?: "error" | "loading" | "ready" }).status ?? "ready";
    const props = useMemo(() => {
      if (screen !== undefined) {
        return {
          screen: {
            context,
            path: screen,
            status,
          },
        };
      }

      return currentScreen === null
        ? undefined
        : {
            screen: {
              context: currentScreen.context,
              path: currentScreen.screen,
              status: currentScreen.status,
            },
          };
    }, [context, currentScreen, screen, status]);
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
            createIframe={createIframe}
            props={props}
            runtimeUrl={runtimeUrl}
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
    getApp: store.getApp,
    getApps: store.getApps,
    useApps,
    useCurrentScreen,
  };

  return {
    ...client,
  } as TailorKitInstance<TScreens>;
}

export type TailorKitStore = ReturnType<typeof createTailorKitStore>;

function createTailorKitStore(baseUrlInput: string | URL) {
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
  let currentScreen: CurrentScreenEntry | null = null;
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
        `TailorKit found multiple active screens at the same hierarchy depth: ${screenNames}. TailorKit selected "${selected.screen}" by mount order. Only one route at a hierarchy depth should call useCurrentScreen.`,
      );
    }

    currentScreen = selected;
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
    getCurrentScreen: (): CurrentScreenEntry | null => currentScreen,
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
      selectCurrentScreen();
      emit();
    },
    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    unregisterScreen: (id: symbol): void => {
      screens.delete(id);
      selectCurrentScreen();
      emit();
    },
  };
}

function getScreenDepth(screen: string): number {
  return screen === "/" ? 0 : screen.split("/").filter(Boolean).length;
}

export type { CurrentScreenOptions } from "./hooks/use-current-screen";

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
