import type { ORPCError } from "@orpc/server";
import { call } from "@orpc/server";
import { user, organization, member, invitation } from "@tailorkit/db/schema/index";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../test/pglite";
import type { Context } from "../context";

const testState = vi.hoisted(() => ({
  db: undefined as unknown,
  env: {
    VERCEL_ENV: undefined as "production" | "preview" | "development" | undefined,
  },
  github: {
    getAuthenticated: vi.fn(),
  },
  kv: {
    get: vi.fn(),
    set: vi.fn(),
    instance: true as boolean,
  },
}));

vi.mock("@tailorkit/db", () => ({
  createDb: () => testState.db,
  get db() {
    return testState.db;
  },
  isOrgSlugReserved: () => false,
}));

vi.mock("@tailorkit/auth", () => ({
  auth: {
    api: {
      acceptInvitation: vi.fn(),
      createOrganization: vi.fn(),
      getAccessToken: vi.fn(),
      hasPermission: vi.fn(),
      listUserAccounts: vi.fn(),
      rejectInvitation: vi.fn(),
    },
  },
}));

vi.mock("octokit", () => ({
  Octokit: vi.fn(
    class OctokitMock {
      rest = {
        users: {
          getAuthenticated: testState.github.getAuthenticated,
        },
      };
    },
  ),
}));

vi.mock("@tailorkit/kv", () => ({
  getKV: () =>
    testState.kv.instance
      ? {
          get: testState.kv.get,
          set: testState.kv.set,
        }
      : null,
}));

vi.mock("@tailorkit/env/server", () => ({
  env: testState.env,
}));

const { userRouter } = await import("./user");
const { orgRouter } = await import("./org");
const { auth } = await import("@tailorkit/auth");

const userId = "11111111-1111-4111-8111-111111111111";
const otherUserId = "22222222-2222-4222-8222-222222222222";
const orgId = "33333333-3333-4333-8333-333333333333";
const otherOrgId = "44444444-4444-4444-8444-444444444444";

function createContext(overrides: Partial<Context> = {}): Context {
  return {
    headers: new Headers(),
    ip: "127.0.0.1",
    session: {
      activeOrganizationId: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      expiresAt: new Date("2026-02-01T00:00:00.000Z"),
      id: "session-id",
      ipAddress: null,
      token: "session-token",
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      userAgent: null,
      userId,
    },
    user: {
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      email: "ada@example.com",
      emailVerified: true,
      id: userId,
      image: null,
      name: "Ada Lovelace",
      theme: "system",
      twoFactorEnabled: false,
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    },
    ...overrides,
  };
}

