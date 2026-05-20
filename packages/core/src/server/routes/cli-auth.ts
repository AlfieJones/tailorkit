import {
  cliAuthApprove,
  cliAuthDeny,
  cliAuthPoll,
  cliAuthStart,
} from "@tailorkit/client-platform/client";
import { z } from "zod";
import { getTailorKitScopeId, o, requireCliDeployToken, requireHostAuth } from "../procedures";

export const cliAuthRouter = {
  approve: o
    .use(requireHostAuth)
    .input(z.object({ userCode: z.string().min(1) }))
    .handler(
      async ({ context, input }) =>
        await cliAuthApprove({
          body: {
            scopeId: getTailorKitScopeId(context),
            userCode: input.userCode,
          },
          client: context.platform,
          headers: context.platformHeaders,
        }),
    ),
  deny: o
    .use(requireHostAuth)
    .input(z.object({ userCode: z.string().min(1) }))
    .handler(
      async ({ context, input }) =>
        await cliAuthDeny({
          body: {
            userCode: input.userCode,
          },
          client: context.platform,
          headers: context.platformHeaders,
        }),
    ),
  poll: o.input(z.object({ deviceCode: z.string().min(1) })).handler(
    async ({ context, input }) =>
      await cliAuthPoll({
        body: {
          deviceCode: input.deviceCode,
        },
        client: context.platform,
        headers: context.platformHeaders,
      }),
  ),
  start: o.input(z.object({})).handler(
    async ({ context }) =>
      await cliAuthStart({
        body: {},
        client: context.platform,
        headers: context.platformHeaders,
      }),
  ),
  verifyToken: o
    .input(z.object({}))
    .use(requireCliDeployToken)
    .handler(({ context }) => ({ scopeId: getTailorKitScopeId(context) })),
};
