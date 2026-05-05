import { h } from "preact";
import { useState } from "preact/hooks";
import { createRemoteComponent, exposePreactWorker } from "@tailorkit/sandbox-ui/worker";

const Button = createRemoteComponent<{
  onClick?: () => void;
  variant?: "primary" | "secondary";
}>("Button", { slots: ["default"] });

function App() {
  const [count, setCount] = useState(0);

  return h(
    Button,
    {
      variant: "primary",
      onClick: () => {
        setCount((c) => c + 1);
      },
    },
    `Clicked ${count} time${count === 1 ? "" : "s"}`,
  );
}

// biome-ignore lint/suspicious/noExplicitAny: self is DedicatedWorkerGlobalScope which is message-port-compatible
exposePreactWorker(self as any, () => h(App, null));
