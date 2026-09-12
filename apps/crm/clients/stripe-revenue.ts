import { h } from "preact";
import { useState } from "preact/hooks";
import { createView, defineClient } from "tailorkit/app";
import { Box, Button, Flex } from "./components";

const view = createView("/", { component: Content });
function Content() {
  const [done, setDone] = useState(false);
  return h(
    Flex,
    { direction: "column", gap: "md", padding: "md" },
    h(Box, { textColor: "default" }, "Payments, at a glance"),
    h(Box, { textColor: "muted" }, "MONTHLY RECURRING REVENUE · $18,480 · ↑ 14% from last month"),
    h(
      Button,
      { onClick: () => setDone((value) => !value) },
      done ? "Stripe connected ✓" : "Connect Stripe",
    ),
  );
}
export default defineClient({ slots: { panel: { "/": view } } });
