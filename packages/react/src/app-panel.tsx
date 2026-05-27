"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState } from "react";
import type { KeyboardEvent, MouseEvent, ReactNode, RefCallback } from "react";
import type { TailorKitApp, TailorKitInstance } from "./tailor-kit";

export type AppPanelOpenMode = "manual" | "select";
type AppPanelTailor = Pick<TailorKitInstance, "Screen" | "useApps">;

export interface AppPanelContextValue {
  activeApp: TailorKitApp | null;
  activeAppId: string | null;
  apps: TailorKitApp[];
  contentId: string;
  isOpen: boolean;
  openMode: AppPanelOpenMode;
  selectApp: (appId: string) => void;
  setOpen: (open: boolean) => void;
  tailor: AppPanelTailor;
}

export interface AppPanelRootProps extends useRender.ComponentProps<"div"> {
  apps?: TailorKitApp[];
  children?: ReactNode;
  defaultOpen?: boolean;
  defaultValue?: string;
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (appId: string, app: TailorKitApp) => void;
  open?: boolean;
  openMode?: AppPanelOpenMode;
  tailor: AppPanelTailor;
  value?: string | null;
}

export interface AppPanelContentProps extends useRender.ComponentProps<"div"> {
  children?: ReactNode;
  forceMount?: boolean;
}

export interface AppPanelPopoverProps extends useRender.ComponentProps<"dialog"> {
  children?: ReactNode;
  forceMount?: boolean;
  modal?: boolean;
}

export interface AppPanelScreenProps extends useRender.ComponentProps<"div"> {
  app?: TailorKitApp;
  createWorker?: (url: URL, options: WorkerOptions) => Worker;
  fallback?: ReactNode;
  workerUrl?: string | URL;
}

export interface AppPanelHeaderProps extends useRender.ComponentProps<"div"> {
  children?: ReactNode;
}

export interface AppPanelTitleProps extends useRender.ComponentProps<"h2"> {
  children?: ReactNode;
}

export interface AppPanelCloseProps extends useRender.ComponentProps<"button"> {
  children?: ReactNode;
}

export const AppPanelContext = createContext<AppPanelContextValue | null>(null);

export const useAppPanelContext = (component: string): AppPanelContextValue => {
  const context = useContext(AppPanelContext);
  if (!context) {
    throw new Error(`${component} must be rendered inside AppPanel.Root.`);
  }
  return context;
};

const useControllableState = <T,>({
  defaultValue,
  onChange,
  value,
}: {
  defaultValue: T;
  onChange?: (value: T) => void;
  value?: T;
}): [T, (nextValue: T) => void] => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  const setValue = useCallback(
    (nextValue: T) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onChange?.(nextValue);
    },
    [isControlled, onChange],
  );

  return [currentValue, setValue];
};

const getInitialAppId = (apps: TailorKitApp[], value?: string | null): string | null => {
  if (value !== undefined) {
    return value;
  }
  return apps[0]?.id ?? null;
};

export function AppPanelRoot({
  apps: appsProp,
  children,
  defaultOpen = false,
  defaultValue,
  onOpenChange,
  onValueChange,
  open,
  openMode = "select",
  render,
  tailor,
  value,
  ...props
}: AppPanelRootProps): ReactNode {
  const appsSnapshot = tailor.useApps();
  const apps = appsProp ?? appsSnapshot.apps;
  const contentId = useId();
  const [activeAppId, setActiveAppId] = useControllableState<string | null>({
    defaultValue: defaultValue ?? getInitialAppId(apps, value),
    onChange: (nextAppId) => {
      const app = apps.find((candidate) => candidate.id === nextAppId);
      if (nextAppId && app) {
        onValueChange?.(nextAppId, app);
      }
    },
    value,
  });
  const [isOpen, setIsOpen] = useControllableState({
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    value: open,
  });

  useEffect(() => {
    const firstApp = apps[0];
    if (value !== undefined || activeAppId !== null || !firstApp) {
      return;
    }
    setActiveAppId(firstApp.id);
  }, [activeAppId, apps, setActiveAppId, value]);

  const selectApp = useCallback(
    (appId: string) => {
      setActiveAppId(appId);
      if (openMode === "select") {
        setIsOpen(true);
      }
    },
    [openMode, setActiveAppId, setIsOpen],
  );

  const context = useMemo<AppPanelContextValue>(
    () => ({
      activeApp: apps.find((app) => app.id === activeAppId) ?? null,
      activeAppId,
      apps,
      contentId,
      isOpen,
      openMode,
      selectApp,
      setOpen: setIsOpen,
      tailor,
    }),
    [activeAppId, apps, contentId, isOpen, openMode, selectApp, setIsOpen, tailor],
  );
  const rootProps = { children, "data-state": isOpen ? "open" : "closed" };

  return (
    <AppPanelContext.Provider value={context}>
      {useRender({
        defaultTagName: "div",
        props: mergeProps<"div">(rootProps, props),
        render,
      })}
    </AppPanelContext.Provider>
  );
}

