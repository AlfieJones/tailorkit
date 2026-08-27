const runtime = globalThis.__tailorkitSandboxRuntime;
const { h, render } = runtime.preact;
const { useState } = runtime.hooks;
const { version: preactVersion } = runtime.packageJson;

function remoteComponent(name, callbacks = {}) {
  return function RemoteComponent({ children, ...props }) {
    const nextProps = { ...props };
    const callbackMap = {};
    for (const [key, inputCount] of Object.entries(callbacks)) {
      if (typeof nextProps[key] !== "function") {
        continue;
      }
      const eventName = `tailorkitcallback${key.toLowerCase()}`;
      callbackMap[eventName] = { callback: key, inputCount };
      nextProps[`on${eventName}`] = (event) =>
        nextProps[key](...(event.detail ?? []).slice(0, inputCount));
      nextProps[key] = undefined;
    }
    if (Object.keys(callbackMap).length > 0) {
      nextProps["data-tailorkit-callbacks"] = JSON.stringify(callbackMap);
    }
    return h(`tailorkit-${name.toLowerCase()}`, nextProps, children);
  };
}

const Button = remoteComponent("Button", { onClick: 0 });

function StripeRevenue() {
  const [connected, setConnected] = useState(false);
  return h(
    "tailorkit-flex",
    { direction: "column", gap: "md", padding: "md", width: "full" },
    h("tailorkit-box", { textColor: "default" }, "Payments, at a glance"),
    h(
      "tailorkit-flex",
      { direction: "column", gap: "xs", padding: "md", radius: "md", background: "muted" },
      h("tailorkit-box", { textColor: "muted" }, "MONTHLY RECURRING REVENUE"),
      h("tailorkit-box", { textColor: "default" }, "$18,480"),
      h("tailorkit-box", { textColor: "muted" }, "↑ 14% from last month"),
    ),
    h(
      "tailorkit-flex",
      { direction: "column", gap: "sm" },
      h("tailorkit-box", { textColor: "muted" }, "Maya Chen · Ribbon Labs"),
      h("tailorkit-box", { textColor: "default" }, "Active subscription · $2,400 / month"),
      h("tailorkit-box", { textColor: "muted" }, "Invoice paid 2 days ago"),
    ),
    h(
      Button,
      { onClick: () => setConnected((value) => !value) },
      connected ? "Stripe connected ✓" : "Connect Stripe",
    ),
  );
}

export default {
  $meta: { preactVersion },
  $runtime: { h, render },
  screens: { "/": { component: StripeRevenue, path: "/" } },
};
