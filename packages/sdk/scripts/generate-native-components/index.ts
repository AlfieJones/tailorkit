#!/usr/bin/env bun
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { bridgeEvents, bridgeProps } from "./bridge";
import type { EventDefinition } from "./bridge";
import { aSchema } from "./elements/a";
import { articleSchema } from "./elements/article";
import { asideSchema } from "./elements/aside";
import { audioSchema } from "./elements/audio";
import { buttonSchema } from "./elements/button";
import { canvasSchema } from "./elements/canvas";
import { detailsSchema } from "./elements/details";
import { dialogSchema } from "./elements/dialog";
import { divSchema } from "./elements/div";
import { fieldsetSchema } from "./elements/fieldset";
import { footerSchema } from "./elements/footer";
import { formSchema } from "./elements/form";
import type { ElementSchema, TargetElement } from "./elements/globals";
import { h1Schema } from "./elements/h1";
import { h2Schema } from "./elements/h2";
import { h3Schema } from "./elements/h3";
import { h4Schema } from "./elements/h4";
import { h5Schema } from "./elements/h5";
import { h6Schema } from "./elements/h6";
import { headerSchema } from "./elements/header";
import { imgSchema } from "./elements/img";
import { inputSchema } from "./elements/input";
import { labelSchema } from "./elements/label";
import { liSchema } from "./elements/li";
import { mainSchema } from "./elements/main";
import { navSchema } from "./elements/nav";
import { olSchema } from "./elements/ol";
import { pSchema } from "./elements/p";
import { sectionSchema } from "./elements/section";
import { selectSchema } from "./elements/select";
import { spanSchema } from "./elements/span";
import { summarySchema } from "./elements/summary";
import { tableSchema } from "./elements/table";
import { tdSchema } from "./elements/td";
import { textareaSchema } from "./elements/textarea";
import { thSchema } from "./elements/th";
import { trSchema } from "./elements/tr";
import { ulSchema } from "./elements/ul";
import { videoSchema } from "./elements/video";
import { arktypeRenderer, valibotRenderer, zodRenderer } from "./renderers";
import type { PropField, Renderer } from "./types";

const ELEMENT_SCHEMAS = {
  a: aSchema,
  article: articleSchema,
  aside: asideSchema,
  audio: audioSchema,
  button: buttonSchema,
  canvas: canvasSchema,
  details: detailsSchema,
  dialog: dialogSchema,
  div: divSchema,
  fieldset: fieldsetSchema,
  footer: footerSchema,
  form: formSchema,
  h1: h1Schema,
  h2: h2Schema,
  h3: h3Schema,
  h4: h4Schema,
  h5: h5Schema,
  h6: h6Schema,
  header: headerSchema,
  img: imgSchema,
  input: inputSchema,
  label: labelSchema,
  li: liSchema,
  main: mainSchema,
  nav: navSchema,
  ol: olSchema,
  p: pSchema,
  section: sectionSchema,
  select: selectSchema,
  span: spanSchema,
  summary: summarySchema,
  table: tableSchema,
  td: tdSchema,
  textarea: textareaSchema,
  th: thSchema,
  tr: trSchema,
  ul: ulSchema,
  video: videoSchema,
} satisfies Record<TargetElement, ElementSchema<HTMLElement>>;

type ImplementedElement = keyof typeof ELEMENT_SCHEMAS;

interface ElementData {
  props: PropField[];
  events: EventDefinition[];
}

type ReactEventMapper =
  | "animation"
  | "clipboard"
  | "form"
  | "focus"
  | "input"
  | "keyboard"
  | "mouse"
  | "pointer"
  | "scroll"
  | "toggle"
  | "transition"
  | "wheel";

