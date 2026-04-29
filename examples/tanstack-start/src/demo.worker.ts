import { createRemoteComponent, exposePreactWorker } from "@tailorkit/sandbox-ui/worker";
import { h } from "preact";
import { useMemo, useState } from "preact/hooks";

const RemoteButton = createRemoteComponent("Button");

interface ValidationInput {
  value: string;
}

interface NativeEventInput {
  currentTargetId: string;
  name: string;
  targetId: string;
}

const WorkerApp = () => {
  const [clicks, setClicks] = useState(0);
  const [lastValidation, setLastValidation] = useState("Not checked yet");

  const label = useMemo(() => `Worker button clicked ${clicks} times`, [clicks]);

  return h(
    "section",
    {
      class: "remote-shell",
    },
    h("p", null, "This text is rendered by Preact inside a Web Worker."),
    h(
      RemoteButton,
      {
        callbacks: {
          validate: ({ value }: ValidationInput) => {
            const valid = value.length >= 10;
            setLastValidation(valid ? "Worker validation passed" : "Worker validation failed");
            return valid;
          },
        },
        label,
        onClick: (_event: NativeEventInput) => {
          setClicks((count) => count + 1);
        },
      },
      "Run worker callback",
    ),
    h("p", { class: "remote-status" }, lastValidation),
  );
};

exposePreactWorker(self as unknown as MessagePort, () => h(WorkerApp, null));
