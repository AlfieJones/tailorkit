"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import type { KeyboardEvent, MouseEvent, ReactNode, RefCallback } from "react";
import type { TailorKitApp } from "./tailor-kit";
import { useAppPanelContext } from "./app-panel";

type AppRailOrientation = "horizontal" | "vertical";

interface AppRailContextValue {
  orientation: AppRailOrientation;
  registerTrigger: (appId: string, element: HTMLElement | null) => void;
  triggers: Map<string, HTMLElement>;
}

export interface AppRailListProps extends useRender.ComponentProps<"div"> {
  children?: ReactNode;
  orientation?: AppRailOrientation;
}

export interface AppRailItemProps extends useRender.ComponentProps<"div"> {
  app: TailorKitApp;
  children?: ReactNode;
}

export interface AppRailTriggerProps extends useRender.ComponentProps<"button"> {
  app?: TailorKitApp;
  children?: ReactNode;
}

const AppRailContext = createContext<AppRailContextValue | null>(null);
const AppRailItemContext = createContext<TailorKitApp | null>(null);

const composeRefs =
  <T,>(...refs: (RefCallback<T> | undefined)[]): RefCallback<T> =>
  (node) => {
    for (const ref of refs) {
      ref?.(node);
    }
  };

const useAppRailContext = (component: string): AppRailContextValue => {
  const context = useContext(AppRailContext);
  if (!context) {
    throw new Error(`${component} must be rendered inside AppRail.List.`);
  }
  return context;
};

export function AppRailList({
  children,
  orientation = "vertical",
  render,
  ...props
}: AppRailListProps): ReactNode {
  const triggersRef = useRef(new Map<string, HTMLElement>());
  const registerTrigger = useCallback((appId: string, element: HTMLElement | null) => {
    if (element) {
      triggersRef.current.set(appId, element);
      return;
    }
    triggersRef.current.delete(appId);
  }, []);
  const context = useMemo<AppRailContextValue>(
    () => ({
      orientation,
      registerTrigger,
      triggers: triggersRef.current,
    }),
    [orientation, registerTrigger],
  );
  const listProps = {
    "aria-orientation": orientation,
    children,
    "data-orientation": orientation,
    role: "toolbar",
  };

  return (
    <AppRailContext.Provider value={context}>
      {useRender({
        defaultTagName: "div",
        props: mergeProps<"div">(listProps, props),
        render,
      })}
    </AppRailContext.Provider>
  );
}

export function AppRailItem({ app, children, render, ...props }: AppRailItemProps): ReactNode {
  const itemProps = { children, "data-app-id": app.id };

  return (
    <AppRailItemContext.Provider value={app}>
      {useRender({
        defaultTagName: "div",
        props: mergeProps<"div">(itemProps, props),
        render,
      })}
    </AppRailItemContext.Provider>
  );
}

export function AppRailTrigger({
  app: appProp,
  children,
  onClick,
  onKeyDown,
  render,
  ref,
  ...props
}: AppRailTriggerProps & { ref?: RefCallback<HTMLButtonElement> }): ReactNode {
  const itemApp = useContext(AppRailItemContext);
  const app = appProp ?? itemApp;
  const rail = useAppRailContext("AppRail.Trigger");
  const panel = useAppPanelContext("AppRail.Trigger");

  if (!app) {
    throw new Error("AppRail.Trigger requires an app prop or an AppRail.Item parent.");
  }

  const isSelected = panel.activeAppId === app.id;
  const handleRef = useCallback(
    (node: HTMLElement | null) => {
      rail.registerTrigger(app.id, node);
    },
    [app.id, rail],
  );
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) {
      return;
    }
    if (event.key === "Escape") {
      panel.setOpen(false);
      event.currentTarget.focus();
      event.preventDefault();
      return;
    }
    const previousKey = rail.orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
    const nextKey = rail.orientation === "vertical" ? "ArrowDown" : "ArrowRight";
    if (
      event.key !== previousKey &&
      event.key !== nextKey &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }
    const enabledApps = panel.apps.filter((candidate) => candidate.id);
    const currentIndex = enabledApps.findIndex((candidate) => candidate.id === app.id);
    if (enabledApps.length === 0 || currentIndex === -1) {
      return;
    }
    let nextIndex = (currentIndex - 1 + enabledApps.length) % enabledApps.length;
    if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = enabledApps.length - 1;
    } else if (event.key === nextKey) {
      nextIndex = (currentIndex + 1) % enabledApps.length;
    }
    const nextApp = enabledApps[nextIndex];
    event.preventDefault();
    if (nextApp) {
      panel.selectApp(nextApp.id);
      rail.triggers.get(nextApp.id)?.focus();
    }
  };
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }
    if (panel.openMode === "select" && isSelected && panel.isOpen) {
      panel.setOpen(false);
      return;
    }
    panel.selectApp(app.id);
  };
  const triggerProps = {
    "aria-controls": panel.contentId,
    "aria-expanded": panel.isOpen && isSelected,
    "aria-pressed": isSelected,
    children: children ?? app.name ?? app.id,
    "data-app-id": app.id,
    "data-state": panel.isOpen && isSelected ? "open" : "closed",
    "data-selected": isSelected ? "" : undefined,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    ref: composeRefs(handleRef, ref),
    type: "button" as const,
  };

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(triggerProps, props),
    render,
  });
}

export const AppRail = {
  Item: AppRailItem,
  List: AppRailList,
  Trigger: AppRailTrigger,
} as const;