describe("userRouter", () => {
  let client: Awaited<ReturnType<typeof createTestDb>>["client"];
  let db: Awaited<ReturnType<typeof createTestDb>>["db"];

  beforeEach(async () => {
    const testDb = await createTestDb();
    client = testDb.client;
    db = testDb.db;
    testState.db = db;
    testState.env.VERCEL_ENV = undefined;
    vi.mocked(auth.api.createOrganization).mockReset();
    vi.mocked(auth.api.getAccessToken).mockReset();
    vi.mocked(auth.api.listUserAccounts).mockReset();
    testState.github.getAuthenticated.mockReset();
    testState.kv.get.mockReset();
    testState.kv.set.mockReset();
    testState.kv.instance = true;

    await db.insert(user).values([
      {
        id: userId,
        name: "Ada Lovelace",
        email: "ada@example.com",
        emailVerified: true,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      {
        id: otherUserId,
        name: "Grace Hopper",
        email: "grace@example.com",
        emailVerified: true,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]);

    await db.insert(organization).values([
      {
        id: orgId,
        name: "Analytical Engines",
        slug: "analytical-engines",
        publicId: "team0000000001",
        createdAt: new Date("2026-01-02T00:00:00.000Z"),
      },
      {
        id: otherOrgId,
        name: "Compilers Inc",
        slug: "compilers-inc",
        publicId: "team0000000002",
        createdAt: new Date("2026-01-02T00:00:00.000Z"),
      },
    ]);

    await db.insert(member).values({
      id: "55555555-5555-4555-8555-555555555555",
      organizationId: orgId,
      userId,
      role: "owner",
      createdAt: new Date("2026-01-03T00:00:00.000Z"),
    });
  });

  afterEach(async () => {
    await client.close();
    vi.clearAllMocks();
  });

  it("requires invitation management permission to enumerate pending invitations", async () => {
    await db.insert(invitation).values({
      organizationId: orgId,
      email: "charles@example.com",
      role: "member",
      status: "pending",
      expiresAt: new Date("2099-02-01T00:00:00.000Z"),
      inviterId: userId,
    });
    vi.mocked(auth.api.hasPermission).mockResolvedValueOnce({ error: null, success: false });

    await expect(
      call(
        orgRouter.getOrgInvitations,
        { orgSlug: "analytical-engines" },
        { context: createContext() },
      ),
    ).rejects.toEqual(expect.objectContaining({ code: "FORBIDDEN" }));

    expect(auth.api.hasPermission).toHaveBeenCalledWith({
      body: {
        organizationId: orgId,
        permissions: { invitation: ["read"] },
      },
      headers: expect.any(Headers),
    });
  });

  it("returns the current session and user", async () => {
    const context = createContext();

    await expect(call(userRouter.getSession, undefined, { context })).resolves.toEqual({
      session: context.session,
      user: context.user,
    });
  });

  it("uses Better Auth's decrypted GitHub token and caches the username lookup", async () => {
    const githubAccountId = "66666666-6666-4666-8666-666666666666";
    const cache = new Map<string, string>();
    testState.kv.get.mockImplementation((key: string) => Promise.resolve(cache.get(key) ?? null));
    testState.kv.set.mockImplementation((key: string, value: string) => {
      cache.set(key, value);
      return Promise.resolve();
    });
    vi.mocked(auth.api.listUserAccounts).mockResolvedValue([
      {
        accountId: "12345",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        id: githubAccountId,
        providerId: "github",
        scopes: [],
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        userId,
      },
    ]);
    vi.mocked(auth.api.getAccessToken).mockResolvedValue({
      accessToken: "decrypted-github-token",
      accessTokenExpiresAt: undefined,
      idToken: undefined,
      scopes: [],
    });
    testState.github.getAuthenticated.mockResolvedValue({ data: { login: "octocat" } });

    const context = createContext();
    const firstResult = await call(userRouter.listAccounts, undefined, { context });
    const secondResult = await call(userRouter.listAccounts, undefined, { context });

    expect(firstResult[0]).toEqual(expect.objectContaining({ githubUsername: "octocat" }));
    expect(secondResult[0]).toEqual(expect.objectContaining({ githubUsername: "octocat" }));
    expect(auth.api.getAccessToken).toHaveBeenCalledTimes(1);
    expect(testState.github.getAuthenticated).toHaveBeenCalledTimes(1);
    expect(auth.api.getAccessToken).toHaveBeenCalledWith({
      body: { accountId: githubAccountId },
      headers: context.headers,
    });
  });

  it("does not cache a transient GitHub lookup failure", async () => {
    const githubAccountId = "77777777-7777-4777-8777-777777777777";
    const cache = new Map<string, string>();
    testState.kv.get.mockImplementation((key: string) => Promise.resolve(cache.get(key) ?? null));
    testState.kv.set.mockImplementation((key: string, value: string) => {
      cache.set(key, value);
      return Promise.resolve();
    });
    vi.mocked(auth.api.listUserAccounts).mockResolvedValue([
      {
        accountId: "54321",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        id: githubAccountId,
        providerId: "github",
        scopes: [],
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        userId,
      },
    ]);
    vi.mocked(auth.api.getAccessToken).mockResolvedValue({
      accessToken: "decrypted-github-token",
      accessTokenExpiresAt: undefined,
      idToken: undefined,
      scopes: [],
    });
    testState.github.getAuthenticated
      .mockRejectedValueOnce(new Error("GitHub unavailable"))
      .mockResolvedValueOnce({ data: { login: "octocat" } });

    const context = createContext();
    const firstResult = await call(userRouter.listAccounts, undefined, { context });
    const secondResult = await call(userRouter.listAccounts, undefined, { context });

    expect(firstResult[0]).toEqual(expect.objectContaining({ githubUsername: null }));
    expect(secondResult[0]).toEqual(expect.objectContaining({ githubUsername: "octocat" }));
    expect(auth.api.getAccessToken).toHaveBeenCalledTimes(2);
    expect(testState.github.getAuthenticated).toHaveBeenCalledTimes(2);
    expect(testState.kv.set).toHaveBeenCalledTimes(1);
  });

  it("does not cache a GitHub account without an access token", async () => {
    const githubAccountId = "88888888-8888-4888-8888-888888888888";
    vi.mocked(auth.api.listUserAccounts).mockResolvedValue([
      {
        accountId: "98765",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        id: githubAccountId,
        providerId: "github",
        scopes: [],
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        userId,
      },
    ]);
    vi.mocked(auth.api.getAccessToken).mockRejectedValue(new Error("Token unavailable"));

    const result = await call(userRouter.listAccounts, undefined, { context: createContext() });

    expect(result[0]).toEqual(expect.objectContaining({ githubUsername: null }));
    expect(testState.github.getAuthenticated).not.toHaveBeenCalled();
    expect(testState.kv.set).not.toHaveBeenCalled();
  });

  it("looks up the GitHub username without a cache when the KV instance is unavailable", async () => {
    testState.kv.instance = false;
    const githubAccountId = "99999999-9999-4999-8999-999999999999";
    vi.mocked(auth.api.listUserAccounts).mockResolvedValue([
      {
        accountId: "13579",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        id: githubAccountId,
        providerId: "github",
        scopes: [],
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        userId,
      },
    ]);
    vi.mocked(auth.api.getAccessToken).mockResolvedValue({
      accessToken: "decrypted-github-token",
      accessTokenExpiresAt: undefined,
      idToken: undefined,
      scopes: [],
    });
    testState.github.getAuthenticated.mockResolvedValue({ data: { login: "octocat" } });

    const result = await call(userRouter.listAccounts, undefined, { context: createContext() });

    expect(result[0]).toEqual(expect.objectContaining({ githubUsername: "octocat" }));
    expect(testState.kv.get).not.toHaveBeenCalled();
    expect(testState.kv.set).not.toHaveBeenCalled();
    expect(testState.github.getAuthenticated).toHaveBeenCalledTimes(1);
  });

  it("only attaches the GitHub username to the GitHub account in a multi-account result", async () => {
    const githubAccountId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const emailAccountId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
    testState.kv.get.mockResolvedValue(null);
    testState.kv.set.mockResolvedValue();
    vi.mocked(auth.api.listUserAccounts).mockResolvedValue([
      {
        accountId: "24680",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        id: githubAccountId,
        providerId: "github",
        scopes: [],
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        userId,
      },
      {
        accountId: "ada@example.com",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        id: emailAccountId,
        providerId: "credential",
        scopes: [],
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        userId,
      },
    ]);
    vi.mocked(auth.api.getAccessToken).mockResolvedValue({
      accessToken: "decrypted-github-token",
      accessTokenExpiresAt: undefined,
      idToken: undefined,
      scopes: [],
    });
    testState.github.getAuthenticated.mockResolvedValue({ data: { login: "octocat" } });

    const result = await call(userRouter.listAccounts, undefined, { context: createContext() });

    expect(result).toHaveLength(2);
    expect(result.find((account) => account.id === githubAccountId)).toEqual(
      expect.objectContaining({ githubUsername: "octocat" }),
    );
    expect(result.find((account) => account.id === emailAccountId)).toEqual(
      expect.objectContaining({ githubUsername: null }),
    );
  });

  it("requires auth for protected procedures", async () => {
    await expect(
      call(userRouter.getOrgs, undefined, {
        context: createContext({ session: null, user: null }),
      }),
    ).rejects.toEqual(expect.objectContaining({ code: "UNAUTHORIZED" }));
  });

  it("returns organizations the current user belongs to", async () => {
    const orgs = await call(userRouter.getOrgs, undefined, { context: createContext() });

    expect(orgs).toHaveLength(1);
    expect(orgs[0]).toEqual(expect.objectContaining({ id: orgId, slug: "analytical-engines" }));
  });

  it("resolves an organization by slug or id for the current user", async () => {
    await expect(
      call(userRouter.getOrg, { orgSlug: "analytical-engines" }, { context: createContext() }),
    ).resolves.toEqual(expect.objectContaining({ id: orgId }));

    await expect(call(userRouter.getOrg, { orgId }, { context: createContext() })).resolves.toEqual(
      expect.objectContaining({ slug: "analytical-engines" }),
    );
  });

  it("does not resolve organizations outside the current user's membership", async () => {
    await expect(
      call(userRouter.getOrg, { orgSlug: "compilers-inc" }, { context: createContext() }),
    ).rejects.toEqual(
      expect.objectContaining({ code: "NOT_FOUND" } satisfies Partial<
        ORPCError<"NOT_FOUND", unknown>
      >),
    );
  });

  it("does not allow users to create organizations in production", async () => {
    testState.env.VERCEL_ENV = "production";

    await expect(
      call(
        userRouter.createOrg,
        { name: "New Org", slug: "new-org" },
        { context: createContext() },
      ),
    ).rejects.toEqual(
      expect.objectContaining({ code: "FORBIDDEN" } satisfies Partial<
        ORPCError<"FORBIDDEN", unknown>
      >),
    );
  });

  it("allows users to create organizations outside production", async () => {
    testState.env.VERCEL_ENV = "development";
    vi.mocked(auth.api.createOrganization).mockResolvedValue({
      createdAt: new Date("2026-01-04T00:00:00.000Z"),
      id: "77777777-7777-4777-8777-777777777777",
      publicId: "team0000000003",
      members: [],
      metadata: null,
      name: "New Org",
      slug: "new-org",
    });

    await expect(
      call(
        userRouter.createOrg,
        { name: "New Org", slug: "new-org" },
        { context: createContext() },
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        id: "77777777-7777-4777-8777-777777777777",
        slug: "new-org",
      }),
    );

    expect(auth.api.createOrganization).toHaveBeenCalledWith({
      body: { name: "New Org", slug: "new-org", userId },
    });
  });

  it("returns pending unexpired invitations for the current user's email", async () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await db.insert(invitation).values([
      {
        id: "66666666-6666-4666-8666-666666666666",
        organizationId: orgId,
        email: "ada@example.com",
        status: "pending",
        expiresAt: futureDate,
        createdAt: new Date("2026-01-04T00:00:00.000Z"),
        inviterId: otherUserId,
      },
      {
        id: "77777777-7777-4777-8777-777777777777",
        organizationId: orgId,
        email: "ada@example.com",
        status: "accepted",
        expiresAt: futureDate,
        createdAt: new Date("2026-01-04T00:00:00.000Z"),
        inviterId: otherUserId,
      },
      {
        id: "88888888-8888-4888-8888-888888888888",
        organizationId: orgId,
        email: "ada@example.com",
        status: "pending",
        expiresAt: pastDate,
        createdAt: new Date("2026-01-04T00:00:00.000Z"),
        inviterId: otherUserId,
      },
    ]);

    const invitations = await call(userRouter.getPendingInvitations, undefined, {
      context: createContext(),
    });

    expect(invitations).toHaveLength(1);
    expect(invitations[0]).toEqual(
      expect.objectContaining({
        email: "ada@example.com",
        organization: expect.objectContaining({ id: orgId }),
        status: "pending",
      }),
    );
  });
});
