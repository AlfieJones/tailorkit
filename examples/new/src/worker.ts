import { h } from "preact";
import { useEffect, useState } from "preact/hooks";

const buttonTagName = "tailorkit-button";

export default function App() {
  const [count, setCount] = useState(0);
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
    "section",
    { "aria-label": "Worker timer demo" },
    h(
      buttonTagName,
      {
        onClick: () => {
          setCount((c) => c + 1);
        },
        variant: "primary",
      },
      `Clicked ${count} time${count === 1 ? "" : "s"}`,
    ),
    h("p", null, `Timer: ${seconds} second${seconds === 1 ? "" : "s"}`),
  );
}
