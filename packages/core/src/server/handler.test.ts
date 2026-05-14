import { describe, expect, it } from "vitest";
import { z } from "zod";
import { action, defineSchema } from "../schema";
import { createTailorKitClient } from "./client";
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

const clientFor = (
  server: ReturnType<typeof createTailorKitServer>,
  context: Parameters<ReturnType<typeof createTailorKitServer>["handler"]>[1],
) =>
  createTailorKitClient({
    fetch: (request, init) =>
      Promise.resolve(
        server.handler(request instanceof Request ? request : new Request(request, init), context),
      ),
    url: "https://example.com/api/tailorkit",
  });

describe("createTailorKitServer", () => {
  it("dispatches actions with validated request context and input", async () => {
    const server = createTailorKitServer({ actions, schema });
    const client = clientFor(server, {
      requestContext: { orgId: "org_1", userId: "user_1" },
      resourceId: "org:org_1",
    });

    await expect(
      client.actions.call({ input: { title: "Ship it" }, path: "todo.create" }),
    ).resolves.toEqual({
      id: "user_1:1",
      orgId: "org_1",
      title: "Ship it",
    });
  });

  it("calls the platform client with authorization headers", async () => {
    const requests: Request[] = [];
    const server = createTailorKitServer({
      $internal: {
        platformBaseUrl: "http://localhost:3000/api/platform",
        platformFetch: (request) => {
          requests.push(request instanceof Request ? request : new Request(request));
          return Promise.resolve(
            Response.json({
              items: [],
              pagination: { hasMore: false, page: 1, pageSize: 20 },
            }),
          );
        },
      },
      schema,
    });
    const client = createTailorKitClient({
      fetch: (request, init) =>
        Promise.resolve(
          server.handler(
            request instanceof Request
              ? new Request(request, { headers: { authorization: "Bearer host-token" } })
              : new Request(request, {
                  ...init,
                  headers: { ...init?.headers, authorization: "Bearer host-token" },
                }),
            {
              requestContext: { orgId: "org_1", userId: "user_1" },
              resourceId: "org:org_1",
            },
          ),
        ),
      url: "https://example.com/api/tailorkit",
    });

    await expect(client.apps.list({ page: 1 })).resolves.toEqual({
      items: [],
      pagination: { hasMore: false, page: 1, pageSize: 20 },
    });
    expect(requests[0]?.url).toBe("http://localhost:3000/api/platform/apps?page=1");
    expect(requests[0]?.headers.get("authorization")).toBe("Bearer host-token");
  });

  it("attaches the handler resource id when creating platform apps", async () => {
    const requests: Request[] = [];
    const server = createTailorKitServer({
      $internal: {
        platformBaseUrl: "http://localhost:3000/api/platform",
        platformFetch: (request) => {
          requests.push(request instanceof Request ? request : new Request(request));
          return Promise.resolve(Response.json({ id: "app_1" }));
        },
      },
      schema,
    });
    const client = createTailorKitClient({
      fetch: (request, init) =>
        Promise.resolve(
          server.handler(request instanceof Request ? request : new Request(request, init), {
            requestContext: { orgId: "org_1", userId: "user_1" },
            resourceId: "org:org_1",
          }),
        ),
      url: "https://example.com/api/tailorkit",
    });

    await expect(client.apps.create({ description: null, name: "Calendar" })).resolves.toEqual({
      id: "app_1",
    });
    await expect(requests[0]?.json()).resolves.toEqual({
      description: null,
      name: "Calendar",
      resourceId: "org:org_1",
    });
  });
});
