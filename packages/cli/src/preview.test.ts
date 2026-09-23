import { mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createPreviewUrl, getPreviewAssetResponse } from "./preview";

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true })));
});

describe("preview link", () => {
  it("links to the TailorKit preview route and keeps return URLs on the host", () => {
    expect(createPreviewUrl("http://localhost:5010/api/tailorkit", "session-1")).toBe(
      "http://localhost:5010/api/tailorkit/preview?session=session-1",
    );
    expect(
      createPreviewUrl("http://localhost:5010/api/tailorkit", "session-2", "/customers?tab=apps"),
    ).toBe(
      "http://localhost:5010/api/tailorkit/preview?session=session-2&returnTo=http%3A%2F%2Flocalhost%3A5010%2Fcustomers%3Ftab%3Dapps",
    );
  });
});

describe("preview asset", () => {
  it("uses the same content tag for GET and HEAD and changes it after an edit", async () => {
    const root = await realpath(await mkdtemp(path.join(tmpdir(), "tailorkit-preview-")));
    directories.push(root);
    const filepath = path.join(root, "client.js");
    await writeFile(filepath, "export const value = 1;");

    const get = await getPreviewAssetResponse({ method: "GET", path: "/client.js" }, root);
    const head = await getPreviewAssetResponse({ method: "HEAD", path: "/client.js" }, root);
    expect(get.status).toBe(200);
    expect(get.etag).toBe(head.etag);
    expect(head.body).toBe("");

    await writeFile(filepath, "export const value = 2;");
    const updated = await getPreviewAssetResponse({ method: "HEAD", path: "/client.js" }, root);
    expect(updated.etag).not.toBe(head.etag);
  });
});
