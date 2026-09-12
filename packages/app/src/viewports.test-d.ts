import { createScreen, defineClient } from "./index";

const root = createScreen("/", { component: () => null });
const users = createScreen("/users", { component: () => null });
defineClient({
  viewports: {
    navbar: { screens: { "/": root } },
    panel: { screens: { "/": root, "/users": users } },
  },
});
defineClient({ viewports: { panel: { screens: { "/users": false } } } });
// @ts-expect-error Viewports are declared by the host.
defineClient({ viewports: { unknown: { screens: { "/": root } } } });
// @ts-expect-error A screen must be registered under its own scope path.
defineClient({ viewports: { panel: { screens: { "/": users } } } });
// @ts-expect-error Scope paths must be declared by the host.
createScreen("/unknown", { component: () => null });

// @ts-expect-error Opt-outs must also reference a declared scope.
defineClient({ viewports: { panel: { screens: { "/unknown": false } } } });

// @ts-expect-error Globally declared scopes are not automatically supported by every viewport.
defineClient({ viewports: { navbar: { screens: { "/users": users } } } });
// @ts-expect-error Opt-outs must reference a scope supported by this viewport too.
defineClient({ viewports: { navbar: { screens: { "/users": false } } } });
