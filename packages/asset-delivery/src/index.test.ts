import { describe, expect, it } from "vitest";
import {
  assetFailure,
  assetHeaders,
  assetPreflight,
  isAssetMethod,
  isValidAssetSize,
  parseHostedAssetRequest,
  parseNodeAssetRequest,
} from "./index";

const teamId = "abc123def45678";
const projectId = "22222222-2222-4222-8222-222222222222";
const appId = "33333333-3333-4333-8333-333333333333";
const deploymentId = "44444444-4444-4444-8444-444444444444";
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
    };
    expect(parseNodeAssetRequest(new Request(localUrl))).toEqual(expected);
    expect(parseHostedAssetRequest(new Request(hostedUrl), "tailorkit.app")).toEqual(expected);
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
  });
});
