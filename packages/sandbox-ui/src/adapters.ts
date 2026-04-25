import type { HostController, HostRenderer } from "./host";
import type { RemoteElementNode, RemoteHostEvent } from "./protocol";
import { getRemoteComponentName } from "./protocol";

type ReactCreateElement = (
  type: unknown,
  props: Record<string, unknown> | null,
  ...children: unknown[]
) => unknown;

interface ReactHostRendererOptions {
  blockedElements?: readonly string[];
  components?: Record<string, unknown>;
  onEventError?: (error: unknown) => void;
}

const defaultBlockedElements = new Set([
  "applet",
  "base",
  "body",
  "embed",
  "form",
  "frame",
  "frameset",
  "head",
  "html",
  "iframe",
  "link",
  "math",
  "meta",
  "object",
  "param",
  "script",
  "style",
  "svg",
  "title",
]);

const blockedProps = new Set(["dangerouslysetinnerhtml", "innerHTML", "v-html", "srcdoc", "style"]);
const urlProps = new Set([
  "action",
  "background",
  "cite",
  "formaction",
  "href",
  "poster",
  "src",
  "srcset",
  "xlinkhref",
]);

const toReactEventName = (event: string): string =>
  `on${event.slice(0, 1).toUpperCase()}${event.slice(1)}`;

const maximumControlCharacterCode = 32;
const deleteCharacterCode = 127;
const scriptProtocol = ["java", "script:"].join("");
const eventPropPattern = /^on/i;

const isEventProp = (name: string): boolean => eventPropPattern.test(name);

const isUnsafeUrl = (value: unknown): boolean => {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = [...value]
    .filter((character) => {
      const codePoint = character.codePointAt(0);
      return (
        codePoint !== undefined &&
        codePoint > maximumControlCharacterCode &&
        codePoint !== deleteCharacterCode
      );
    })
    .join("")
    .toLowerCase();

  return normalized.startsWith(scriptProtocol) || normalized.startsWith("data:");
};

const createRemoteRenderError = (createElement: ReactCreateElement, message: string): unknown =>
  createElement(
    "pre",
    {
      role: "alert",
      style: {
        background: "#fff1f0",
        border: "1px solid #ffccc7",
        borderRadius: 6,
        color: "#8a1f11",
        margin: 0,
        padding: 12,
        whiteSpace: "pre-wrap",
      },
    },
    message,
  );

const sanitizeProps = (
  props: Record<string, unknown>,
): { error: string | null; props: Record<string, unknown> } => {
  const sanitizedProps: Record<string, unknown> = {};

  for (const [name, value] of Object.entries(props)) {
    const normalizedName = name.toLowerCase();
    if (blockedProps.has(normalizedName) || isEventProp(name)) {
      return {
        error: `Blocked remote prop "${name}".`,
        props: {},
      };
    }

    if (urlProps.has(normalizedName) && isUnsafeUrl(value)) {
      return {
        error: `Blocked unsafe remote URL prop "${name}".`,
        props: {},
      };
    }

    sanitizedProps[name] = value;
  }

  if (sanitizedProps.target === "_blank") {
    sanitizedProps.rel =
      typeof sanitizedProps.rel === "string"
        ? `${sanitizedProps.rel} noopener noreferrer`
        : "noopener noreferrer";
  }

  return {
    error: null,
    props: sanitizedProps,
  };
};

const createHostEvent = (
  node: RemoteElementNode,
  name: RemoteHostEvent["name"],
  event: Event,
): RemoteHostEvent => {
  const target = event.target as HTMLInputElement | null;
  return {
    checked: target?.checked,
    currentTargetId: node.id,
    key: "key" in event ? String(event.key) : undefined,
    name,
    targetId: node.id,
    value: target?.value,
  };
};

export const createReactHostRenderer = (
  createElement: ReactCreateElement,
  fragment: unknown,
  controller: HostController,
  options: ReactHostRendererOptions = {},
): HostRenderer<unknown> => {
  const blockedElements =
    options.blockedElements === undefined
      ? defaultBlockedElements
      : new Set(options.blockedElements);

  return {
    renderElement(node, children) {
      const elementName = node.type.toLowerCase();
      const componentName = getRemoteComponentName(node.type);

      if (componentName === null && blockedElements.has(elementName)) {
        return createRemoteRenderError(createElement, `Blocked remote element "${elementName}".`);
      }

      const sanitizeResult = sanitizeProps({
        ...node.props,
        key: node.key ?? node.id,
      });
      if (sanitizeResult.error !== null) {
        return createRemoteRenderError(createElement, sanitizeResult.error);
      }

      const { props } = sanitizeResult;
      for (const binding of node.events ?? []) {
        props[toReactEventName(binding.event)] = (event: Event) => {
          void (async () => {
            try {
              await controller.dispatchEvent(binding, createHostEvent(node, binding.event, event));
            } catch (error) {
              options.onEventError?.(error);
            }
          })();
        };
      }

      if (componentName === null) {
        return createElement(node.type, props, ...children);
      }

      const component = options.components?.[componentName];
      if (component === undefined) {
        return createRemoteRenderError(
          createElement,
          `Missing remote component "${componentName}".`,
        );
      }

      return createElement(component, props, ...children);
    },
    renderFragment(children) {
      return createElement(fragment, null, ...children);
    },
    renderText(text) {
      return text;
    },
  };
};
