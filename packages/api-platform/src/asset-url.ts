import { env } from "@tailorkit/env/server";
import { AppDeployment } from "@tailorkit/db/schema/apps";
import z from "zod";

export const DeploymentWithAssetUrl = AppDeployment.extend({ clientEntryUrl: z.url().nullable() });

export function withAssetUrl(deployment: AppDeployment, publicTeamId: string, projectId: string) {
  return {
    ...deployment,
    clientEntryUrl:
      deployment.status === "published" && deployment.clientEntryFileId
        ? `https://${publicTeamId}.${env.ASSET_DOMAIN}/p/${projectId}/a/${deployment.appId}/d/${deployment.id}/client.js`
        : null,
  };
}

export function withAppAssetUrl<T extends { currentDeployment: AppDeployment | null }>(
  app: T,
  publicTeamId: string,
  projectId: string,
) {
  const currentDeployment = app.currentDeployment
    ? withAssetUrl(app.currentDeployment, publicTeamId, projectId)
    : null;
  return { ...app, currentDeployment, clientPath: currentDeployment?.clientEntryUrl ?? undefined };
}
