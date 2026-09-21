import { previewStart } from "@tailorkit/client-platform/client";
import { z } from "zod";
import { getCliDeployToken, o, requireCliDeployToken } from "../procedures";

/** Host route used by the CLI to start a scope-authorized preview session. */
export const previewRouter = {
  start: o
    .use(requireCliDeployToken)
    .input(z.object({ appId: z.string().min(1) }))
    .handler(
      async ({ context, input }) =>
        await previewStart({
          body: { appId: input.appId, deployToken: getCliDeployToken(context.request) },
          client: context.platform,
          headers: context.platformHeaders,
        }),
    ),
};
