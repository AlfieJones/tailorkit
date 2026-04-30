export type Framework = "react" | "svelte" | "vue" | "angular";

export type TargetElement =
  | "a"
  | "article"
  | "aside"
  | "audio"
  | "button"
  | "canvas"
  | "details"
  | "dialog"
  | "div"
  | "fieldset"
  | "footer"
  | "form"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "header"
  | "img"
  | "input"
  | "label"
  | "li"
  | "main"
  | "nav"
  | "ol"
  | "p"
  | "section"
  | "select"
  | "span"
  | "summary"
  | "table"
  | "td"
  | "textarea"
  | "th"
  | "tr"
  | "ul"
  | "video";

interface StringSchema {
  type: "string";
  frameworks?: Framework[];
}

interface NumberSchema {
  type: "number";
  frameworks?: Framework[];
}

interface BooleanSchema {
  type: "boolean";
  frameworks?: Framework[];
}

interface EnumSchema {
  type: "enum";
  values: string[];
  frameworks?: Framework[];
}

interface RecordSchema {
  type: "record";
  key: AttributeSchema;
  value: AttributeSchema;
  frameworks?: Framework[];
}

type AttributeTypeVariant = BooleanSchema | EnumSchema | NumberSchema | RecordSchema | StringSchema;

export interface AttributeSchema {
  types: AttributeTypeVariant[];
  reactKey?: string;
  required?: boolean;
}

export interface EventSchema {
  name: Record<Framework, string>;
  payload: Record<string, AttributeSchema>;
}

export interface ElementSchema<_T extends HTMLElement> {
  type: string;
  attributes: Record<string, AttributeSchema>;
  events: Record<string, EventSchema>;
}

export const attr = {
  string: { types: [{ type: "string" }] } as AttributeSchema,
  number: { types: [{ type: "number" }] } as AttributeSchema,
  boolean: { types: [{ type: "boolean" }] } as AttributeSchema,
  record: (
    key: AttributeSchema,
    value: AttributeSchema,
    frameworks?: Framework[],
  ): AttributeSchema => ({
    types: [{ type: "record", key, value, ...(frameworks && { frameworks }) }],
  }),
  enum: (...values: string[]): AttributeSchema => ({ types: [{ type: "enum", values }] }),
};

export const booleanOrString = {
  types: [{ type: "boolean" }, { type: "string" }],
} satisfies AttributeSchema;

export const numberOrString = {
  types: [{ type: "number" }, { type: "string" }],
} satisfies AttributeSchema;

export const CROSS_ORIGIN_VALUES = ["anonymous", "use-credentials"] as const;
export const DECODING_VALUES = ["async", "auto", "sync"] as const;
export const FETCH_PRIORITY_VALUES = ["auto", "high", "low"] as const;
export const FORM_ENCTYPE_VALUES = [
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain",
] as const;
export const INPUT_TYPE_VALUES = [
  "button",
  "checkbox",
  "color",
  "date",
  "datetime-local",
  "email",
  "file",
  "hidden",
  "image",
  "month",
  "number",
  "password",
  "radio",
  "range",
  "reset",
  "search",
  "submit",
  "tel",
  "text",
  "time",
  "url",
  "week",
] as const;
export const LOADING_VALUES = ["eager", "lazy"] as const;
export const REFERRER_POLICY_VALUES = [
  "no-referrer",
  "no-referrer-when-downgrade",
  "origin",
  "origin-when-cross-origin",
  "same-origin",
  "strict-origin",
  "strict-origin-when-cross-origin",
  "unsafe-url",
] as const;

