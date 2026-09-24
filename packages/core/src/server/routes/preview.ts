import { ORPCError } from "@orpc/server";
import { previewStart, previewStop } from "@tailorkit/client-platform/client";
import { z } from "zod";
import { getCliDeployToken, o, requireCliDeployToken } from "../procedures";

function isActivePreviewConflict(error: unknown): boolean {
  if (error instanceof Error) {
    return /active preview already exists|preview is already running/iu.test(error.message);
  }
  if (!error || typeof error !== "object") {
    return false;
  }
  if (
    "message" in error &&
    typeof error.message === "string" &&
    /active preview already exists|preview is already running/iu.test(error.message)
  ) {
    return true;
  }
  return (
    ("error" in error && isActivePreviewConflict(error.error)) ||
    ("cause" in error && isActivePreviewConflict(error.cause))
  );
}

/** Host route used by the CLI to start a scope-authorized preview session. */
export const previewRouter = {
  start: o
    .use(requireCliDeployToken)
    .input(z.object({ appId: z.string().min(1), replaceActive: z.boolean().optional() }))
    .handler(async ({ context, input }) => {
      try {
        return await previewStart({
          body: {
            appId: input.appId,
            deployToken: getCliDeployToken(context.request),
            replaceActive: input.replaceActive,
          },
          client: context.platform,
          headers: context.platformHeaders,
        });
      } catch (error) {
        if (isActivePreviewConflict(error)) {
          throw new ORPCError("CONFLICT", {
            message:
              "A preview is already running for this app. Run `pnpm tailorkit preview --replace` to end it and start a new one.",
          });
        }
        throw error;
      }
    }),
  /** Host route used by the CLI to end a preview session it started. */
  stop: o
    .use(requireCliDeployToken)
    .input(z.object({ sessionId: z.uuid() }))
    .handler(
      async ({ context, input }) =>
        await previewStop({
          body: { deployToken: getCliDeployToken(context.request) },
          client: context.platform,
          headers: context.platformHeaders,
          path: { sessionId: input.sessionId },
        }),
    ),
};
