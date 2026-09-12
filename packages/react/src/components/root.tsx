import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createTailorKitStore, toBaseUrl } from "../tailor-kit";
import type { TailorKitApp, TailorKitInstance } from "../tailor-kit";
import { useAppsStore } from "../hooks/use-apps";
import type { ComponentProps } from "./render";
import { mergeProps, useRender } from "./render";
import { TailorRootContext } from "./context";
import type { TailorRootContextValue } from "./context";

const EMPTY_APPS: TailorKitApp[] = [];

export interface RootProps extends ComponentProps<"div"> {
  apps?: TailorKitApp[];
  children?: ReactNode;
  client: TailorKitInstance;
}

export function Root({ apps: appsProp, children, render, client, ...props }: RootProps): ReactNode {
  const baseUrl = toBaseUrl(client.baseUrl).toString();
  const [previousStore, setStore] = useState(() => createTailorKitStore(baseUrl));
  let store = previousStore;
  if (previousStore.baseUrl.toString() !== baseUrl) {
    store = createTailorKitStore(baseUrl);
    setStore(store);
  }
  const appsResult = useAppsStore(store);
  const apps = appsProp ?? appsResult.data ?? EMPTY_APPS;

  const context = useMemo<TailorRootContextValue>(
    () => ({
      apps,
      store,
      client,
    }),
    [apps, store, client],
  );

  const element = render
    ? useRender({
        defaultTagName: "div",
        props: mergeProps({ children }, props),
        render,
      })
    : children;

  return <TailorRootContext.Provider value={context}>{element}</TailorRootContext.Provider>;
}