export function AppPanelContent({
  children,
  forceMount = false,
  hidden,
  render,
  ...props
}: AppPanelContentProps): ReactNode {
  const context = useAppPanelContext("AppPanel.Content");
  const shouldRender = forceMount || context.isOpen;

  if (!shouldRender) {
    return null;
  }
  const contentProps = {
    children,
    "data-state": context.isOpen ? "open" : "closed",
    hidden: hidden ?? !context.isOpen,
    id: context.contentId,
  };

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(contentProps, props),
    render,
  });
}

export function AppPanelPopover({
  children,
  forceMount = false,
  hidden,
  modal = false,
  onKeyDown,
  render,
  ...props
}: AppPanelPopoverProps): ReactNode {
  const context = useAppPanelContext("AppPanel.Popover");
  const shouldRender = forceMount || context.isOpen;

  if (!shouldRender) {
    return null;
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    onKeyDown?.(event);
    if (!event.defaultPrevented && event.key === "Escape") {
      context.setOpen(false);
      event.preventDefault();
    }
  };
  const popoverProps = {
    "aria-modal": modal || undefined,
    children,
    "data-state": context.isOpen ? "open" : "closed",
    hidden: hidden ?? !context.isOpen,
    id: context.contentId,
    onKeyDown: handleKeyDown,
    open: context.isOpen,
  };

  return useRender({
    defaultTagName: "dialog",
    props: mergeProps<"dialog">(popoverProps, props),
    render,
  });
}

export function AppPanelHeader({ children, render, ...props }: AppPanelHeaderProps): ReactNode {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">({ children }, props),
    render,
  });
}

export function AppPanelTitle({ children, render, ...props }: AppPanelTitleProps): ReactNode {
  const context = useAppPanelContext("AppPanel.Title");

  return useRender({
    defaultTagName: "h2",
    props: mergeProps<"h2">(
      { children: children ?? context.activeApp?.name ?? context.activeApp?.id },
      props,
    ),
    render,
  });
}

export function AppPanelClose({
  children,
  onClick,
  render,
  ref,
  type = "button",
  ...props
}: AppPanelCloseProps & { ref?: RefCallback<HTMLButtonElement> }): ReactNode {
  const context = useAppPanelContext("AppPanel.Close");

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        "aria-label": props["aria-label"] ?? (children ? undefined : "Close app panel"),
        children,
        onClick: (event: MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            context.setOpen(false);
          }
        },
        ref,
        type,
      },
      props,
    ),
    render,
  });
}

export function AppPanelScreen({
  app,
  createWorker,
  fallback = null,
  render,
  workerUrl,
  ...props
}: AppPanelScreenProps): ReactNode {
  const context = useAppPanelContext("AppPanel.Screen");
  const selectedApp = app ?? context.activeApp;
  const Screen = context.tailor.Screen;

  if (!selectedApp) {
    return fallback;
  }
  const screenProps = {
    children: <Screen app={selectedApp} createWorker={createWorker} workerUrl={workerUrl} />,
    "data-app-id": selectedApp.id,
  };

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(screenProps, props),
    render,
  });
}

export const AppPanel = {
  Close: AppPanelClose,
  Content: AppPanelContent,
  Header: AppPanelHeader,
  Popover: AppPanelPopover,
  Root: AppPanelRoot,
  Screen: AppPanelScreen,
  Title: AppPanelTitle,
} as const;