export const globalAttrs = {
  // aria
  "aria-activedescendant": attr.string,
  "aria-atomic": attr.boolean,
  "aria-autocomplete": attr.enum("both", "inline", "list", "none"),
  "aria-braillelabel": attr.string,
  "aria-brailleroledescription": attr.string,
  "aria-busy": attr.boolean,
  "aria-checked": attr.enum("false", "mixed", "true"),
  "aria-colcount": attr.number,
  "aria-colindex": attr.number,
  "aria-colindextext": attr.string,
  "aria-colspan": attr.number,
  "aria-controls": attr.string,
  "aria-current": attr.enum("date", "false", "location", "page", "step", "time", "true"),
  "aria-describedby": attr.string,
  "aria-description": attr.string,
  "aria-details": attr.string,
  "aria-disabled": attr.boolean,
  "aria-errormessage": attr.string,
  "aria-expanded": attr.boolean,
  "aria-flowto": attr.string,
  "aria-haspopup": attr.enum("dialog", "false", "grid", "listbox", "menu", "tree", "true"),
  "aria-hidden": attr.boolean,
  "aria-invalid": attr.enum("false", "grammar", "spelling", "true"),
  "aria-keyshortcuts": attr.string,
  "aria-label": attr.string,
  "aria-labelledby": attr.string,
  "aria-level": attr.number,
  "aria-live": attr.enum("assertive", "off", "polite"),
  "aria-modal": attr.boolean,
  "aria-multiline": attr.boolean,
  "aria-multiselectable": attr.boolean,
  "aria-orientation": attr.enum("horizontal", "vertical"),
  "aria-owns": attr.string,
  "aria-placeholder": attr.string,
  "aria-posinset": attr.number,
  "aria-pressed": attr.enum("false", "mixed", "true"),
  "aria-readonly": attr.boolean,
  "aria-relevant": attr.enum(
    "additions",
    "additions removals",
    "additions text",
    "all",
    "removals",
    "removals additions",
    "removals text",
    "text",
    "text additions",
    "text removals",
  ),
  "aria-required": attr.boolean,
  "aria-roledescription": attr.string,
  "aria-rowcount": attr.number,
  "aria-rowindex": attr.number,
  "aria-rowindextext": attr.string,
  "aria-rowspan": attr.number,
  "aria-selected": attr.boolean,
  "aria-setsize": attr.number,
  "aria-sort": attr.enum("ascending", "descending", "none", "other"),
  "aria-valuemax": attr.number,
  "aria-valuemin": attr.number,
  "aria-valuenow": attr.number,
  "aria-valuetext": attr.string,
  // global html
  accessKey: attr.string,
  autoCapitalize: attr.enum("characters", "none", "off", "on", "sentences", "words"),
  autoCorrect: attr.enum("off", "on"),
  autoFocus: attr.boolean,
  class: { types: [{ type: "string" }], reactKey: "className" } satisfies AttributeSchema,
  contentEditable: attr.enum("false", "inherit", "plaintext-only", "true"),
  dir: attr.enum("auto", "ltr", "rtl"),
  draggable: attr.boolean,
  enterKeyHint: attr.enum("done", "enter", "go", "next", "previous", "search", "send"),
  exportparts: attr.string,
  hidden: {
    types: [
      { type: "boolean" },
      { type: "enum", values: ["until-found"], frameworks: ["angular", "svelte", "vue"] },
    ],
  },
  id: attr.string,
  inert: attr.boolean,
  inputMode: attr.enum("decimal", "email", "none", "numeric", "search", "tel", "text", "url"),
  is: attr.string,
  itemId: attr.string,
  itemProp: attr.string,
  itemRef: attr.string,
  itemScope: attr.boolean,
  itemType: attr.string,
  lang: attr.string,
  nonce: attr.string,
  part: attr.string,
  popover: attr.enum("auto", "hint", "manual"),
  role: attr.string,
  slot: attr.string,
  spellCheck: attr.boolean,
  style: {
    types: [
      {
        type: "record",
        frameworks: ["react"],
        key: { types: [{ type: "string" }] },
        value: { types: [{ type: "string" }, { type: "number" }] },
      },
      { type: "string", frameworks: ["vue", "svelte"] },
    ],
  } satisfies AttributeSchema,
  tabIndex: attr.number,
  title: attr.string,
  translate: attr.enum("no", "yes"),
  virtualKeyboardPolicy: attr.enum("auto", "manual"),
  writingSuggestions: attr.enum("false", "true"),
} satisfies Record<string, AttributeSchema>;

