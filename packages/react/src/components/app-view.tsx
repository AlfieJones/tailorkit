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
  const previewRevision = usePreviewRevision(appUrl, Boolean(app.preview));
  const renderedAppUrl = useMemo(() => {
    if (!appUrl || previewRevision === null) {
      return appUrl;
    }
    const url = new URL(appUrl);
    url.searchParams.set("revision", previewRevision);
    return url;
  }, [appUrl, previewRevision]);

  useEffect(() => {
    void store.fetchMeta();
  }, [store]);

  if (props === undefined || renderedAppUrl === null || meta.schema === null) {
    return fallback;
  }

  const viewId = `tailorkit-view-${reactId.replaceAll(":", "")}`;

  return (
    <PrimitiveThemeContext.Provider value={{ viewId, theme }}>
      <div data-tailorkit-view={viewId}>
        <style data-tailorkit-theme-style={viewId}>{buildThemeCss(viewId, theme)}</style>
        <RemoteViewHost
          appUrl={renderedAppUrl.toString()}
          components={wrappedComponents}
          createIframe={createIframe}
          preview={Boolean(
            app.preview &&
            typeof window !== "undefined" &&
            renderedAppUrl.origin === window.location.origin,
          )}
          props={runtimeProps}
        />
      </div>
    </PrimitiveThemeContext.Provider>
  );
};

function usePreviewRevision(appUrl: URL | null, enabled: boolean): string | null {
  const [revision, setRevision] = useState<string | null>(null);
  const url = appUrl?.toString();

  useEffect(() => {
    if (!enabled || !url) {
      return;
    }
    let active = true;
    let previousEtag: string | null = null;
    let checking = false;
    const check = async () => {
      if (checking || document.visibilityState === "hidden") {
        return;
      }
      checking = true;
      try {
        const response = await fetch(url, { method: "HEAD", cache: "no-store" });
        const etag = response.ok ? response.headers.get("etag") : null;
        if (!active || !etag) {
          return;
        }
        if (previousEtag && previousEtag !== etag) {
          setRevision(etag);
        }
        previousEtag = etag;
      } catch {
        // Keep the current app mounted while the preview tunnel reconnects.
      } finally {
        checking = false;
      }
    };
    void check();
    const interval = window.setInterval(() => void check(), 1500);
    document.addEventListener("visibilitychange", check);
    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
    };
  }, [enabled, url]);

  return revision;
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
