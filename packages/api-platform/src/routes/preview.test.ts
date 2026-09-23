/* oxlint-disable require-await, typescript/no-non-null-assertion -- the in-memory KV fake implements Promise methods. */
import { call } from "@orpc/server";
import { app as appTable } from "@tailorkit/db/schema/apps";
import { organization } from "@tailorkit/db/schema/auth";
import { cliToken } from "@tailorkit/db/schema/cli-auth";
import { previewSession } from "@tailorkit/db/schema/preview-session";
import { project as projectTable } from "@tailorkit/db/schema/project";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Context } from "../context";
import { createTestDb } from "../test/pglite";

const state = vi.hoisted(() => ({ db: undefined as unknown, kv: undefined as unknown }));
vi.mock("@tailorkit/db", () => ({
  get db() {
    return state.db;
  },
}));
vi.mock("@tailorkit/kv", async (original) => ({ ...(await original()), getKV: () => state.kv }));

const { previewRouter } = await import("./preview");
const { authorizePreviewSocket } = await import("../preview-ws-auth");
const { previewWebSocketRouter } = await import("../preview-ws");
const orgId = "11111111-1111-4111-8111-111111111111";
const projectId = "22222222-2222-4222-8222-222222222222";
const tokenId = "33333333-3333-4333-8333-333333333333";

function fakeKV() {
  const data = new Map<string, string>();
  return {
    get: async (key: string) => data.get(key) ?? null,
    getAndDelete: async (key: string) => {
      const value = data.get(key) ?? null;
      data.delete(key);
      return value;
    },
    set: async (key: string, value: string) => {
      data.set(key, value);
    },
    delete: async (key: string) => {
      data.delete(key);
    },
    publish: async () => 0,
    subscribe: async () => async () => {},
    increment: async () => 1,
  };
}