const EXACT_REACT_EVENT_MAPPERS: Readonly<Record<string, ReactEventMapper>> = {
  beforeinput: "input",
  beforetoggle: "toggle",
  blur: "focus",
  change: "form",
  copy: "clipboard",
  cut: "clipboard",
  focus: "focus",
  input: "input",
  invalid: "form",
  keydown: "keyboard",
  keyup: "keyboard",
  paste: "clipboard",
  reset: "form",
  scroll: "scroll",
  select: "form",
  submit: "form",
  toggle: "toggle",
  transitionend: "transition",
  wheel: "wheel",
};

const formatGeneratedFiles = (files: string[]) =>
  new Promise<void>((resolve, reject) => {
    const subprocess = spawn("bun", ["x", "oxfmt", "--write", ...files], {
      stdio: "inherit",
    });

    subprocess.on("error", reject);
    subprocess.on("close", (exitCode) => {
      if (exitCode === 0) {
        resolve();
        return;
      }
      reject(new Error(`oxfmt failed with exit code ${exitCode}`));
    });
  });

function buildElementData(element: ImplementedElement): ElementData {
  return {
    props: bridgeProps(ELEMENT_SCHEMAS[element], "react"),
    events: bridgeEvents(ELEMENT_SCHEMAS[element], "react"),
  };
}

function generatePresetFile(
  elementData: Record<ImplementedElement, ElementData>,
  renderer: Renderer,
): string {
  const lines: string[] = [
    "// Auto-generated. Run: bun packages/sdk/scripts/generate-native-components",
    ...renderer.fileHeader.split("\n").filter((line) => !line.startsWith("// Auto-generated")),
    'import type { ComponentPreset, NativeEventMap } from "./config";',
    "",
  ];

  for (const element of Object.keys(elementData) as ImplementedElement[]) {
    const { props, events } = elementData[element];
    const propEntries = props.map((f) => renderer.renderPropField(f));
    lines.push(`const ${element}Fields = ${renderer.renderObject(propEntries)};`);
    lines.push("");
    lines.push(`const ${element}NativeEvents = {`);
    for (const event of events) {
      lines.push(`  ${event.eventKey}: {`);
      lines.push(`    element: "${element}",`);
      lines.push(`    input: ${renderer.renderHandlerInput(event.eventKey, event.payload)},`);
      lines.push(`    name: "${event.eventKey}",`);
      lines.push("  },");
    }
    lines.push("} as const satisfies NativeEventMap;");
    lines.push("");
  }

  lines.push("type NativePresets = {");
  for (const element of Object.keys(elementData) as ImplementedElement[]) {
    lines.push(
      `  ${element}: ComponentPreset<typeof ${element}Fields, Record<string, never>, typeof ${element}NativeEvents>;`,
    );
  }
  lines.push("};");
  lines.push("");

  lines.push("export const native: NativePresets = {");
  for (const element of Object.keys(elementData) as ImplementedElement[]) {
    const { props } = elementData[element];
    lines.push(`  ${element}: {`);
    lines.push(`    fieldKeys: ${JSON.stringify(props.map(({ name }) => name))},`);
    lines.push(`    fields: ${element}Fields,`);
    lines.push(`    nativeEvents: ${element}NativeEvents,`);
    lines.push(
      `  } satisfies ComponentPreset<typeof ${element}Fields, Record<string, never>, typeof ${element}NativeEvents>,`,
    );
  }
  lines.push("} as const;");
  lines.push("");
  return lines.join("\n");
}

