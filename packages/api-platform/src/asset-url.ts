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
  const assetBaseUrl = nodeBaseUrl
    ? `${nodeBaseUrl.replace(/\/$/u, "")}/t/${publicTeamId}`
    : `https://${publicTeamId}.${env.ASSET_DOMAIN}`;
  let clientPath: string | undefined;
  if (deployment?.status === "published" && deployment.clientEntryFileId) {
    clientPath = `${assetBaseUrl}/p/${projectId}/a/${deployment.appId}/d/${deployment.id}/client.js`;
  }
  return { ...app, clientPath };
}
