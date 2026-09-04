import { createHmac, timingSafeEqual } from "node:crypto";

const lifetime = 24 * 60 * 60 * 1000;
export interface AssetGrant {
  projectId: string;
  appId: string;
  deploymentId: string;
  expires: number;
}

function signature(payload: string, secret: string) {
  if (secret.length < 32) {
    throw new Error("Asset signing is not configured");
  }
  return createHmac("sha256", secret).update(`tailorkit-asset-v1:${payload}`).digest("base64url");
}

export function signAssetGrant(
  grant: Omit<AssetGrant, "expires">,
  secret: string,
  now = Date.now(),
) {
  const payload = Buffer.from(JSON.stringify({ ...grant, expires: now + lifetime })).toString(
    "base64url",
  );
  return `${payload}.${signature(payload, secret)}`;
}

export function verifyAssetGrant(
  token: string,
  secret: string,
  now = Date.now(),
): AssetGrant | null {
  try {
    if (token.length > 1024) {
      return null;
    }
    const [payload, supplied, extra] = token.split(".");
    if (!payload || !supplied || extra !== undefined) {
      return null;
    }
    const expected = Buffer.from(signature(payload, secret));
    const actual = Buffer.from(supplied);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      return null;
    }
    const grant = JSON.parse(Buffer.from(payload, "base64url").toString()) as AssetGrant;
    const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/iu;
    if (
      ![grant.projectId, grant.appId, grant.deploymentId].every(
        (id) => typeof id === "string" && uuid.test(id),
      ) ||
      !Number.isFinite(grant.expires) ||
      grant.expires <= now ||
      grant.expires > now + lifetime
    ) {
      return null;
    }
    return grant;
  } catch {
    return null;
  }
}