const REACT_ELEMENT_TYPES = {
  a: "HTMLAnchorElement",
  article: "HTMLElement",
  aside: "HTMLElement",
  audio: "HTMLAudioElement",
  button: "HTMLButtonElement",
  canvas: "HTMLCanvasElement",
  details: "HTMLDetailsElement",
  dialog: "HTMLDialogElement",
  div: "HTMLDivElement",
  fieldset: "HTMLFieldSetElement",
  footer: "HTMLElement",
  form: "HTMLFormElement",
  h1: "HTMLHeadingElement",
  h2: "HTMLHeadingElement",
  h3: "HTMLHeadingElement",
  h4: "HTMLHeadingElement",
  h5: "HTMLHeadingElement",
  h6: "HTMLHeadingElement",
  header: "HTMLElement",
  img: "HTMLImageElement",
  input: "HTMLInputElement",
  label: "HTMLLabelElement",
  li: "HTMLLIElement",
  main: "HTMLElement",
  nav: "HTMLElement",
  ol: "HTMLOListElement",
  p: "HTMLParagraphElement",
  section: "HTMLElement",
  select: "HTMLSelectElement",
  span: "HTMLSpanElement",
  summary: "HTMLElement",
  table: "HTMLTableElement",
  td: "HTMLElement",
  textarea: "HTMLTextAreaElement",
  th: "HTMLElement",
  tr: "HTMLTableRowElement",
  ul: "HTMLUListElement",
  video: "HTMLVideoElement",
} satisfies Record<ImplementedElement, string>;

function getReactElementType(element: ImplementedElement): string {
  return REACT_ELEMENT_TYPES[element];
}

function getReactEventMapper(eventKey: string): ReactEventMapper {
  const exactMapper = EXACT_REACT_EVENT_MAPPERS[eventKey];
  if (exactMapper) {
    return exactMapper;
  }
  if (eventKey.startsWith("animation")) {
    return "animation";
  }
  if (eventKey.startsWith("pointer")) {
    return "pointer";
  }
  return "mouse";
}

function getReactEventType(mapper: ReactEventMapper, elementType: string): string {
  switch (mapper) {
    case "animation": {
      return `AnimationEvent<${elementType}>`;
    }
    case "clipboard": {
      return `ClipboardEvent<${elementType}>`;
    }
    case "form": {
      return `SyntheticEvent<${elementType}>`;
    }
    case "focus": {
      return `FocusEvent<${elementType}>`;
    }
    case "input": {
      return `FormEvent<${elementType}>`;
    }
    case "keyboard": {
      return `KeyboardEvent<${elementType}>`;
    }
    case "pointer": {
      return `PointerEvent<${elementType}>`;
    }
    case "scroll": {
      return `UIEvent<${elementType}>`;
    }
    case "toggle": {
      return `SyntheticEvent<${elementType}>`;
    }
    case "transition": {
      return `TransitionEvent<${elementType}>`;
    }
    case "wheel": {
      return `WheelEvent<${elementType}>`;
    }
    case "mouse": {
      return `MouseEvent<${elementType}>`;
    }
    default: {
      throw new Error("Unhandled React event mapper");
    }
  }
}

function renderReactMapEventCall(mapper: ReactEventMapper, eventKey: string): string {
  switch (mapper) {
    case "animation": {
      return `mapAnimationEvent("${eventKey}", event)`;
    }
    case "clipboard": {
      return `mapBaseEvent("${eventKey}", event)`;
    }
    case "form": {
      return `mapBaseEvent("${eventKey}", event)`;
    }
    case "focus": {
      return `mapFocusEvent("${eventKey}", event)`;
    }
    case "input": {
      return `mapInputEvent("${eventKey}", event)`;
    }
    case "keyboard": {
      return `mapKeyboardEvent("${eventKey}", event)`;
    }
    case "pointer": {
      return `mapPointerEvent("${eventKey}", event)`;
    }
    case "scroll": {
      return "mapScrollEvent(event)";
    }
    case "toggle": {
      return `mapToggleEvent("${eventKey}", event)`;
    }
    case "transition": {
      return `mapTransitionEvent("${eventKey}", event)`;
    }
    case "wheel": {
      return `mapWheelEvent("${eventKey}", event)`;
    }
    case "mouse": {
      return `mapMouseEvent("${eventKey}", event)`;
    }
    default: {
      throw new Error("Unhandled React event mapper");
    }
  }
}

