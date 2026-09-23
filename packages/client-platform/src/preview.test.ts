import { describe, expect, it } from "vitest";
import { previewFileManifestSchema } from "./preview";

describe("preview file manifest", () => {
  const file = (path: string, contentType = "text/javascript") => ({
    path,
    contentType,
    size: 0,
    chunks: 0,
    sha256: "0".repeat(64),
  });

  it("enforces the path limit in UTF-8 bytes", () => {
    expect(previewFileManifestSchema.safeParse(file("é".repeat(512))).success).toBe(true);
    expect(previewFileManifestSchema.safeParse(file("é".repeat(513))).success).toBe(false);
  });

  it("rejects CR and LF in content types", () => {
    expect(previewFileManifestSchema.safeParse(file("client.js", "text/javascript")).success).toBe(
      true,
    );
    expect(
      previewFileManifestSchema.safeParse(file("client.js", "text/javascript\rbad")).success,
    ).toBe(false);
    expect(
      previewFileManifestSchema.safeParse(file("client.js", "text/javascript\nbad")).success,
    ).toBe(false);
  });
});
