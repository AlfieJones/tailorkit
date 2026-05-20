import {
  deploymentsCreate,
  deploymentsGet,
  deploymentsList,
  deploymentsPublish,
} from "@tailorkit/client-platform/client";
import { z } from "zod";
import { getTailorKitScopeId, o, requireCliDeployToken } from "../procedures";

const paginationInput = z.object({
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
});

const deploymentAssetInput = z.object({
  checksum: z.string(),
  contentLength: z.number().int().min(1),
  contentType: z.literal("application/javascript"),
  encoding: z.literal("utf-8"),
  objectKey: z.string(),
});

export const deploymentRouter = {
  create: o
    .use(requireCliDeployToken)
    .input(z.object({ appId: z.string(), assets: z.tuple([deploymentAssetInput]) }))
    .handler(
      async ({ context, input }) =>
        await deploymentsCreate({
          body: {
            appId: input.appId,
            assets: input.assets,
            scopeId: getTailorKitScopeId(context),
          },
          client: context.platform,
          headers: context.platformHeaders,
        }),
    ),
  get: o
    .use(requireCliDeployToken)
    .input(z.object({ deploymentId: z.string() }))
    .handler(
      async ({ context, input }) =>
        await deploymentsGet({
          client: context.platform,
          headers: context.platformHeaders,
          path: { deploymentId: input.deploymentId },
          query: { scopeId: getTailorKitScopeId(context) },
        }),
    ),
  list: o
    .use(requireCliDeployToken)
    .input(z.object({ appId: z.string() }).merge(paginationInput))
    .handler(
      async ({ context, input }) =>
        await deploymentsList({
          client: context.platform,
          headers: context.platformHeaders,
          query: {
            appId: input.appId,
            page: input.page,
            pageSize: input.pageSize,
            scopeId: getTailorKitScopeId(context),
          },
        }),
    ),
  publish: o
    .use(requireCliDeployToken)
    .input(
      z.object({
        deploymentId: z.string(),
        rollout: z.boolean().optional(),
      }),
    )
    .handler(
      async ({ context, input }) =>
        await deploymentsPublish({
          body: { scopeId: getTailorKitScopeId(context), rollout: input.rollout },
          client: context.platform,
          headers: context.platformHeaders,
          path: { deploymentId: input.deploymentId },
        }),
    ),
};
