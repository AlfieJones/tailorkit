import { createHash, randomUUID } from "node:crypto";
import type { KV } from "@tailorkit/kv";

export const previewChunkBytes = 256 * 1024;
export const previewMessageBytes = 512 * 1024;
export const previewFileBytes = 1024 * 1024;
export const previewBuildBytes = 10 * 1024 * 1024;
export const previewBuildFiles = 100;
const uploadTtlSeconds = 15 * 60;
const committedTtlSeconds = 10 * 60;
const activeTtlSeconds = 8 * 60 * 60;

export interface PreviewFileManifest {
  path: string;
  contentType: string;
  size: number;
  chunks: number;
  sha256: string;
}

export interface PreviewBuildManifest {
  files: PreviewFileManifest[];
}

export interface CommittedPreviewBuild {
  buildId: string;
  manifest: PreviewBuildManifest;
  revision: number;
}

const sha256 = (bytes: Buffer): string => createHash("sha256").update(bytes).digest("hex");
const buildKey = (sessionId: string, buildId: string) => `preview:build:${sessionId}:${buildId}`;
const chunkKey = (sessionId: string, buildId: string, fileIndex: number, chunkIndex: number) =>
  `${buildKey(sessionId, buildId)}:${fileIndex}:${chunkIndex}`;
const pointerKey = (sessionId: string) => `preview:current:${sessionId}`;
const channel = (sessionId: string) => `preview:revision:${sessionId}`;
const requireId = (value: string): void => {
  if (!/^[a-zA-Z0-9_-]{1,128}$/u.test(value)) {
    throw new Error("Invalid preview identifier.");
  }
};
const parse = <T>(value: string | null): T | null => (value ? (JSON.parse(value) as T) : null);
const hasControlCharacters = (value: string): boolean => {
  for (const character of value) {
    const code = character.codePointAt(0);
    if (code !== undefined && code < 32) {
      return true;
    }
  }
  return false;
};

// oxlint-disable-next-line complexity -- path, file, and aggregate limits are checked together.
export function validatePreviewManifest(manifest: PreviewBuildManifest): void {
  if (!Array.isArray(manifest.files) || manifest.files.length > previewBuildFiles) {
    throw new Error("Preview build exceeds the file limit.");
  }
  const paths = new Set<string>();
  let total = 0;
  for (const file of manifest.files) {
    if (
      !file.path ||
      Buffer.byteLength(file.path) > 1024 ||
      file.path.startsWith("/") ||
      file.path.includes("\\") ||
      file.path.split("/").some((part) => !part || part === "." || part === "..") ||
      hasControlCharacters(file.path) ||
      paths.has(file.path)
    ) {
      throw new Error("Invalid or duplicate preview file path.");
    }
    paths.add(file.path);
    if (!file.contentType || file.contentType.length > 255 || /[\r\n]/u.test(file.contentType)) {
      throw new Error("Invalid preview content type.");
    }
    if (
      !Number.isSafeInteger(file.size) ||
      file.size < 0 ||
      file.size > previewFileBytes ||
      file.chunks !== Math.ceil(file.size / previewChunkBytes) ||
      !/^[a-f0-9]{64}$/u.test(file.sha256)
    ) {
      throw new Error("Invalid preview file metadata.");
    }
    total += file.size;
  }
  if (!paths.has("client.js")) {
    throw new Error("Preview build is missing client.js.");
  }
  if (total > previewBuildBytes) {
    throw new Error("Preview build exceeds the size limit.");
  }
  if (Buffer.byteLength(JSON.stringify({ manifest })) > previewMessageBytes) {
    throw new Error("Preview manifest exceeds the message limit.");
  }
}

