import { describe, expect, it } from "vitest";
import {
  assetFailure,
  assetHeaders,
  assetPreflight,
  isAssetMethod,
  isValidAssetSize,
  parseHostedAssetRequest,
  parseNodeAssetRequest,
  validateLogoAsset,
} from "./index";

const teamId = "abc123def45678";
const projectId = "22222222-2222-4222-8222-222222222222";
const appId = "app000000001";
const deploymentId = "deploy000001";
const assetPath = `/p/${projectId}/a/${appId}/d/${deploymentId}/client.js`;
const localUrl = `http://localhost:3000/api/assets/t/${teamId}${assetPath}`;
const hostedUrl = `https://${teamId}.tailorkit.app${assetPath}`;

describe("asset delivery contract", () => {
  it("maps the same local and hosted URL contract to one storage key", () => {
    const expected = {
      appId,
      deploymentId,
      key: `teams/${teamId}/projects/${projectId}/apps/${appId}/deployments/${deploymentId}/files/client.js`,
      projectId,
      publicTeamId: teamId,
      contentType: "application/javascript",
    };
    expect(parseNodeAssetRequest(new Request(localUrl))).toEqual(expected);
    expect(parseHostedAssetRequest(new Request(hostedUrl), "tailorkit.app")).toEqual(expected);
  });

  it("maps logo variants to their storage keys and content types", () => {
    expect(
      parseNodeAssetRequest(new Request(localUrl.replace("client.js", "logo-dark.svg"))),
    ).toEqual(
      expect.objectContaining({
        contentType: "image/svg+xml",
        key: expect.stringMatching(/\/files\/logo-dark\.svg$/u),
      }),
    );
  });

  it("requires the hosted tenant hostname to match the request identity", () => {
    expect(
      parseHostedAssetRequest(
        new Request(hostedUrl.replace("tailorkit.app", "tailorkit.app.evil.example")),
        "tailorkit.app",
      ),
    ).toBeUndefined();
    expect(
      parseHostedAssetRequest(new Request(hostedUrl.replace("https:", "http:")), "tailorkit.app"),
    ).toBeUndefined();
  });

  it("rejects malformed and ambiguous requests", () => {
    for (const invalid of [
      localUrl.replace("/api/assets", "/other"),
      `${localUrl}?extra=value`,
      localUrl.replace(teamId, "short"),
      localUrl.replace(appId, "app-slug"),
    ]) {
      expect(parseNodeAssetRequest(new Request(invalid))).toBeUndefined();
    }
  });

  it("provides identical method, size, error, preflight and asset response rules", () => {
    expect(["GET", "HEAD", "OPTIONS"].every(isAssetMethod)).toBe(true);
    expect(isAssetMethod("POST")).toBe(false);
    expect(isValidAssetSize(1)).toBe(true);
    expect(isValidAssetSize(1024 * 1024)).toBe(true);
    expect(isValidAssetSize(0)).toBe(false);
    expect(isValidAssetSize(1024 * 1024 + 1)).toBe(false);
    expect(assetFailure(404).headers.get("Cache-Control")).toBe("no-store");
    expect(assetPreflight().status).toBe(204);
    const headers = assetHeaders({ contentLength: 10, etag: '"etag"' });
    expect(headers.get("Content-Length")).toBe("10");
    expect(headers.get("ETag")).toBe('"etag"');
    expect(headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(headers.get("Cache-Control")).toBe("public, max-age=86400");
    expect(assetHeaders({ contentLength: 10, contentType: "image/png" }).get("Content-Type")).toBe(
      "image/png",
    );
  });
});

describe("logo validation", () => {
  it("accepts safe SVG logos", () => {
    const content = new TextEncoder().encode(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M0 0h32v32H0z"/></svg>',
    );
    expect(validateLogoAsset(content, "image/svg+xml")).toEqual({});
  });

  it("rejects active SVG content", () => {
    const content = new TextEncoder().encode("<svg><script>alert(1)</script></svg>");
    expect(() => validateLogoAsset(content, "image/svg+xml")).toThrow(
      "cannot contain scripts or external resources",
    );
  });

  it("rejects external SVG stylesheets", () => {
    const content = new TextEncoder().encode(
      '<?xml-stylesheet href="https://example.com/logo.css"?><svg></svg>',
    );
    expect(() => validateLogoAsset(content, "image/svg+xml")).toThrow(
      "cannot contain scripts or external resources",
    );
  });

  it("enforces raster dimensions", () => {
    const content = new Uint8Array(24);
    content.set([137, 80, 78, 71, 13, 10, 26, 10]);
    const view = new DataView(content.buffer);
    view.setUint32(16, 2049);
    view.setUint32(20, 512);
    expect(() => validateLogoAsset(content, "image/png")).toThrow("cannot exceed 2048 by 2048");
  });

  it("enforces the 256 KiB file limit", () => {
    expect(() => validateLogoAsset(new Uint8Array(256 * 1024 + 1), "image/png")).toThrow(
      "between 1 and 262144 bytes",
    );
  });
});