function generateReactEventAdapterFile(
  elementData: Record<ImplementedElement, ElementData>,
): string {
  const lines: string[] = [
    "// Auto-generated. Run: bun packages/sdk/scripts/generate-native-components",
    'import { defineEventAdapter } from "@tailorkit/adapter-core";',
    'import type { native } from "@tailorkit/sdk/native-zod";',
    "import type {",
    "  AnimationEvent,",
    "  ClipboardEvent,",
    "  FocusEvent,",
    "  FormEvent,",
    "  KeyboardEvent,",
    "  MouseEvent,",
    "  PointerEvent,",
    "  SyntheticEvent,",
    "  TransitionEvent,",
    "  UIEvent,",
    "  WheelEvent,",
    '} from "react";',
    "",
    "import {",
    "  mapAnimationEvent,",
    "  mapBaseEvent,",
    "  mapFocusEvent,",
    "  mapInputEvent,",
    "  mapKeyboardEvent,",
    "  mapMouseEvent,",
    "  mapPointerEvent,",
    "  mapScrollEvent,",
    "  mapToggleEvent,",
    "  mapTransitionEvent,",
    "  mapWheelEvent,",
    '} from "./payload";',
    "",
    "type ReactNativeEventRegistry = {",
    '  [TElement in keyof typeof native]: NonNullable<(typeof native)[TElement]["nativeEvents"]>;',
    "};",
    "",
    "export const reactEventAdapter = defineEventAdapter<ReactNativeEventRegistry>()({",
  ];

  for (const [element, data] of Object.entries(elementData) as [
    ImplementedElement,
    ElementData,
  ][]) {
    const elementType = getReactElementType(element);
    lines.push(`  ${element}: {`);
    for (const event of data.events) {
      const mapper = getReactEventMapper(event.eventKey);
      const eventType = getReactEventType(mapper, elementType);
      lines.push(`    ${event.eventKey}: {`);
      lines.push(
        `      mapEvent: (event: ${eventType}) => ${renderReactMapEventCall(
          mapper,
          event.eventKey,
        )},`,
      );
      lines.push(`      prop: "${event.handlerName}",`);
      lines.push("    },");
    }
    lines.push("  },");
  }

  lines.push("} as const);");
  lines.push("");
  return lines.join("\n");
}

async function main() {
  const srcDir = resolve(import.meta.dirname, "../../src");
  mkdirSync(srcDir, { recursive: true });

  console.log("Building element data...");
  const elementData = Object.fromEntries(
    (Object.keys(ELEMENT_SCHEMAS) as ImplementedElement[]).map((el) => {
      const data = buildElementData(el);
      console.log(`  ${el}: ${data.props.length} props, ${data.events.length} events`);
      return [el, data];
    }),
  ) as Record<ImplementedElement, ElementData>;

  const presetOutputs = [
    { renderer: zodRenderer, file: "native-zod.ts" },
    { renderer: valibotRenderer, file: "native-valibot.ts" },
    { renderer: arktypeRenderer, file: "native-arktype.ts" },
  ];

  const generatedFiles: string[] = [];
  for (const { renderer, file } of presetOutputs) {
    const filePath = resolve(srcDir, file);
    const content = generatePresetFile(elementData, renderer);
    await writeFile(filePath, content);
    generatedFiles.push(filePath);
    console.log(`Written: src/${file}`);
  }

  const reactEventsDir = resolve(import.meta.dirname, "../../../react/src/events");
  mkdirSync(reactEventsDir, { recursive: true });
  const reactEventAdapterFile = resolve(reactEventsDir, "native-events.generated.ts");
  await writeFile(reactEventAdapterFile, generateReactEventAdapterFile(elementData));
  generatedFiles.push(reactEventAdapterFile);
  console.log("Written: packages/react/src/events/native-events.generated.ts");

  await formatGeneratedFiles(generatedFiles);
  console.log("Formatted generated files.");

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
