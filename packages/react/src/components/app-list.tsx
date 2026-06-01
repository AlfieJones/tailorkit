import { useEffect } from "react";
import type { ReactNode } from "react";
import type { ComponentProps } from "./render";
import { mergeProps, useRender } from "./render";
import type { AppListOrientation } from "./context";
import { useTailorRootContext } from "./context";

export interface AppListProps extends ComponentProps<"div"> {
  children?: ReactNode;
  orientation?: AppListOrientation;
}

export function AppList({
  children,
  orientation = "vertical",
  render,
  ...props
}: AppListProps): ReactNode {
  const context = useTailorRootContext("tailor.AppList");
  const setOrientation = context.setOrientation;

  useEffect(() => {
    setOrientation(orientation);
  }, [orientation, setOrientation]);

  return useRender({
    defaultTagName: "div",
    props: mergeProps(
      {
        "aria-orientation": orientation,
        children,
        "data-orientation": orientation,
        role: "toolbar",
      },
      props,
    ),
    render,
  });
}
