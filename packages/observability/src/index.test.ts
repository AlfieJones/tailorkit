import { afterEach, describe, expect, it, vi } from "vitest";
import {
  initializeObservability,
  safeAttributes,
  safeAttributeValue,
  shutdownObservability,
} from "./index";

const registerOTel = vi.fn();

vi.mock("@vercel/otel", () => ({
  registerOTel,
}));

describe("observability helpers", () => {
  afterEach(async () => {
    vi.unstubAllEnvs();
    registerOTel.mockReset();
    await shutdownObservability();
  });

  it("drops sensitive attributes", () => {
    expect(
      safeAttributes({
        "auth.token": "secret",
        "http.method": "GET",
        "request.headers": "cookie=value",
        "storage.key": "projects/id/file.js",
      }),
    ).toEqual({
      "http.method": "GET",
    });
  });

  it("normalizes safe primitive values", () => {
    expect(safeAttributeValue(new Date("2026-01-01T00:00:00.000Z"))).toBe(
      "2026-01-01T00:00:00.000Z",
    );
    expect(safeAttributeValue(42)).toBe(42);
  });

  it("can be disabled in tests without registering an SDK", async () => {
    vi.stubEnv("TAILORKIT_OTEL_DISABLED", "true");
    await expect(initializeObservability("test-service")).resolves.toBeUndefined();
  });

  it("deduplicates concurrent initialization", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "abc123");
    vi.stubEnv("TAILORKIT_OTEL_SAMPLE_RATE", "0.25");

    await Promise.all([
      initializeObservability("test-service"),
      initializeObservability("test-service"),
      initializeObservability("test-service"),
    ]);

    expect(registerOTel).toHaveBeenCalledTimes(1);
    expect(registerOTel).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          "deployment.environment.name": "preview",
          "service.name": "test-service",
          "service.version": "abc123",
        }),
        serviceName: "test-service",
      }),
    );
  });

  it("resets initialization state after registration failure", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL", "1");
    registerOTel.mockImplementationOnce(() => {
      throw new Error("registration failed");
    });

    await expect(initializeObservability("test-service")).rejects.toThrow("registration failed");
    await expect(initializeObservability("test-service")).resolves.toBeUndefined();

    expect(registerOTel).toHaveBeenCalledTimes(2);
  });
});
