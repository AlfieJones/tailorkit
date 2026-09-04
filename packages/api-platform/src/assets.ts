import { createHash, timingSafeEqual } from "node:crypto";
import { db } from "@tailorkit/db";
import { organization } from "@tailorkit/db/schema/auth";
import { project } from "@tailorkit/db/schema/project";
import { app, appDeployment, appDeploymentFile } from "@tailorkit/db/schema/apps";
import { and, eq } from "drizzle-orm";
import { env } from "@tailorkit/env/server";
import { getStorage } from "@tailorkit/storage/storage";

const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const assetPath = new RegExp(`^/p/(${uuid})/d/(${uuid})/client\\.js$`, "u");
const teamLabel = /^[a-z0-9]{10}$/u;

function denied(status = 404) {
  return new Response(null, { status, headers: { "Cache-Control": "no-store" } });
}

function blocked(list: string | undefined, id: string) {
  return list?.split(",").some((item) => item.trim().toLowerCase() === id) ?? false;
}

function authorizedGateway(request: Request) {
  const secret = env.ASSET_GATEWAY_SECRET;
  return (
    Boolean(secret) &&
    request.method === "GET" &&
    timingSafeEqual(
      createHash("sha256")
        .update(request.headers.get("authorization") ?? "")
        .digest(),
      createHash("sha256").update(`Bearer ${secret}`).digest(),
    )
  );
}

/** Service-authenticated resolver; it never serves or redirects to customer bytes. */
export async function resolveAsset(request: Request): Promise<Response> {
  if (!authorizedGateway(request)) {
    return denied();
  }

  const query = new URL(request.url).searchParams;
  const hostname = query.get("hostname") ?? "";
  const suffix = `.${env.ASSET_DOMAIN}`;
  if (!hostname.endsWith(suffix)) {
    return denied();
  }
  const publicTeamId = hostname.slice(0, -suffix.length);
  const match = assetPath.exec(query.get("path") ?? "");
  const projectId = match?.[1];
  const deploymentId = match?.[2];
  if (
    !teamLabel.test(publicTeamId) ||
    !projectId ||
    !deploymentId ||
    blocked(env.ASSET_BLOCKED_TEAM_IDS, publicTeamId) ||
    blocked(env.ASSET_BLOCKED_DEPLOYMENT_IDS, deploymentId)
  ) {
    return denied();
  }

  // Public ID is globally unique. All remaining joins use primary/unique indexes;
  // select exactly one entry file instead of scanning all deployment files.
  const [file] = await db
    .select({
      objectKey: appDeploymentFile.objectKey,
      checksum: appDeploymentFile.checksum,
      contentLength: appDeploymentFile.contentLength,
      appId: app.id,
    })
    .from(organization)
    .innerJoin(project, eq(project.organizationId, organization.id))
    .innerJoin(app, eq(app.projectId, project.id))
    .innerJoin(appDeployment, eq(appDeployment.appId, app.id))
    .innerJoin(
      appDeploymentFile,
      and(
        eq(appDeploymentFile.id, appDeployment.clientEntryFileId),
        eq(appDeploymentFile.appDeploymentId, appDeployment.id),
      ),
    )
    .where(
      and(
        eq(organization.publicId, publicTeamId),
        eq(project.id, projectId),
        eq(appDeployment.id, deploymentId),
        eq(appDeployment.status, "published"),
        eq(appDeploymentFile.status, "verified"),
        eq(appDeploymentFile.contentType, "application/javascript"),
      ),
    )
    .limit(1);
  if (
    !file ||
    !file.checksum ||
    file.contentLength < 1 ||
    file.contentLength > 1024 * 1024 ||
    !file.objectKey.startsWith(
      `projects/${projectId}/apps/${file.appId}/deployments/${deploymentId}/files/`,
    )
  ) {
    return denied();
  }
  const storage = getStorage();
  if (!storage) {
    return denied(503);
  }
  const { url } = await storage.createDownloadUrl({ key: file.objectKey, expiresInSeconds: 60 });
  return Response.json(
    { url, checksum: file.checksum, contentLength: file.contentLength },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
