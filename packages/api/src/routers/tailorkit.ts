import {
  createHostedAppVersion,
  getActiveHostedAppClient,
  listHostedApps,
  publishHostedAppVersion,
} from "../hosted-apps";
import { publicProcedure } from "../procedures";
import z from "zod";

const deploymentInput = z.object({
  projectId: z.string().uuid(),
  resourceId: z.string().min(1),
});

export const tailorkitRouter = {
  createVersion: publicProcedure
    .input(
      deploymentInput.extend({
        manifest: z.unknown().optional(),
        maxBytes: z.number().int().positive(),
      }),
    )
    .handler(({ input }) => createHostedAppVersion(input)),

  getActiveClient: publicProcedure
    .input(
      deploymentInput.extend({
        appId: z.string().min(1),
      }),
    )
    .handler(({ input }) => getActiveHostedAppClient(input)),

  listApps: publicProcedure.input(deploymentInput).handler(({ input }) => listHostedApps(input)),

  publishVersion: publicProcedure
    .input(
      deploymentInput.extend({
        clientEntryUploadId: z.string().uuid(),
      }),
    )
    .handler(({ input }) => publishHostedAppVersion(input)),
};
