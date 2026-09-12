import { createTailorKit } from "tailorkit";
import { primitives } from "tailorkit/zod";

export const tailorKit = createTailorKit({
  components: {
    ...primitives(),
    Button: { children: true, callbacks: { onClick: {} } },
  },
  views: { "/": {} },
  slots: { panel: { views: ["/"] } },
});
