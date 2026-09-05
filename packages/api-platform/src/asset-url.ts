import { env } from "@tailorkit/env/server";
import type { AppDeployment } from "@tailorkit/db/schema/apps";

export function withAppAssetUrl<T extends { currentDeployment: AppDeployment | null }>(
  app: T,
  publicTeamId: string,
  projectId: string,
) {
  const deployment = app.currentDeployment;
  const clientPath =
    deployment?.status === "published" && deployment.clientEntryFileId
      ? `https://${publicTeamId}.${env.ASSET_DOMAIN}/p/${projectId}/a/${deployment.appId}/d/${deployment.id}/client.js`
      : undefined;
  return { ...app, clientPath };
}