const focusEventPayload = {
  relatedTargetId: attr.string,
} satisfies Record<string, AttributeSchema>;

const modifierKeyPayload = {
  altKey: attr.boolean,
  ctrlKey: attr.boolean,
  metaKey: attr.boolean,
  shiftKey: attr.boolean,
} satisfies Record<string, AttributeSchema>;

const uiEventPayload = {
  detail: attr.number,
} satisfies Record<string, AttributeSchema>;

const mouseEventPayload = {
  ...uiEventPayload,
  ...modifierKeyPayload,
  button: attr.number,
  buttons: attr.number,
  clientX: attr.number,
  clientY: attr.number,
  movementX: attr.number,
  movementY: attr.number,
  pageX: attr.number,
  pageY: attr.number,
  screenX: attr.number,
  screenY: attr.number,
} satisfies Record<string, AttributeSchema>;

const keyboardEventPayload = {
  ...uiEventPayload,
  ...modifierKeyPayload,
  code: attr.string,
  isComposing: attr.boolean,
  key: attr.string,
  location: attr.number,
  repeat: attr.boolean,
} satisfies Record<string, AttributeSchema>;

const inputEventPayload = {
  inputType: attr.string,
  isComposing: attr.boolean,
} satisfies Record<string, AttributeSchema>;

const pointerEventPayload = {
  ...mouseEventPayload,
  height: attr.number,
  isPrimary: attr.boolean,
  pointerId: attr.number,
  pointerType: attr.enum("mouse", "pen", "touch"),
  pressure: attr.number,
  tangentialPressure: attr.number,
  tiltX: attr.number,
  tiltY: attr.number,
  twist: attr.number,
  width: attr.number,
} satisfies Record<string, AttributeSchema>;

const wheelEventPayload = {
  ...mouseEventPayload,
  deltaMode: attr.number,
  deltaX: attr.number,
  deltaY: attr.number,
  deltaZ: attr.number,
} satisfies Record<string, AttributeSchema>;

const scrollEventPayload = {
  scrollHeight: attr.number,
  scrollLeft: attr.number,
  scrollTop: attr.number,
  scrollWidth: attr.number,
} satisfies Record<string, AttributeSchema>;

const animationEventPayload = {
  animationName: attr.string,
  elapsedTime: attr.number,
  pseudoElement: attr.string,
} satisfies Record<string, AttributeSchema>;

const transitionEventPayload = {
  elapsedTime: attr.number,
  propertyName: attr.string,
  pseudoElement: attr.string,
} satisfies Record<string, AttributeSchema>;

const toggleEventPayload = {
  newState: attr.enum("closed", "open"),
  oldState: attr.enum("closed", "open"),
} satisfies Record<string, AttributeSchema>;

