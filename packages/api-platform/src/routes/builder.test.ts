import { call } from "@orpc/server";
import { createHash as nodeCreateHash } from "node:crypto";
import { app, appDeployment } from "@tailorkit/db/schema/apps";
import { organization } from "@tailorkit/db/schema/auth";
import { appOrigin, builderConversation, builderRun } from "@tailorkit/db/schema/builder";
import { project } from "@tailorkit/db/schema/project";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Context } from "../context";
import { createTestDb } from "../test/pglite";
import type { Storage } from "@tailorkit/storage";

const mocks = vi.hoisted(() => ({
  build: vi.fn(),
  upload: vi.fn(),
  db: undefined as unknown,
}));
let uploadedAssets = new Map<string, Uint8Array>();

vi.mock("@tailorkit/db", () => ({
  createDb: () => mocks.db,
  get db() {
    return mocks.db;
  },
}));
vi.mock("@tailorkit/storage", () => ({
  uploadToUrl: (...args: unknown[]) => mocks.upload(...args),
}));
vi.mock("../builder/build-app", () => ({
  buildAppCandidate: (...args: unknown[]) => mocks.build(...args),
  sha256: (value: Uint8Array) => nodeCreateHash("sha256").update(value).digest("hex"),
}));

const { builderRouter } = await import("./builder");

const organizationId = "11111111-1111-4111-8111-111111111111";
const projectId = "22222222-2222-4222-8222-222222222222";
const hostOrigin = "https://host.example";

