import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { HostController, HostRenderer } from "./host";
import type { RemoteElementNode, RemoteFunctionRef, RemoteHostEvent } from "./protocol";
import { getRemoteComponentName } from "./protocol";

type ReactCreateElement = (
  type: unknown,
  props: Record<string, unknown> | null,
  ...children: unknown[]
) => unknown;

interface ReactHostRendererOptions {
  blockedElements?: readonly string[];
  callbackDefinitions?: RemoteCallbackDefinitions;
  components?: Record<string, unknown>;
  onEventError?: (error: unknown) => void;
}

export interface RemoteCallbackDefinition {
  input?: StandardSchemaV1;
  output?: StandardSchemaV1;
}

export type RemoteCallbackDefinitions = Record<
  string,
  Record<string, RemoteCallbackDefinition | undefined> | undefined
>;

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

const isRemoteFunctionRef = (value: unknown): value is RemoteFunctionRef =>
  typeof value === "object" &&
  value !== null &&
  "kind" in value &&
  value.kind === "function" &&
  "handlerId" in value &&
  typeof value.handlerId === "string";

const hasRemoteFunctionRef = (value: unknown): boolean => {
  if (isRemoteFunctionRef(value)) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.some(hasRemoteFunctionRef);
  }
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return Object.values(value).some(hasRemoteFunctionRef);
};

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

const formatSchemaIssues = (issues: readonly StandardSchemaV1.Issue[]): string =>
  issues
    .map((issue) => {
      const path =
        issue.path === undefined
          ? ""
          : issue.path
              .map((segment) =>
                typeof segment === "object" ? String(segment.key) : String(segment),
              )
              .join(".");
      return path.length > 0 ? `${path}: ${issue.message}` : issue.message;
    })
    .join("; ");

const validateSchema = async (
  schema: StandardSchemaV1,
  value: unknown,
  label: string,
): Promise<unknown> => {
  const result = await schema["~standard"].validate(value);
  if (result.issues !== undefined) {
    throw new Error(`${label} failed validation: ${formatSchemaIssues(result.issues)}`);
  }
  return result.value;
};

const sanitizeProps = (
  props: Record<string, unknown>,
  options: { allowFunctionRefs: boolean },
): { error: string | null; props: Record<string, unknown> } => {
  const sanitizedProps: Record<string, unknown> = {};

  for (const [name, value] of Object.entries(props)) {
    const normalizedName = name.toLowerCase();
    if (blockedProps.has(normalizedName) || (!options.allowFunctionRefs && isEventProp(name))) {
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

    if (!options.allowFunctionRefs && hasRemoteFunctionRef(value)) {
      return {
        error: `Blocked remote function prop "${name}".`,
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

const hydrateRemoteFunctions = (
  value: unknown,
  definition: RemoteCallbackDefinition | undefined,
  controller: HostController,
  onError: ((error: unknown) => void) | undefined,
): unknown => {
  if (isRemoteFunctionRef(value)) {
    return async (...args: unknown[]) => {
      try {
        if (definition !== undefined && definition.input === undefined && args.length > 0) {
          throw new Error("Callback input failed validation: expected no arguments.");
        }
        const validatedArgs =
          definition?.input === undefined
            ? args
            : [await validateSchema(definition.input, args[0], "Callback input")];
        const callResult = await controller.callFunction(value.handlerId, validatedArgs);
        if (callResult.render.type === "error") {
          throw new Error(callResult.render.message);
        }
        if (definition?.output === undefined) {
          return;
        }
        return await validateSchema(definition.output, callResult.result, "Callback output");
      } catch (error) {
        onError?.(error);
        throw error;
      }
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => hydrateRemoteFunctions(item, undefined, controller, onError));
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  const hydrated: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    hydrated[key] = hydrateRemoteFunctions(entry, undefined, controller, onError);
  }
  return hydrated;
};

const hydrateCallbackObject = (
  value: unknown,
  definitions: Record<string, RemoteCallbackDefinition | undefined> | undefined,
  controller: HostController,
  onError: ((error: unknown) => void) | undefined,
): unknown => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return hydrateRemoteFunctions(value, undefined, controller, onError);
  }

  const hydrated: Record<string, unknown> = {};
  for (const [name, entry] of Object.entries(value)) {
    hydrated[name] = hydrateRemoteFunctions(entry, definitions?.[name], controller, onError);
  }
  return hydrated;
};

const hydrateProps = (
  props: Record<string, unknown>,
  definitions: Record<string, RemoteCallbackDefinition | undefined> | undefined,
  controller: HostController,
  onError: ((error: unknown) => void) | undefined,
): Record<string, unknown> => {
  const hydrated: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(props)) {
    hydrated[name] =
      name === "callbacks"
        ? hydrateCallbackObject(value, definitions, controller, onError)
        : hydrateRemoteFunctions(value, definitions?.[name], controller, onError);
  }
  return hydrated;
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

const toReactProps = (props: Record<string, unknown>): Record<string, unknown> => {
  if (!("class" in props) && !("for" in props)) {
    return props;
  }
  const { class: className, for: htmlFor, ...rest } = props;
  return {
    ...rest,
    ...(className !== undefined && { className }),
    ...(htmlFor !== undefined && { htmlFor }),
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

      const sanitizeResult = sanitizeProps(
        {
          ...node.props,
          key: node.key ?? node.id,
        },
        {
          allowFunctionRefs: componentName !== null,
        },
      );
      if (sanitizeResult.error !== null) {
        return createRemoteRenderError(createElement, sanitizeResult.error);
      }

      const props =
        componentName === null
          ? sanitizeResult.props
          : hydrateProps(
              sanitizeResult.props,
              options.callbackDefinitions?.[componentName],
              controller,
              options.onEventError,
            );
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
        return createElement(node.type, toReactProps(props), ...children);
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
