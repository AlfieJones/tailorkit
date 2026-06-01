import { useCallback } from "react";
import type { KeyboardEvent, MouseEvent, ReactNode, Ref } from "react";
import type { TailorKitApp } from "../tailor-kit";
import type { ComponentProps } from "./render";
import { composeRefs, mergeProps, useRender } from "./render";
import { useTailorRootContext } from "./context";

export interface AppTriggerProps extends ComponentProps<"button"> {
  app: TailorKitApp;
  children?: ReactNode;
}

export function AppTrigger({
  app,
  children,
  onClick,
  onKeyDown,
  ref,
  render,
  type = "button",
  ...props
}: AppTriggerProps & { ref?: Ref<HTMLButtonElement> }): ReactNode {
  const context = useTailorRootContext("tailor.AppTrigger");
  const isSelected = context.activeAppId === app.id;

  const handleRef = useCallback(
    (node: HTMLElement | null) => {
      context.registerTrigger(app.id, node);
    },
    [app.id, context],
  );

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }

    if (context.isAppScreenOpen && isSelected) {
      context.closeAppScreen();
      return;
    }

    context.selectApp(app);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "Escape") {
      context.closeAppScreen();
      event.currentTarget.focus();
      event.preventDefault();
      return;
    }

    const previousKey = context.orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
    const nextKey = context.orientation === "vertical" ? "ArrowDown" : "ArrowRight";

    if (
      event.key !== previousKey &&
      event.key !== nextKey &&
      event.key !== "Home" &&
      event.key !== "End" &&
      event.key !== " " &&
      event.key !== "Enter"
    ) {
      return;
    }

    if (event.key === " " || event.key === "Enter") {
      if (event.currentTarget.tagName === "BUTTON") {
        return;
      }

      event.preventDefault();
      context.selectApp(app);
      return;
    }

    const currentIndex = context.apps.findIndex((candidate) => candidate.id === app.id);
    if (context.apps.length === 0 || currentIndex === -1) {
      return;
    }

    let nextIndex = (currentIndex - 1 + context.apps.length) % context.apps.length;
    if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = context.apps.length - 1;
    } else if (event.key === nextKey) {
      nextIndex = (currentIndex + 1) % context.apps.length;
    }

    const nextApp = context.apps[nextIndex];
    event.preventDefault();
    if (nextApp) {
      context.triggers.get(nextApp.id)?.focus();
    }
  };

  return useRender({
    defaultTagName: "button",
    props: mergeProps(
      {
        "aria-controls": context.contentId,
        "aria-expanded": context.isAppScreenOpen && isSelected,
        "aria-pressed": isSelected,
        children: children ?? app.name ?? app.id,
        "data-app-id": app.id,
        "data-state": context.isAppScreenOpen && isSelected ? "open" : "closed",
        "data-selected": isSelected ? "" : undefined,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        ref: composeRefs(handleRef, ref),
        type,
      },
      props,
    ),
    render,
  });
}
