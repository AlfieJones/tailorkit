import { useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { isViewAncestor } from "@tailorkit/core/views";
import { toBaseUrl } from "../store";
import { useStableContext } from "../hooks/use-stable-context";
import { useTailorRootContext } from "./context";
import { buildThemeCss, PrimitiveThemeContext } from "../primitives";
import { RemoteViewHost } from "../remote-view";
import type { AppViewProps, TailorKitApp } from "../tailor-kit";

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
    store.views.subscribe,
    store.views.getSnapshot,
    store.views.getSnapshot,
  );
  const view = (viewProps as { view?: string }).view;
  const suppliedContext = (viewProps as { context?: unknown }).context;
  const context = useStableContext(suppliedContext);
  const status = (viewProps as { status?: "error" | "loading" | "ready" }).status ?? "ready";
  const props = useMemo(() => {
    if (view !== undefined) {
      return {
        slot,
        view,
        layers: [
          ...(currentView?.layers ?? []).filter(
            (layer) => layer.path !== view && isViewAncestor(layer.path, view),
          ),
          { path: view, context, status },
        ],
      };
    }
    return currentView === null ? undefined : { slot, ...currentView };
  }, [context, currentView, view, status, slot]);
  const meta = useSyncExternalStore(store.subscribe, store.getMetaSnapshot, store.getMetaSnapshot);
  const appsSnapshot = useSyncExternalStore(
    store.subscribe,
    store.getAppsSnapshot,
    store.getAppsSnapshot,
  );
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
  const [previewRevision, setPreviewRevision] = useState(0);
  const [assetRevision, setAssetRevision] = useState<string | null>(null);
  const [rotatedPreview, setRotatedPreview] = useState<{
    appId: string;
    preview: TailorKitApp["preview"];
  }>();
  const preview =
    (rotatedPreview?.appId === app.id ? rotatedPreview.preview : undefined) ??
    appsSnapshot.apps.find((candidate) => candidate.id === app.id)?.preview ??
    app.preview;
  const previewSessionId = preview?.sessionId;
  const previewStatus = preview?.status;
  const previewEventsUrl = preview?.eventsUrl;
  const previewEventToken = preview?.eventToken;
  const previewClientPath = preview?.clientPath;

  useEffect(() => {
    if (previewStatus !== "connected" || (previewEventsUrl && previewEventToken)) {
      return;
    }
    const assetUrl = previewClientPath ? new URL(previewClientPath, store.baseUrl) : appUrl;
    if (!assetUrl) {
      return;
    }
    let closed = false;
    let lastEtag: string | null = null;
    let hadError = false;
    const checkEtag = async (): Promise<void> => {
      try {
        const response = await fetch(assetUrl, { method: "HEAD", credentials: "same-origin" });
        if (!response.ok) {
          throw new Error(`Preview asset returned ${response.status}.`);
        }
        const etag = response.headers.get("etag")?.replaceAll('"', "");
        if (closed || !etag) {
          return;
        }
        if ((lastEtag !== null && etag !== lastEtag) || hadError) {
          setAssetRevision(etag);
        }
        lastEtag = etag;
        hadError = false;
      } catch (error) {
        if (!hadError) {
          console.warn("Unable to check preview asset revision.", error);
        }
        hadError = true;
      }
    };
    void checkEtag();
    const interval = setInterval(() => void checkEtag(), 1000);
    return () => {
      closed = true;
      clearInterval(interval);
    };
  }, [
    appUrl,
    previewClientPath,
    previewEventToken,
    previewEventsUrl,
    previewStatus,
    store.baseUrl,
  ]);

  useEffect(() => {
    if (!previewSessionId) {
      return;
    }
    let closed = false;
    const refresh = async (): Promise<void> => {
      try {
        const response = await fetch(new URL("apps", store.baseUrl));
        if (!response.ok) {
          return;
        }
        const apps = (await response.json()) as TailorKitApp[];
        if (closed) {
          return;
        }
        const latest = apps.find((candidate) => candidate.id === app.id)?.preview;
        if (latest) {
          setRotatedPreview({ appId: app.id, preview: latest });
        }
      } catch {
        // Keep the current token and try again on the next refresh interval.
      }
    };
    const refreshTimer = setInterval(() => void refresh(), 3 * 60 * 1000);
    return () => {
      closed = true;
      clearInterval(refreshTimer);
    };
  }, [app.id, previewSessionId, store.baseUrl]);

  useEffect(() => {
    if (previewStatus !== "connected" || !previewEventsUrl || !previewEventToken) {
      return;
    }
    let closed = false;
    let socket: WebSocket | undefined;
    let reconnectTimeout: ReturnType<typeof setTimeout> | undefined;
    let delay = 1000;
    const connect = (): void => {
      if (closed) {
        return;
      }
      try {
        const currentSocket = new WebSocket(previewEventsUrl, previewEventToken);
        socket = currentSocket;
        currentSocket.addEventListener("open", () => {
          delay = 1000;
        });
        currentSocket.addEventListener("message", (event) => {
          try {
            if ((JSON.parse(String(event.data)) as { type?: string }).type === "build") {
              setPreviewRevision((revision) => revision + 1);
            }
          } catch {
            // Ignore malformed events from a closed or interrupted connection.
          }
        });
        currentSocket.addEventListener("close", scheduleReconnect);
        currentSocket.addEventListener("error", () => currentSocket.close());
      } catch {
        scheduleReconnect();
      }
    };
    const scheduleReconnect = (): void => {
      if (closed || reconnectTimeout) {
        return;
      }
      reconnectTimeout = setTimeout(() => {
        reconnectTimeout = undefined;
        connect();
      }, delay);
      delay = Math.min(delay * 2, 30_000);
    };
    connect();
    return () => {
      closed = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      socket?.close();
    };
  }, [previewEventToken, previewEventsUrl, previewStatus]);

  useEffect(() => {
    void store.fetchMeta();
  }, [store]);

  const renderedAppUrl = useMemo(() => {
    const url = previewClientPath ? new URL(previewClientPath, store.baseUrl) : appUrl;
    if (!url || !assetRevision) {
      return url;
    }
    const revisedUrl = new URL(url);
    revisedUrl.searchParams.set("revision", JSON.stringify(assetRevision));
    return revisedUrl;
  }, [appUrl, assetRevision, previewClientPath, store.baseUrl]);
  if (props === undefined || renderedAppUrl === null || meta.schema === null) {
    return fallback;
  }

  const viewId = `tailorkit-view-${reactId.replaceAll(":", "")}`;

  return (
    <PrimitiveThemeContext.Provider value={{ viewId, theme }}>
      <div data-tailorkit-view={viewId}>
        <style data-tailorkit-theme-style={viewId}>{buildThemeCss(viewId, theme)}</style>
        <RemoteViewHost
          key={`${previewRevision}:${assetRevision ?? ""}`}
          appUrl={renderedAppUrl.toString()}
          components={wrappedComponents}
          createIframe={createIframe}
          sameOriginPreview={Boolean(preview)}
          props={runtimeProps}
        />
      </div>
    </PrimitiveThemeContext.Provider>
  );
};

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