const context: Context = {
  organization: {
    id: orgId,
    publicId: "team0000000001",
    name: "Team",
    slug: "team",
    logo: null,
    metadata: null,
    createdAt: new Date(),
  },
  project: {
    id: projectId,
    organizationId: orgId,
    name: "Project",
    slug: "project",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  storage: {
    type: "s3",
    createUploadUrl: vi.fn(),
    createDownloadUrl: vi.fn(),
    delete: vi.fn(),
    head: vi.fn(),
  },
};

describe("platform preview lifecycle and grants", () => {
  let client: Awaited<ReturnType<typeof createTestDb>>["client"];
  let db: Awaited<ReturnType<typeof createTestDb>>["db"];
  beforeEach(async () => {
    const testDb = await createTestDb();
    client = testDb.client;
    db = testDb.db;
    state.db = db;
    state.kv = fakeKV();
    await db.insert(organization).values({
      id: orgId,
      publicId: "team0000000001",
      name: "Team",
      slug: "team",
      createdAt: new Date(),
    });
    await db.insert(projectTable).values({
      id: projectId,
      organizationId: orgId,
      name: "Project",
      slug: "project",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const { hashSecret } = await import("@tailorkit/api-utils/hashing");
    await db.insert(cliToken).values({
      id: tokenId,
      projectId,
      scopeId: "author",
      tokenHash: hashSecret("deploy-token", process.env.AUTH_SECRET!),
      expiresAt: new Date(Date.now() + 60_000),
    });
    await db.insert(appTable).values([
      { projectId, publicId: "authapp00001", name: "Author app", scopeId: "author" },
      { projectId, publicId: "otherapp0001", name: "Other app", scopeId: "other" },
    ]);
  });
  afterEach(async () => {
    await client.close();
    vi.clearAllMocks();
  });

  const start = () =>
    call(
      previewRouter.start,
      { body: { appId: "authapp00001", deployToken: "deploy-token" } },
      { context },
    );

  it("enforces author scope, active uniqueness, expiry retirement, and CLI revocation", async () => {
    await expect(
      call(
        previewRouter.start,
        { body: { appId: "otherapp0001", deployToken: "deploy-token" } },
        { context },
      ),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    const first = await start();
    expect(first.body.shareId).toHaveLength(43);
    expect(first.body.tunnelUrl).toContain("/api/platform/preview/ws");
    await expect(start()).rejects.toMatchObject({ code: "CONFLICT" });
    await db
      .update(previewSession)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(previewSession.id, first.body.sessionId));
    const second = await start();
    expect(second.body.sessionId).not.toBe(first.body.sessionId);
    await db.update(cliToken).set({ revokedAt: new Date() }).where(eq(cliToken.id, tokenId));
    await expect(start()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(
      await authorizePreviewSocket(second.body.sessionId, second.body.tunnelToken, "uploader"),
    ).toBeNull();
  });

  it("binds grants to the viewer scope and invalidates them on stop", async () => {
    const started = await start();
    const accepted = await call(
      previewRouter.accept,
      { params: { shareId: started.body.shareId }, body: { scopeId: "viewer" } },
      { context },
    );
    const wrongScope = await call(
      previewRouter.accepted,
      { body: { grantIds: [accepted.body.grantId], scopeId: "other" } },
      { context },
    );
    expect(wrongScope.body.items).toEqual([]);
    const viewer = await call(
      previewRouter.accepted,
      { body: { grantIds: [accepted.body.grantId], scopeId: "viewer" } },
      { context },
    );
    expect(viewer.body.items).toHaveLength(1);
    expect(viewer.body.items[0]?.preview.token).toBeTruthy();
    await call(
      previewRouter.stop,
      { params: { sessionId: started.body.sessionId }, body: { deployToken: "deploy-token" } },
      { context },
    );
    const ended = await call(
      previewRouter.accepted,
      { body: { grantIds: [accepted.body.grantId], scopeId: "viewer" } },
      { context },
    );
    expect(ended.body.items).toEqual([]);
  });

  it("ends an idle viewer stream when its bearer token expires", async () => {
    const started = await start();
    const stream = await call(previewWebSocketRouter.subscribe, undefined, {
      context: {
        sessionId: started.body.sessionId,
        role: "viewer",
        viewerTokenExpiresAt: Date.now() + 30,
      },
    });
    const iterator = stream[Symbol.asyncIterator]();
    await expect(iterator.next()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("allows five active apps per scope, retires expired sessions, and frees a slot on stop", async () => {
    const appIds = Array.from(
      { length: 7 },
      (_, index) => `scopeapp${String(index).padStart(4, "0")}`,
    );
    await db
      .insert(appTable)
      .values(
        appIds.map((publicId) => ({ projectId, publicId, name: publicId, scopeId: "author" })),
      );
    const startApp = (appId: string) =>
      call(previewRouter.start, { body: { appId, deployToken: "deploy-token" } }, { context });
    const started = await Promise.all(appIds.slice(0, 5).map(startApp));
    await expect(startApp(appIds[5]!)).rejects.toMatchObject({
      code: "CONFLICT",
      message: "This scope already has 5 active previews.",
    });
    const { hashSecret } = await import("@tailorkit/api-utils/hashing");
    await db.insert(cliToken).values({
      id: "44444444-4444-4444-8444-444444444444",
      projectId,
      scopeId: "other",
      tokenHash: hashSecret("other-token", process.env.AUTH_SECRET!),
      expiresAt: new Date(Date.now() + 60_000),
    });
    const otherScope = await call(
      previewRouter.start,
      { body: { appId: "otherapp0001", deployToken: "other-token" } },
      { context },
    );
    expect(otherScope.body.sessionId).toBeTruthy();
    await db
      .update(previewSession)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(previewSession.id, started[0]!.body.sessionId));
    const replacement = await startApp(appIds[5]!);
    expect(replacement.body.sessionId).toBeTruthy();
    await expect(startApp(appIds[6]!)).rejects.toMatchObject({ code: "CONFLICT" });
    await call(
      previewRouter.stop,
      { params: { sessionId: started[1]!.body.sessionId }, body: { deployToken: "deploy-token" } },
      { context },
    );
    const afterStop = await startApp(appIds[6]!);
    expect(afterStop.body.sessionId).toBeTruthy();
  });

  it("serializes concurrent starts across different apps in the same scope", async () => {
    const appIds = Array.from(
      { length: 6 },
      (_, index) => `raceapp${String(index).padStart(5, "0")}`,
    );
    await db
      .insert(appTable)
      .values(
        appIds.map((publicId) => ({ projectId, publicId, name: publicId, scopeId: "author" })),
      );
    const results = await Promise.allSettled(
      appIds.map((appId) =>
        call(previewRouter.start, { body: { appId, deployToken: "deploy-token" } }, { context }),
      ),
    );
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(5);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
  });
});
