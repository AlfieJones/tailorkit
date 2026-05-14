import { describe, expect, it } from "vitest";
import { z } from "zod";
import { action, defineSchema } from "../schema";
import { implementActions } from "./actions";
import { createTailorKitServer } from "./handler";

const schema = defineSchema({
  actions: {
    todo: {
      create: action
        .input(z.object({ title: z.string().min(1) }))
        .output(z.object({ id: z.string(), orgId: z.string(), title: z.string() })),
    },
  },
  components: {},
  requestContext: z.object({
    orgId: z.string(),
    role: z.enum(["member", "admin"]),
    userId: z.string(),
  }),
});

const act = implementActions(schema);

const actions = act.router({
  todo: act.todo.router({
    create: act.todo.create.handler(({ input, requestContext }) => ({
      id: `${requestContext.userId}:1`,
      orgId: requestContext.orgId,
      title: input.title,
    })),
  }),
});

describe("createTailorKitServer", () => {
  it("dispatches nested actions with validated request context and input", async () => {
    const server = createTailorKitServer({ actions, schema });
    const response = await server.handler(
      new Request("https://example.com/actions/todo.create", {
        body: JSON.stringify({ title: "Ship it" }),
        headers: { "content-type": "application/json" },
        method: "POST",
      }),
      {
        projectId: "project_1",
        requestContext: { orgId: "org_1", role: "admin", userId: "user_1" },
        resourceId: "org:org_1",
      },
    );

    await expect(response.json()).resolves.toEqual({
      id: "user_1:1",
      orgId: "org_1",
      title: "Ship it",
    });
  });

  it("requires a platform client for version upload intents", async () => {
    const server = createTailorKitServer({ schema });
    const response = await server.handler(
      new Request("https://example.com/apps/new-version", {
        body: JSON.stringify({ appId: "app_1" }),
        headers: { "content-type": "application/json" },
        method: "POST",
      }),
      {
        projectId: "project_1",
        requestContext: { orgId: "org_1", role: "admin", userId: "user_1" },
        resourceId: "org:org_1",
      },
    );

    expect(response.status).toBe(501);
  });
});
