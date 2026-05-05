import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { Button } from "#tailorkit";
import type { ScreenProps } from "#tailorkit";

type HomeScreenProps = ScreenProps<"home">;

const HomeScreen = ({ context }: HomeScreenProps) => {
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
    { "aria-label": "Todo worker preview" },
    h(
      "h1",
      null,
      context.user.name === undefined ? "Todo app" : `${context.user.name}'s todo app`,
    ),
    h(
      Button,
      {
        onClick: () => {
          setCount((value) => value + 1);
        },
        variant: "primary",
      },
      `Todo clicked ${count} time${count === 1 ? "" : "s"}`,
    ),
    h("p", null, `Built worker timer: ${seconds} second${seconds === 1 ? "" : "s"}`),
  );
};

export default HomeScreen;
