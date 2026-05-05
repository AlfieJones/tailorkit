import { createRemoteComponent, exposePreactWorker } from "@tailorkit/sandbox/worker";
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";

const Button = createRemoteComponent<{ onClick?: () => void }>("Button", {
  slots: ["default"],
});

const Text = createRemoteComponent("Text", {
  slots: ["default"],
});

const RemoteApp = () => {
  const [clicks, setClicks] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return h(
    Text,
    null,
    h(Text, null, `Timer: ${seconds}s`),
    h(
      Button,
      {
        onClick: () => {
          setClicks((value) => value + 1);
        },
      },
      `Clicked ${clicks} ${clicks === 1 ? "time" : "times"}`,
    ),
  );
};

exposePreactWorker(self as unknown as MessagePort, () => h(RemoteApp, null));