export function createPreviewBuildStore(kv: KV) {
  async function readBuild(sessionId: string, buildId: string) {
    return parse<{ manifest: PreviewBuildManifest; state: "uploading" | "committed" }>(
      await kv.get(buildKey(sessionId, buildId)),
    );
  }
  return {
    async begin(sessionId: string, manifest: PreviewBuildManifest): Promise<string> {
      requireId(sessionId);
      validatePreviewManifest(manifest);
      const buildId = randomUUID();
      await kv.set(buildKey(sessionId, buildId), JSON.stringify({ manifest, state: "uploading" }), {
        ttl: uploadTtlSeconds,
      });
      return buildId;
    },
    async upload(
      sessionId: string,
      buildId: string,
      fileIndex: number,
      chunkIndex: number,
      base64: string,
    ): Promise<void> {
      requireId(sessionId);
      requireId(buildId);
      const build = await readBuild(sessionId, buildId);
      if (build?.state !== "uploading") {
        throw new Error("Preview upload is unavailable.");
      }
      const file = build.manifest.files[fileIndex];
      if (
        !file ||
        !Number.isInteger(fileIndex) ||
        !Number.isInteger(chunkIndex) ||
        chunkIndex < 0 ||
        chunkIndex >= file.chunks
      ) {
        throw new Error("Invalid preview chunk index.");
      }
      if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(base64)) {
        throw new Error("Invalid preview chunk encoding.");
      }
      const bytes = Buffer.from(base64, "base64");
      const expected = Math.min(previewChunkBytes, file.size - chunkIndex * previewChunkBytes);
      if (
        bytes.length !== expected ||
        Buffer.byteLength(JSON.stringify({ sessionId, buildId, fileIndex, chunkIndex, base64 })) >
          previewMessageBytes
      ) {
        throw new Error("Invalid preview chunk size.");
      }
      const key = chunkKey(sessionId, buildId, fileIndex, chunkIndex);
      const existing = await kv.get(key);
      if (existing !== null && existing !== base64) {
        throw new Error("Conflicting preview chunk.");
      }
      await kv.set(key, base64, { ttl: uploadTtlSeconds });
    },
    async commit(sessionId: string, buildId: string): Promise<CommittedPreviewBuild> {
      requireId(sessionId);
      requireId(buildId);
      const build = await readBuild(sessionId, buildId);
      if (build?.state !== "uploading") {
        throw new Error("Preview upload is unavailable.");
      }
      validatePreviewManifest(build.manifest);
      for (const [fileIndex, file] of build.manifest.files.entries()) {
        const parts: Buffer[] = [];
        for (let chunkIndex = 0; chunkIndex < file.chunks; chunkIndex += 1) {
          const value = await kv.get(chunkKey(sessionId, buildId, fileIndex, chunkIndex));
          if (value === null) {
            throw new Error("Preview build is incomplete.");
          }
          const bytes = Buffer.from(value, "base64");
          if (
            bytes.length !== Math.min(previewChunkBytes, file.size - chunkIndex * previewChunkBytes)
          ) {
            throw new Error("Corrupt preview chunk.");
          }
          parts.push(bytes);
        }
        const bytes = Buffer.concat(parts);
        if (bytes.length !== file.size || sha256(bytes) !== file.sha256) {
          throw new Error("Preview checksum mismatch.");
        }
      }
      const revision = await kv.increment(
        `preview:revision-counter:${sessionId}`,
        activeTtlSeconds,
      );
      const committed = { buildId, manifest: build.manifest, revision };
      const previous = await this.current(sessionId);
      for (const [fileIndex, file] of build.manifest.files.entries()) {
        for (let chunkIndex = 0; chunkIndex < file.chunks; chunkIndex += 1) {
          const key = chunkKey(sessionId, buildId, fileIndex, chunkIndex);
          const value = await kv.get(key);
          if (value === null) {
            throw new Error("Preview build expired before commit.");
          }
          await kv.set(key, value, { ttl: activeTtlSeconds });
        }
      }
      await kv.set(buildKey(sessionId, buildId), JSON.stringify({ ...build, state: "committed" }), {
        ttl: activeTtlSeconds,
      });
      await kv.set(pointerKey(sessionId), JSON.stringify(committed), { ttl: activeTtlSeconds });
      if (previous && previous.buildId !== buildId) {
        try {
          const previousBuild = await readBuild(sessionId, previous.buildId);
          if (previousBuild) {
            await kv.set(buildKey(sessionId, previous.buildId), JSON.stringify(previousBuild), {
              ttl: committedTtlSeconds,
            });
            for (const [fileIndex, file] of previous.manifest.files.entries()) {
              for (let chunkIndex = 0; chunkIndex < file.chunks; chunkIndex += 1) {
                const key = chunkKey(sessionId, previous.buildId, fileIndex, chunkIndex);
                const value = await kv.get(key);
                if (value !== null) {
                  await kv.set(key, value, { ttl: committedTtlSeconds });
                }
              }
            }
          }
        } catch {
          // Expiry of superseded data is best effort; the original TTL is still bounded.
        }
      }
      await kv.publish(channel(sessionId), JSON.stringify({ revision, buildId }));
      return committed;
    },
    async current(sessionId: string): Promise<CommittedPreviewBuild | null> {
      requireId(sessionId);
      return parse<CommittedPreviewBuild>(await kv.get(pointerKey(sessionId)));
    },
    async chunk(
      sessionId: string,
      buildId: string,
      fileIndex: number,
      chunkIndex: number,
    ): Promise<string | null> {
      requireId(sessionId);
      requireId(buildId);
      const build = await readBuild(sessionId, buildId);
      if (build?.state !== "committed") {
        return null;
      }
      if (
        !build.manifest.files[fileIndex] ||
        chunkIndex < 0 ||
        chunkIndex >= build.manifest.files[fileIndex].chunks
      ) {
        return null;
      }
      return kv.get(chunkKey(sessionId, buildId, fileIndex, chunkIndex));
    },
    subscribe(sessionId: string, onRevision: (revision: number | null) => void) {
      requireId(sessionId);
      return kv.subscribe(channel(sessionId), (message) => {
        try {
          const value = JSON.parse(message) as { revision?: unknown };
          if ((value as { ended?: unknown }).ended === true) {
            onRevision(null);
            return;
          }
          if (typeof value.revision === "number" && Number.isSafeInteger(value.revision)) {
            onRevision(value.revision);
          }
        } catch {
          /* Ignore malformed notifications. */
        }
      });
    },
    async end(sessionId: string): Promise<void> {
      requireId(sessionId);
      const active = await this.current(sessionId);
      await kv.delete(pointerKey(sessionId));
      await kv.publish(channel(sessionId), JSON.stringify({ ended: true }));
      if (active) {
        await kv.delete(buildKey(sessionId, active.buildId));
        for (const [fileIndex, file] of active.manifest.files.entries()) {
          for (let chunkIndex = 0; chunkIndex < file.chunks; chunkIndex += 1) {
            await kv.delete(chunkKey(sessionId, active.buildId, fileIndex, chunkIndex));
          }
        }
      }
    },
  };
}
