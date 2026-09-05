import { env, getBaseUrl } from "@tailorkit/env/server";
import type { AppDeployment } from "@tailorkit/db/schema/apps";

export function withAppAssetUrl<T extends { currentDeployment: AppDeployment | null }>(
  app: T,
  publicTeamId: string,
  projectId: string,
) {
  const deployment = app.currentDeployment;
  const nodeBaseUrl =
    env.ASSET_BASE_URL ??
    (env.NODE_ENV === "development" ? `${getBaseUrl()}/api/assets` : undefined);
  let clientPath: string | undefined;
  if (deployment?.status === "published" && deployment.clientEntryFileId) {
    clientPath = nodeBaseUrl
      ? `${nodeBaseUrl.replace(/\/$/u, "")}?team=${encodeURIComponent(publicTeamId)}&project=${encodeURIComponent(projectId)}&app=${encodeURIComponent(deployment.appId)}&deployment=${encodeURIComponent(deployment.id)}`
      : `https://${publicTeamId}.${env.ASSET_DOMAIN}/p/${projectId}/a/${deployment.appId}/d/${deployment.id}/client.js`;
  }
  return { ...app, clientPath };
}
