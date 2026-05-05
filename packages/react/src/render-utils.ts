import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { HostController } from "@tailorkit/sandbox-ui/host";
import type {
  RemoteElementNode,
  RemoteFunctionRef,
  RemoteHostEvent,
} from "@tailorkit/sandbox-ui/protocol";

export interface RemoteCallbackDefinition {
  input?: readonly StandardSchemaV1[];
  output?: StandardSchemaV1;
}

export type RemoteCallbackDefinitions = Record<
  string,
  Record<string, RemoteCallbackDefinition | undefined> | undefined
>;

const blockedProps = new Set(["dangerouslysetinnerhtml", "innerhtml", "v-html", "srcdoc", "style"]);
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
const maximumControlCharacterCode = 32;
const deleteCharacterCode = 127;
const scriptProtocol = "javascript:";
const eventPropPattern = /^on/i;

export const toReactEventName = (event: string): string =>
  `on${event.slice(0, 1).toUpperCase()}${event.slice(1)}`;

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
    .filter((ch) => {
      const cp = ch.codePointAt(0);
      return cp !== undefined && cp > maximumControlCharacterCode && cp !== deleteCharacterCode;
    })
    .join("")
    .toLowerCase();
  return normalized.startsWith(scriptProtocol) || normalized.startsWith("data:");
};

export const sanitizeProps = (
  props: Record<string, unknown>,
  options: { allowFunctionRefs: boolean },
): { error: string | null; props: Record<string, unknown> } => {
  const out: Record<string, unknown> = {};

  for (const [name, value] of Object.entries(props)) {
    const lower = name.toLowerCase();
    if (blockedProps.has(lower) || (!options.allowFunctionRefs && isEventProp(name))) {
      return { error: `Blocked remote prop "${name}".`, props: {} };
    }
    if (urlProps.has(lower) && isUnsafeUrl(value)) {
      return { error: `Blocked unsafe remote URL prop "${name}".`, props: {} };
    }
    if (!options.allowFunctionRefs && hasRemoteFunctionRef(value)) {
      return { error: `Blocked remote function prop "${name}".`, props: {} };
    }
    out[name] = value;
  }

  if (out.target === "_blank") {
    out.rel =
      typeof out.rel === "string" ? `${out.rel} noopener noreferrer` : "noopener noreferrer";
  }

  return { error: null, props: out };
};

const formatIssues = (issues: readonly StandardSchemaV1.Issue[]): string =>
  issues
    .map((i) => {
      const path =
        i.path === undefined
          ? ""
          : i.path
              .map((seg: unknown) =>
                typeof seg === "object" && seg !== null && "key" in seg
                  ? String((seg as { key: unknown }).key)
                  : String(seg),
              )
              .join(".");
      return path.length > 0 ? `${path}: ${i.message}` : i.message;
    })
    .join("; ");

const validateSchema = async (
  schema: StandardSchemaV1,
  value: unknown,
  label: string,
): Promise<unknown> => {
  const result = await schema["~standard"].validate(value);
  if (result.issues !== undefined) {
    throw new Error(`${label} failed validation: ${formatIssues(result.issues)}`);
  }
  return result.value;
};

export const hydrateRemoteFunctions = (
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
        if (definition?.input !== undefined && args.length !== definition.input.length) {
          throw new Error(
            `Callback input failed validation: expected ${definition.input.length} arguments.`,
          );
        }
        const validatedArgs =
          definition?.input === undefined
            ? args
            : await Promise.all(
                definition.input.map((s, i) => validateSchema(s, args[i], `Callback input ${i}`)),
              );
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
  for (const [k, v] of Object.entries(value)) {
    hydrated[k] = hydrateRemoteFunctions(v, undefined, controller, onError);
  }
  return hydrated;
};

export const hydrateProps = (
  props: Record<string, unknown>,
  definitions: Record<string, RemoteCallbackDefinition | undefined> | undefined,
  controller: HostController,
  onError: ((error: unknown) => void) | undefined,
): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(props)) {
    out[name] =
      name === "callbacks"
        ? hydrateCallbackObject(value, definitions, controller, onError)
        : hydrateRemoteFunctions(value, definitions?.[name], controller, onError);
  }
  return out;
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
  const out: Record<string, unknown> = {};
  for (const [name, v] of Object.entries(value)) {
    out[name] = hydrateRemoteFunctions(v, definitions?.[name], controller, onError);
  }
  return out;
};

export const toReactProps = (props: Record<string, unknown>): Record<string, unknown> => {
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

export const createHostEvent = (
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
