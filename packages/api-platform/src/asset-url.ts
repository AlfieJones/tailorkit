import { env, getBaseUrl } from "@tailorkit/env/server";
import type { AppDeployment } from "@tailorkit/db/schema/apps";

export function withAppAssetUrl<
  T extends {
    currentDeployment:
      | (Pick<AppDeployment, "clientEntryFileId" | "publicId" | "status"> &
          Partial<Pick<AppDeployment, "logoDarkPath" | "logoLightPath">>)
      | null;
    publicId: string;
  },
>(app: T, publicTeamId: string, projectId: string) {
  const deployment = app.currentDeployment;
  const nodeBaseUrl =
    env.ASSET_BASE_URL ??
    (env.NODE_ENV === "development" ? `${getBaseUrl()}/api/assets` : undefined);
  const assetBaseUrl = nodeBaseUrl
    ? `${nodeBaseUrl.replace(/\/$/u, "")}/t/${publicTeamId}`
    : `https://${publicTeamId}.${env.ASSET_DOMAIN}`;
  let clientPath: string | undefined;
  let logoPaths: { dark?: string; light?: string } | undefined;
  if (deployment?.status === "published" && deployment.clientEntryFileId) {
    clientPath = `${assetBaseUrl}/p/${projectId}/a/${app.publicId}/d/${deployment.publicId}/client.js`;
    const deploymentBase = `${assetBaseUrl}/p/${projectId}/a/${app.publicId}/d/${deployment.publicId}`;
    const logos = {
      ...(deployment.logoDarkPath ? { dark: `${deploymentBase}/${deployment.logoDarkPath}` } : {}),
      ...(deployment.logoLightPath
        ? { light: `${deploymentBase}/${deployment.logoLightPath}` }
        : {}),
    };
    if (Object.keys(logos).length > 0) {
      logoPaths = logos;
    }
  }
  return { ...app, clientPath, logoPaths };
}