describe("scope-bound builder flows", () => {
  let client: Awaited<ReturnType<typeof createTestDb>>["client"];
  let db: Awaited<ReturnType<typeof createTestDb>>["db"];
  let context: Context;
  let appId: string;

  beforeEach(async () => {
    const testDb = await createTestDb();
    client = testDb.client;
    db = testDb.db;
    mocks.db = db;
    uploadedAssets = new Map();
    mocks.build.mockReset().mockResolvedValue({
      assistantMessage: "Built your app preview.",
      clientBundle: new Uint8Array([1, 2, 3]),
      sourceFiles: { "src/client.ts": "export {};" },
    });
    mocks.upload
      .mockReset()
      .mockImplementation(({ uploadUrl, body }: { uploadUrl: string; body: Uint8Array }) => {
        const key = decodeURIComponent(new URL(uploadUrl).pathname.slice(1));
        uploadedAssets.set(key, new Uint8Array(body));
        return Promise.resolve();
      });
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(Response.json({ "src/client.ts": "export {};" }))),
    );

    await db.insert(organization).values({
      createdAt: new Date(),
      id: organizationId,
      name: "Team",
      publicId: "team0000000001",
      slug: "team",
    });
    await db.insert(project).values({
      id: projectId,
      name: "Project",
      organizationId,
      slug: "project",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const [createdApp] = await db
      .insert(app)
      .values({
        name: "Support assistant",
        projectId,
        publicId: "app000000001",
        scopeId: "tenant-1",
      })
      .returning();
    if (!createdApp) {
      throw new Error("Fixture app was not created.");
    }
    appId = createdApp.id;
    await db
      .insert(appOrigin)
      .values({ projectId, appId, scopeId: "tenant-1", origin: hostOrigin });

    context = {
      organization: {
        createdAt: new Date(),
        id: organizationId,
        name: "Team",
        publicId: "team0000000001",
        slug: "team",
        logo: null,
        metadata: null,
      },
      project: {
        createdAt: new Date(),
        id: projectId,
        name: "Project",
        organizationId,
        slug: "project",
        updatedAt: new Date(),
      },
      storage: {
        type: "s3",
        createDownloadUrl: vi.fn(({ key }: { key: string }) =>
          Promise.resolve({
            key,
            url: "https://storage.example/source.json",
          }),
        ),
        createUploadUrl: vi.fn(({ key }: { key: string }) =>
          Promise.resolve({
            key,
            uploadUrl: `https://storage.example/${encodeURIComponent(key)}`,
          }),
        ),
        delete: vi.fn(),
        head: vi.fn(({ key }: { key: string }) => {
          const body = uploadedAssets.get(key);
          return Promise.resolve({
            key,
            contentLength: body?.byteLength,
            contentType: key.endsWith("client.js") ? "application/javascript" : "application/json",
            checksumSha256: body
              ? nodeCreateHash("sha256").update(body).digest("base64")
              : undefined,
          });
        }),
      } as Storage,
    };
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await client.close();
    vi.clearAllMocks();
  });

  it("creates an unpublished preview, then changes the live deployment only on publish", async () => {
    const result = await call(
      builderRouter.run,
      {
        body: { appId, origin: hostOrigin, prompt: "Add a ticket search", scopeId: "tenant-1" },
      },
      { context },
    );
    const [beforePublish] = await db.select().from(app);
    expect(beforePublish?.currentDeploymentId).toBeNull();
    expect(result.body.candidate.previewUrl).toContain("/d/");
    expect(result.body.candidate.sourceRevision).toHaveLength(64);

    await call(
      builderRouter.publish,
      {
        params: { runId: result.body.runId },
        body: { origin: hostOrigin, scopeId: "tenant-1" },
      },
      { context },
    );
    const [afterPublish] = await db.select().from(app);
    const [run] = await db.select().from(builderRun);
    expect(afterPublish?.currentDeploymentId).toBe(result.body.candidate.deploymentId);
    expect(run?.status).toBe("published");
    expect(await db.select().from(appDeployment)).toHaveLength(1);
  });

  it("restores the previous source when a user edits an app again", async () => {
    const first = await call(
      builderRouter.run,
      {
        body: { appId, origin: hostOrigin, prompt: "Create a ticket search", scopeId: "tenant-1" },
      },
      { context },
    );
    await call(
      builderRouter.publish,
      {
        params: { runId: first.body.runId },
        body: { origin: hostOrigin, scopeId: "tenant-1" },
      },
      { context },
    );
    const [liveBeforeEdit] = await db.select().from(app);

    mocks.build.mockResolvedValueOnce({
      assistantMessage: "Added a priority filter.",
      clientBundle: new Uint8Array([4, 5, 6]),
      sourceFiles: { "src/client.ts": "export const version = 2;" },
    });
    const second = await call(
      builderRouter.run,
      {
        body: {
          appId,
          conversationId: first.body.conversationId,
          origin: hostOrigin,
          prompt: "Add a priority filter",
          scopeId: "tenant-1",
        },
      },
      { context },
    );
    expect(mocks.build.mock.calls.at(-1)?.[0]).toMatchObject({
      previousSource: { "src/client.ts": "export {};" },
      prompt: "Add a priority filter",
    });
    const [stillLive] = await db.select().from(app);
    expect(stillLive?.currentDeploymentId).toBe(liveBeforeEdit?.currentDeploymentId);
    expect(second.body.messages).toHaveLength(4);

    await call(
      builderRouter.publish,
      {
        params: { runId: second.body.runId },
        body: { origin: hostOrigin, scopeId: "tenant-1" },
      },
      { context },
    );
    const [afterSecondPublish] = await db.select().from(app);
    expect(afterSecondPublish?.currentDeploymentId).toBe(second.body.candidate.deploymentId);
  });

  it("rejects a different host scope and records build failures without changing the live app", async () => {
    const visibleApps = await call(
      builderRouter.apps,
      {
        query: { origin: hostOrigin, scopeId: "tenant-1" },
      },
      { context },
    );
    const invisibleApps = await call(
      builderRouter.apps,
      {
        query: { origin: hostOrigin, scopeId: "tenant-2" },
      },
      { context },
    );
    expect(visibleApps.body).toHaveLength(1);
    expect(invisibleApps.body).toHaveLength(0);

    const [existingDeployment] = await db
      .insert(appDeployment)
      .values({ appId, publicId: "deployed0001", status: "published" })
      .returning();
    if (!existingDeployment) {
      throw new Error("Fixture deployment was not created.");
    }
    await db
      .update(app)
      .set({ currentDeploymentId: existingDeployment.id })
      .where(eq(app.id, appId));

    await expect(
      call(
        builderRouter.run,
        {
          body: {
            appId,
            origin: "https://other.example",
            prompt: "Change it",
            scopeId: "tenant-1",
          },
        },
        { context },
      ),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    mocks.build.mockRejectedValueOnce(new Error("Type checking failed"));
    await expect(
      call(
        builderRouter.run,
        {
          body: { appId, origin: hostOrigin, prompt: "Change it", scopeId: "tenant-1" },
        },
        { context },
      ),
    ).rejects.toThrow("Type checking failed");

    const [liveApp] = await db.select().from(app);
    const [run] = await db.select().from(builderRun);
    const [conversation] = await db.select().from(builderConversation);
    expect(liveApp?.currentDeploymentId).toBe(existingDeployment.id);
    expect(run?.status).toBe("failed");
    expect(conversation?.messages.at(-1)?.content).toBe("Type checking failed");
  });
});
