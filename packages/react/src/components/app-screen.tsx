import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/react-dom";
import type { Placement } from "@floating-ui/react-dom";
import { useEffect } from "react";
import type { MouseEvent, ReactNode, Ref } from "react";
import type { TailorKitApp } from "../tailor-kit";
import type { ComponentProps } from "./render";
import { mergeProps, useRender } from "./render";
import { useTailorRootContext } from "./context";

export interface AppScreenPopoverOptions {
  placement?: Placement;
  sideOffset?: number;
}

export interface AppScreenProps extends Omit<ComponentProps<"div">, "popover"> {
  children?: ReactNode;
  popover?: boolean | AppScreenPopoverOptions;
}

export interface AppHeaderProps extends ComponentProps<"header"> {
  children?: ReactNode;
}

export interface AppContentProps extends ComponentProps<"main"> {
  app?: TailorKitApp;
  createWorker?: (url: URL, options: WorkerOptions) => Worker;
  fallback?: ReactNode;
  workerUrl?: string | URL;
}

export interface AppScreenCloseProps extends ComponentProps<"button"> {
  children?: ReactNode;
}

export function AppScreen({
  children,
  popover = false,
  render,
  ...props
}: AppScreenProps): ReactNode {
  const context = useTailorRootContext("tailor.AppScreen");
  const popoverOptions = typeof popover === "object" ? popover : {};
  const { refs, floatingStyles } = useFloating({
    middleware: [offset(popoverOptions.sideOffset ?? 4), flip(), shift({ padding: 8 })],
    placement: popoverOptions.placement ?? "bottom-start",
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (!popover || !context.activeAppId) {
      refs.setReference(null);
      return;
    }

    refs.setReference(context.triggers.get(context.activeAppId) ?? null);
  }, [context.activeAppId, context.triggers, popover, refs]);

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps(
      {
        children,
        "data-app-id": context.activeApp?.id,
        "data-state": context.isAppScreenOpen ? "open" : "closed",
        ref: popover ? refs.setFloating : undefined,
        style: popover ? floatingStyles : undefined,
      },
      props,
    ),
    render,
  });

  if (!context.activeApp || !context.isAppScreenOpen) {
    return null;
  }

  return element;
}

export function AppHeader({ children, render, ...props }: AppHeaderProps): ReactNode {
  return useRender({
    defaultTagName: "header",
    props: mergeProps({ children }, props),
    render,
  });
}

export function AppContent({
  app,
  createWorker,
  fallback = null,
  render,
  workerUrl,
  ...props
}: AppContentProps): ReactNode {
  const context = useTailorRootContext("tailor.AppContent");
  const selectedApp = app ?? context.activeApp;
  const Screen = context.tailor.Screen;

  if (!selectedApp) {
    return fallback;
  }

  return useRender({
    defaultTagName: "main",
    props: mergeProps(
      {
        children: <Screen app={selectedApp} createWorker={createWorker} workerUrl={workerUrl} />,
        "data-app-id": selectedApp.id,
        id: context.contentId,
      },
      props,
    ),
    render,
  });
}

export function AppScreenClose({
  children,
  onClick,
  ref,
  render,
  type = "button",
  ...props
}: AppScreenCloseProps & { ref?: Ref<HTMLButtonElement> }): ReactNode {
  const context = useTailorRootContext("tailor.AppScreenClose");

  return useRender({
    defaultTagName: "button",
    props: mergeProps(
      {
        "aria-label": props["aria-label"] ?? (children ? undefined : "Close app screen"),
        children,
        onClick: (event: MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            context.closeAppScreen();
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
