import { createView, defineClient } from "./index";

const root = createView("/", { component: () => null });
const users = createView("/users", { component: () => null });
defineClient({
  slots: {
    navbar: { "/": root },
    panel: { "/": root, "/users": users },
  },
});
defineClient({ slots: { panel: { "/users": false } } });
// @ts-expect-error Slots are declared by the host.
defineClient({ slots: { unknown: { "/": root } } });
// @ts-expect-error A view must be registered under its own view path.
defineClient({ slots: { panel: { "/": users } } });
// @ts-expect-error View paths must be declared by the host.
createView("/unknown", { component: () => null });

// @ts-expect-error Opt-outs must also reference a declared view.
defineClient({ slots: { panel: { "/unknown": false } } });

// @ts-expect-error Globally declared views are not automatically supported by every slot.
defineClient({ slots: { navbar: { "/users": users } } });
// @ts-expect-error Opt-outs must reference a view supported by this slot too.
defineClient({ slots: { navbar: { "/users": false } } });
