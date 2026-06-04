import { useMemo } from "react";
import type { ReactNode } from "react";
import type { TailorKitApp } from "../tailor-kit";
import type { ComponentProps } from "./render";
import { mergeProps, useRender } from "./render";
import { TailorRootContext } from "./context";
import type { RootTailor, TailorRootContextValue } from "./context";

const EMPTY_APPS: TailorKitApp[] = [];

export interface RootProps extends ComponentProps<"div"> {
  apps?: TailorKitApp[];
  children?: ReactNode;
  tailor: RootTailor;
}

export function Root({ apps: appsProp, children, render, tailor, ...props }: RootProps): ReactNode {
  const appsResult = tailor.useApps();
  const apps = appsProp ?? appsResult.data ?? EMPTY_APPS;

  const context = useMemo<TailorRootContextValue>(
    () => ({
      apps,
    }),
    [apps],
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
