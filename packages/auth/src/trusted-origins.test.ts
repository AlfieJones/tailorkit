import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth/minimal";
import { describe, expect, it } from "vitest";

describe("AUTH_TRUSTED_ORIGINS preview pattern", () => {
  it("trusts only previews with the TailorKit project prefix", async () => {
    const auth = betterAuth({
      baseURL: "https://tailorkit.dev",
      secret: "test-secret-with-at-least-32-characters",
      trustedOrigins: ["https://tailorkit-*.vercel.app"],
    });
    const context = await auth.$context;

    expect(context.isTrustedOrigin("https://tailorkit-feature-auth.vercel.app")).toBe(true);
    expect(context.isTrustedOrigin("https://another-project-feature-auth.vercel.app")).toBe(false);
  });

  it("derives the passkey RP ID from the approved preview host", async () => {
    const auth = betterAuth({
      baseURL: {
        allowedHosts: ["tailorkit-*.vercel.app"],
        protocol: "https",
      },
      plugins: [passkey({ rpName: "TailorKit" })],
      secret: "test-secret-with-at-least-32-characters",
    });
    const response = await auth.handler(
      new Request(
        "https://tailorkit-feature-auth.vercel.app/api/auth/passkey/generate-authenticate-options",
      ),
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as { rpId?: string };
    expect(body.rpId).toBe("tailorkit-feature-auth.vercel.app");
  });
});
