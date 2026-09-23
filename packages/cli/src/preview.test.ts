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
  it("links to the host page with the selected session", () => {
    expect(createPreviewUrl("http://localhost:5010/api/tailorkit", "session-1")).toBe(
      "http://localhost:5010/?tailorkitPreview=session-1",
    );
    expect(
      createPreviewUrl(
        "http://localhost:5010/api/tailorkit",
        "session-2",
        "https://example.com/customers?tab=apps",
      ),
    ).toBe("https://example.com/customers?tab=apps&tailorkitPreview=session-2");
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
