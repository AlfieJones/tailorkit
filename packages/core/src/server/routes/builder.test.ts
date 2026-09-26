import { call } from "@orpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const platformCalls = vi.hoisted(() => ({
  apps: vi.fn(),
  createApp: vi.fn(),
  publish: vi.fn(),
  run: vi.fn(),
}));

vi.mock("@tailorkit/client-platform/client", () => ({
  builderApps: (...args: unknown[]) => platformCalls.apps(...args),
  builderCreateApp: (...args: unknown[]) => platformCalls.createApp(...args),
  builderPublish: (...args: unknown[]) => platformCalls.publish(...args),
  builderRun: (...args: unknown[]) => platformCalls.run(...args),
}));

const { builderRouter } = await import("./builder");

describe("host builder routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    platformCalls.run.mockResolvedValue({
      conversationId: "conversation",
      messages: [],
      runId: "run",
    });
  });

  it("derives scope from host authentication and origin from the host request", async () => {
    const context = {
      actions: new Map(),
      authenticate: vi.fn(() => ({ scopeId: "trusted-scope" })),
      platform: {} as never,
      platformHeaders: {},
      request: new Request("https://crm.example/api/tailorkit/builder/send"),
      schema: {} as never,
    };

    await call(
      builderRouter.send,
      { appId: "app-public-id", prompt: "Add search", scopeId: "attacker-scope" } as never,
      { context },
    );

    expect(platformCalls.run).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          appId: "app-public-id",
          origin: "https://crm.example",
          prompt: "Add search",
          scopeId: "trusted-scope",
        }),
      }),
    );
    expect(context.authenticate).toHaveBeenCalledOnce();
  });
});
