import { createRemoteComponent, exposePreactWorker } from "@tailorkit/app/worker";
import type { WorkerUiMountOptions } from "@tailorkit/app/worker";
import { h } from "preact";
import { useMemo, useState } from "preact/hooks";

import {
  defaultContextSchema,
  screenContextSchemas,
  screenLabels,
  screenPathSchema,
} from "./schema";
import type { ScreenPath } from "./schema";

interface RemoteButtonProps {
  disabled?: boolean;
  loading?: boolean;
  name?: string;
  onClick?: () => void;
  size?: "sm" | "default" | "lg" | "icon";
  type?: "button" | "reset" | "submit";
  value?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
}

interface RemoteInputProps {
  label?: string;
  name?: string;
  onInput?: (event: { value?: string }) => void;
  placeholder?: string;
  value?: string;
}

const Button = createRemoteComponent<RemoteButtonProps>("Button", {
  slots: ["default"],
});
const Input = createRemoteComponent<RemoteInputProps>("Input");

const screenPaths = screenPathSchema.options;

const resolveScreen = (options: WorkerUiMountOptions): ScreenPath => {
  const result = screenPathSchema.safeParse(options.currentScreen);
  return result.success ? result.data : "/";
};

const formatScreenContext = (screen: ScreenPath, value: unknown): string => {
  const result = screenContextSchemas[screen].safeParse(value);
  if (!result.success) {
    return "Screen context did not match the shared schema.";
  }
  return JSON.stringify(result.data, null, 2);
};

const WorkerApp = (options: WorkerUiMountOptions) => {
  const [clicks, setClicks] = useState(0);
  const [draft, setDraft] = useState("");
  const currentScreen = resolveScreen(options);
  const defaultContext = defaultContextSchema.safeParse(options.defaultContext);
  const organizationName = defaultContext.success
    ? defaultContext.data.organizationName
    : "Unknown workspace";

  const contextPreview = useMemo(
    () => formatScreenContext(currentScreen, options.screenContext),
    [currentScreen, options.screenContext],
  );

  return h(
    "section",
    { class: "remote-shell" },
    h("p", { class: "eyebrow" }, "Worker app"),
    h("h2", null, screenLabels[currentScreen]),
    h("p", null, `Rendering ${screenLabels[currentScreen].toLowerCase()} for ${organizationName}.`),
    h(
      "nav",
      { "aria-label": "Screens", class: "remote-screen-list" },
      screenPaths.map((screen) =>
        h(
          "span",
          {
            class:
              screen === currentScreen ? "remote-screen remote-screen-active" : "remote-screen",
            key: screen,
          },
          screenLabels[screen],
        ),
      ),
    ),
    h(
      Button,
      {
        name: "worker-action",
        onClick: () => {
          setClicks((value) => value + 1);
        },
        type: "button",
        value: String(clicks),
        variant: clicks > 0 ? "secondary" : "default",
      },
      clicks === 0 ? "Run worker action" : `Worker action ran ${clicks} times`,
    ),
    h(Input, {
      label: "Worker text",
      name: "worker-text",
      onInput: (event: { value?: string }) => {
        setDraft(event.value ?? "");
      },
      placeholder: "Type through the host Input",
      value: draft,
    }),
    h("pre", { class: "remote-context" }, contextPreview),
  );
};

exposePreactWorker(self as unknown as MessagePort, (options) => h(WorkerApp, options));
