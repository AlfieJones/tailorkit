import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { TailorKitApp } from "../tailor-kit";
import type { ComponentProps } from "./render";
import { mergeProps, useRender } from "./render";
import { TailorRootContext } from "./context";
import type { AppListOrientation, RootTailor, TailorRootContextValue } from "./context";

const EMPTY_APPS: TailorKitApp[] = [];

export interface RootProps extends ComponentProps<"div"> {
  apps?: TailorKitApp[];
  children?: ReactNode;
  defaultOpen?: boolean;
  defaultValue?: string;
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (app: TailorKitApp) => void;
  open?: boolean;
  tailor: RootTailor;
  value?: string | null;
}

export function Root({
  apps: appsProp,
  children,
  defaultOpen = false,
  defaultValue,
  onOpenChange,
  onValueChange,
  open,
  render,
  tailor,
  value,
  ...props
}: RootProps): ReactNode {
  const appsResult = tailor.useApps();
  const apps = appsProp ?? appsResult.data ?? EMPTY_APPS;
  const contentId = useId();
  const triggersRef = useRef(new Map<string, HTMLElement>());
  const [orientation, setOrientation] = useState<AppListOrientation>("vertical");
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [uncontrolledAppId, setUncontrolledAppId] = useState<string | null>(
    defaultValue ?? value ?? null,
  );
  const isOpen = open ?? uncontrolledOpen;
  const activeAppId = value !== undefined ? value : uncontrolledAppId;
  const activeApp = apps.find((app) => app.id === activeAppId) ?? null;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (open === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [onOpenChange, open],
  );

  const selectApp = useCallback(
    (app: TailorKitApp) => {
      if (value === undefined) {
        setUncontrolledAppId(app.id);
      }
      setOpen(true);
      onValueChange?.(app);
    },
    [onValueChange, setOpen, value],
  );

  const closeAppScreen = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const registerTrigger = useCallback((appId: string, element: HTMLElement | null) => {
    if (element) {
      triggersRef.current.set(appId, element);
      return;
    }
    triggersRef.current.delete(appId);
  }, []);

  useEffect(() => {
    const firstApp = apps[0];
    if (activeAppId !== null || !firstApp) {
      return;
    }
    if (value === undefined) {
      setUncontrolledAppId(firstApp.id);
    }
  }, [activeAppId, apps, value]);

  useEffect(() => {
    if (!activeAppId || apps.some((app) => app.id === activeAppId)) {
      return;
    }
    if (value === undefined) {
      setUncontrolledAppId(null);
    }
    setOpen(false);
  }, [activeAppId, apps, setOpen, value]);

  const context = useMemo<TailorRootContextValue>(
    () => ({
      activeApp,
      activeAppId,
      apps,
      closeAppScreen,
      contentId,
      isAppScreenOpen: isOpen,
      orientation,
      registerTrigger,
      selectApp,
      setOrientation,
      tailor,
      triggers: triggersRef.current,
    }),
    [
      activeApp,
      activeAppId,
      apps,
      closeAppScreen,
      contentId,
      isOpen,
      orientation,
      registerTrigger,
      selectApp,
      tailor,
    ],
  );

  const element = render
    ? useRender({
        defaultTagName: "div",
        props: mergeProps({ children, "data-state": isOpen ? "open" : "closed" }, props),
        render,
      })
    : children;

  return <TailorRootContext.Provider value={context}>{element}</TailorRootContext.Provider>;
}
