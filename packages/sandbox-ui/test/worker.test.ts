import { h } from "preact";
import { describe, expect, it } from "vitest";

import { createWorkerPreactRuntime } from "../src/worker";

describe("createWorkerPreactRuntime", () => {
  it("passes mount context into the worker render function", () => {
    const runtime = createWorkerPreactRuntime((options) =>
      h("span", null, options.currentScreen ?? "missing"),
    );

    const result = runtime.mount({
      currentScreen: "/settings",
      defaultContext: { organizationName: "Acme" },
      screenContext: { billingPlan: "Team" },
    });

    expect(result).toMatchObject({
      revision: 1,
      type: "snapshot",
    });
    expect(JSON.stringify(result)).toContain("/settings");
  });
});
