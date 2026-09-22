import { timingSafeEqual } from "node:crypto";
import { hashSecret } from "@tailorkit/api-utils/hashing";
import { env } from "@tailorkit/env/server";

const viewerTokenLifetimeMs = 5 * 60 * 1000;

function getSigningSecret(): string {
  if (!env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET is required for preview tokens.");
  }
  return env.AUTH_SECRET;
}

function signature(sessionId: string, expiresAt: number): string {
  return hashSecret(`${sessionId}.${expiresAt}`, getSigningSecret());
}

/** A short-lived, bearer URL credential for an already scope-authorized preview asset request. */
export function createPreviewViewerToken(sessionId: string, now = Date.now()): string {
  const expiresAt = now + viewerTokenLifetimeMs;
  return `${expiresAt}.${signature(sessionId, expiresAt)}`;
}

export function verifyPreviewViewerToken(
  sessionId: string,
  token: string,
  now = Date.now(),
): boolean {
  const [expiresAtValue, receivedSignature, ...rest] = token.split(".");
  if (rest.length > 0 || !expiresAtValue || !receivedSignature) {
    return false;
  }

  const expiresAt = Number(expiresAtValue);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) {
    return false;
  }

  const expectedSignature = signature(sessionId, expiresAt);
  const received = Buffer.from(receivedSignature);
  const expected = Buffer.from(expectedSignature);
  return received.length === expected.length && timingSafeEqual(received, expected);
}
