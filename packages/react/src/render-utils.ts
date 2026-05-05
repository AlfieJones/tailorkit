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
const scriptProtocol = `java${"script"}:`;
const eventPropPattern = /^on/i;

export const toReactEventName = (event: string): string =>
  `on${event.slice(0, 1).toUpperCase()}${event.slice(1)}`;

const isEventProp = (name: string): boolean => eventPropPattern.test(name);

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
): { error: string | null; props: Record<string, unknown> } => {
  const out: Record<string, unknown> = {};

  for (const [name, value] of Object.entries(props)) {
    const lower = name.toLowerCase();
    if (blockedProps.has(lower) || isEventProp(name)) {
      return { error: `Blocked remote prop "${name}".`, props: {} };
    }
    if (urlProps.has(lower) && isUnsafeUrl(value)) {
      return { error: `Blocked unsafe remote URL prop "${name}".`, props: {} };
    }
    out[name] = value;
  }

  if (out.target === "_blank") {
    out.rel =
      typeof out.rel === "string" ? `${out.rel} noopener noreferrer` : "noopener noreferrer";
  }

  return { error: null, props: out };
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