export const globalEvents = {
  animationcancel: {
    name: {
      react: "onAnimationCancel",
      vue: "animationcancel",
      svelte: "animationcancel",
      angular: "animationcancel",
    },
    payload: animationEventPayload,
  },
  animationend: {
    name: {
      react: "onAnimationEnd",
      vue: "animationend",
      svelte: "animationend",
      angular: "animationend",
    },
    payload: animationEventPayload,
  },
  animationiteration: {
    name: {
      react: "onAnimationIteration",
      vue: "animationiteration",
      svelte: "animationiteration",
      angular: "animationiteration",
    },
    payload: animationEventPayload,
  },
  animationstart: {
    name: {
      react: "onAnimationStart",
      vue: "animationstart",
      svelte: "animationstart",
      angular: "animationstart",
    },
    payload: animationEventPayload,
  },
  auxclick: {
    name: { react: "onAuxClick", vue: "auxclick", svelte: "auxclick", angular: "auxclick" },
    payload: mouseEventPayload,
  },
  beforeinput: {
    name: {
      react: "onBeforeInput",
      vue: "beforeinput",
      svelte: "beforeinput",
      angular: "beforeinput",
    },
    payload: inputEventPayload,
  },
  beforetoggle: {
    name: {
      react: "onBeforeToggle",
      vue: "beforetoggle",
      svelte: "beforetoggle",
      angular: "beforetoggle",
    },
    payload: toggleEventPayload,
  },
  blur: {
    name: { react: "onBlur", vue: "blur", svelte: "blur", angular: "blur" },
    payload: focusEventPayload,
  },
  change: {
    name: { react: "onChange", vue: "change", svelte: "change", angular: "change" },
    payload: {},
  },
  focus: {
    name: { react: "onFocus", vue: "focus", svelte: "focus", angular: "focus" },
    payload: focusEventPayload,
  },
  click: {
    name: { react: "onClick", vue: "click", svelte: "click", angular: "click" },
    payload: mouseEventPayload,
  },
  contextmenu: {
    name: {
      react: "onContextMenu",
      vue: "contextmenu",
      svelte: "contextmenu",
      angular: "contextmenu",
    },
    payload: mouseEventPayload,
  },
  copy: {
    name: { react: "onCopy", vue: "copy", svelte: "copy", angular: "copy" },
    payload: {},
  },
  cut: {
    name: { react: "onCut", vue: "cut", svelte: "cut", angular: "cut" },
    payload: {},
  },
  dblclick: {
    name: { react: "onDblClick", vue: "dblclick", svelte: "dblclick", angular: "dblclick" },
    payload: mouseEventPayload,
  },
  drag: {
    name: { react: "onDrag", vue: "drag", svelte: "drag", angular: "drag" },
    payload: mouseEventPayload,
  },
  dragend: {
    name: { react: "onDragEnd", vue: "dragend", svelte: "dragend", angular: "dragend" },
    payload: mouseEventPayload,
  },
  dragenter: {
    name: { react: "onDragEnter", vue: "dragenter", svelte: "dragenter", angular: "dragenter" },
    payload: mouseEventPayload,
  },
  dragleave: {
    name: { react: "onDragLeave", vue: "dragleave", svelte: "dragleave", angular: "dragleave" },
    payload: mouseEventPayload,
  },
  dragover: {
    name: { react: "onDragOver", vue: "dragover", svelte: "dragover", angular: "dragover" },
    payload: mouseEventPayload,
  },
  dragstart: {
    name: { react: "onDragStart", vue: "dragstart", svelte: "dragstart", angular: "dragstart" },
    payload: mouseEventPayload,
  },
  drop: {
    name: { react: "onDrop", vue: "drop", svelte: "drop", angular: "drop" },
    payload: mouseEventPayload,
  },
  input: {
    name: { react: "onInput", vue: "input", svelte: "input", angular: "input" },
    payload: inputEventPayload,
  },
  invalid: {
    name: { react: "onInvalid", vue: "invalid", svelte: "invalid", angular: "invalid" },
    payload: {},
  },
  keydown: {
    name: { react: "onKeyDown", vue: "keydown", svelte: "keydown", angular: "keydown" },
    payload: keyboardEventPayload,
  },
  keyup: {
    name: { react: "onKeyUp", vue: "keyup", svelte: "keyup", angular: "keyup" },
    payload: keyboardEventPayload,
  },
  mouseenter: {
    name: { react: "onMouseEnter", vue: "mouseenter", svelte: "mouseenter", angular: "mouseenter" },
    payload: mouseEventPayload,
  },
  mouseleave: {
    name: { react: "onMouseLeave", vue: "mouseleave", svelte: "mouseleave", angular: "mouseleave" },
    payload: mouseEventPayload,
  },
  mousedown: {
    name: { react: "onMouseDown", vue: "mousedown", svelte: "mousedown", angular: "mousedown" },
    payload: mouseEventPayload,
  },
  mousemove: {
    name: { react: "onMouseMove", vue: "mousemove", svelte: "mousemove", angular: "mousemove" },
    payload: mouseEventPayload,
  },
  mouseout: {
    name: { react: "onMouseOut", vue: "mouseout", svelte: "mouseout", angular: "mouseout" },
    payload: mouseEventPayload,
  },
  mouseover: {
    name: { react: "onMouseOver", vue: "mouseover", svelte: "mouseover", angular: "mouseover" },
    payload: mouseEventPayload,
  },
  mouseup: {
    name: { react: "onMouseUp", vue: "mouseup", svelte: "mouseup", angular: "mouseup" },
    payload: mouseEventPayload,
  },
  pointercancel: {
    name: {
      react: "onPointerCancel",
      vue: "pointercancel",
      svelte: "pointercancel",
      angular: "pointercancel",
    },
    payload: pointerEventPayload,
  },
  pointerdown: {
    name: {
      react: "onPointerDown",
      vue: "pointerdown",
      svelte: "pointerdown",
      angular: "pointerdown",
    },
    payload: pointerEventPayload,
  },
  pointerenter: {
    name: {
      react: "onPointerEnter",
      vue: "pointerenter",
      svelte: "pointerenter",
      angular: "pointerenter",
    },
    payload: pointerEventPayload,
  },
  pointerleave: {
    name: {
      react: "onPointerLeave",
      vue: "pointerleave",
      svelte: "pointerleave",
      angular: "pointerleave",
    },
    payload: pointerEventPayload,
  },
  pointermove: {
    name: {
      react: "onPointerMove",
      vue: "pointermove",
      svelte: "pointermove",
      angular: "pointermove",
    },
    payload: pointerEventPayload,
  },
  pointerout: {
    name: { react: "onPointerOut", vue: "pointerout", svelte: "pointerout", angular: "pointerout" },
    payload: pointerEventPayload,
  },
  pointerover: {
    name: {
      react: "onPointerOver",
      vue: "pointerover",
      svelte: "pointerover",
      angular: "pointerover",
    },
    payload: pointerEventPayload,
  },
  pointerup: {
    name: { react: "onPointerUp", vue: "pointerup", svelte: "pointerup", angular: "pointerup" },
    payload: pointerEventPayload,
  },
  paste: {
    name: { react: "onPaste", vue: "paste", svelte: "paste", angular: "paste" },
    payload: {},
  },
  scroll: {
    name: { react: "onScroll", vue: "scroll", svelte: "scroll", angular: "scroll" },
    payload: scrollEventPayload,
  },
  select: {
    name: { react: "onSelect", vue: "select", svelte: "select", angular: "select" },
    payload: {},
  },
  reset: {
    name: { react: "onReset", vue: "reset", svelte: "reset", angular: "reset" },
    payload: {},
  },
  submit: {
    name: { react: "onSubmit", vue: "submit", svelte: "submit", angular: "submit" },
    payload: {},
  },
  toggle: {
    name: { react: "onToggle", vue: "toggle", svelte: "toggle", angular: "toggle" },
    payload: toggleEventPayload,
  },
  transitionend: {
    name: {
      react: "onTransitionEnd",
      vue: "transitionend",
      svelte: "transitionend",
      angular: "transitionend",
    },
    payload: transitionEventPayload,
  },
  wheel: {
    name: { react: "onWheel", vue: "wheel", svelte: "wheel", angular: "wheel" },
    payload: wheelEventPayload,
  },
} satisfies Record<string, EventSchema>;

export const mediaAttrs = {
  autoPlay: attr.boolean,
  controls: attr.boolean,
  controlsList: attr.string,
  crossOrigin: attr.enum(...CROSS_ORIGIN_VALUES),
  loop: attr.boolean,
  muted: attr.boolean,
  preload: attr.enum("auto", "metadata", "none"),
  src: attr.string,
} satisfies Record<string, AttributeSchema>;

export const formSubmitterAttrs = {
  form: attr.string,
  formAction: attr.string,
  formEncType: attr.enum(...FORM_ENCTYPE_VALUES),
  formMethod: attr.enum("dialog", "get", "post"),
  formNoValidate: attr.boolean,
  formTarget: attr.string,
} satisfies Record<string, AttributeSchema>;

export const createSchema = <TElement extends HTMLElement>(
  type: TargetElement,
  attributes: Record<string, AttributeSchema> = {},
): ElementSchema<TElement> => ({
  type,
  attributes: {
    ...globalAttrs,
    ...attributes,
  },
  events: {
    ...globalEvents,
  },
});
