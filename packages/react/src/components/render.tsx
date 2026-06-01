import { cloneElement, createElement, isValidElement, useMemo } from "react";
import type {
  CSSProperties,
  ComponentPropsWithoutRef,
  DOMAttributes,
  ElementType,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
} from "react";

type ElementProps<TTagName extends ElementType> = ComponentPropsWithoutRef<TTagName> & {
  ref?: Ref<unknown>;
};

export interface RenderProps {
  render?: ReactElement<Record<string, unknown>>;
}

export type ComponentProps<TTagName extends ElementType> = ElementProps<TTagName> & RenderProps;

export function useRender<TTagName extends ElementType>({
  defaultTagName,
  props,
  render,
}: {
  defaultTagName: TTagName;
  props: ElementProps<TTagName>;
  render?: ReactElement<Record<string, unknown>>;
}): ReactNode {
  return useMemo(() => {
    if (render) {
      if (!isValidElement(render)) {
        throw new Error("The render prop must be a valid React element.");
      }

      return cloneElement(render, mergeProps(render.props, props));
    }

    return createElement(defaultTagName, props);
  }, [defaultTagName, props, render]);
}

export function mergeProps<TProps extends Record<string, unknown>>(
  ...propSets: (TProps | Record<string, unknown> | undefined)[]
): TProps {
  const merged: Record<string, unknown> = {};

  for (const props of propSets) {
    if (!props) {
      continue;
    }

    for (const [key, value] of Object.entries(props)) {
      if (value === undefined) {
        continue;
      }

      const existing = merged[key];

      if (key === "className" && existing && value) {
        merged[key] = `${existing as string} ${value as string}`;
        continue;
      }

      if (key === "style" && existing && value) {
        merged[key] = {
          ...(existing as CSSProperties),
          ...(value as CSSProperties),
        };
        continue;
      }

      if (key === "ref" && existing && value) {
        merged[key] = composeRefs(existing as Ref<unknown>, value as Ref<unknown>);
        continue;
      }

      if (isEventHandler(key) && typeof existing === "function" && typeof value === "function") {
        merged[key] = (...args: unknown[]) => {
          (existing as (...eventArgs: unknown[]) => void)(...args);
          const event = args[0] as { defaultPrevented?: boolean } | undefined;
          if (!event?.defaultPrevented) {
            (value as (...eventArgs: unknown[]) => void)(...args);
          }
        };
        continue;
      }

      merged[key] = value;
    }
  }

  return merged as TProps;
}

export function composeRefs<T>(...refs: (Ref<T> | undefined)[]): Ref<T> {
  return (node: T) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as { current: T | null }).current = node;
      }
    }
  };
}

function isEventHandler(key: string): key is keyof DOMAttributes<HTMLElement> {
  return /^on[A-Z]/u.test(key);
}

export type HtmlProps<TElement extends HTMLElement> = HTMLAttributes<TElement> & {
  ref?: Ref<TElement>;
};
