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
    h(Box, { textColor: "default" }, "Renewal signals"),
    h(Box, { textColor: "muted" }, "LUMA HEALTH · RENEWS IN 24 DAYS · Health score: 72 / 100"),
    h(Button, { onClick: () => setDone(true) }, done ? "Plan reviewed ✓" : "Mark plan reviewed"),
  );
}
export default defineClient({ slots: { panel: { "/": view } } });
