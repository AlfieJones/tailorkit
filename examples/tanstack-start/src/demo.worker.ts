import { createRemoteComponent, exposePreactWorker } from "@tailorkit/sandbox-ui/worker";
import { h } from "preact";
import { useMemo, useState } from "preact/hooks";

const RemoteButton = createRemoteComponent<Record<string, unknown>>("Button");

interface NativeClickPayload {
  button: number;
  ctrlKey: boolean;
  currentTargetId: string;
  metaKey: boolean;
  name: "click";
  shiftKey: boolean;
  targetId: string;
}

interface ValidationInput {
  value: string;
}

const WorkerApp = () => {
  const [clicks, setClicks] = useState(0);
  const [lastEvent, setLastEvent] = useState("No events yet");
  const [lastValidation, setLastValidation] = useState("Not checked yet");

  const isDisabled = clicks >= 5;

  const label = useMemo(
    () => (isDisabled ? "Disabled after 5 clicks" : `Clicked ${clicks} times`),
    [clicks, isDisabled],
  );

  return h(
    "section",
    { class: "remote-shell" },
    h("p", null, "This text is rendered by Preact inside a Web Worker."),
    h(
      RemoteButton,
      {
        callbacks: {
          onBlur: () => {
            setLastEvent("blur");
          },
          onClick: ({ button, shiftKey }: NativeClickPayload) => {
            setClicks((c) => c + 1);
            setLastEvent(`click — button: ${button}, shift: ${shiftKey}`);
          },
          onFocus: () => {
            setLastEvent("focus");
          },
          validate: ({ value }: ValidationInput) => {
            const valid = value.length >= 3;
            setLastValidation(valid ? "Validation passed" : "Validation failed (need 3+ chars)");
            return valid;
          },
        },
        // Native button props are type-checked against the schema preset.
        disabled: isDisabled,
        name: "demo-button",
        type: "button",
        value: label,
      },
      label,
    ),
    h("p", { class: "remote-status" }, `Last event: ${lastEvent}`),
    h("p", { class: "remote-status" }, `Validation: ${lastValidation}`),
  );
};

exposePreactWorker(self as unknown as MessagePort, () => h(WorkerApp, null));
