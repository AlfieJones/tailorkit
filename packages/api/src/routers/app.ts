import { ORPCError } from "@orpc/server";
import { db } from "@tailorkit/db";
import { app } from "@tailorkit/db/schema/apps";
import z from "zod";
import { protectedProcedure, requireProject } from "../procedures";

const appKeySchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9_-]*$/u, {
    message:
      "App keys must start with a lowercase letter or number and only include lowercase letters, numbers, underscores, and hyphens.",
  });

const projectInput = z.object({
  orgSlug: z.string(),
  projectSlug: z.string(),
});

export const hostedAppRouter = {
  create: protectedProcedure
    .input(
      projectInput.extend({
        description: z.string().optional(),
        key: appKeySchema,
        name: z.string().min(1).optional(),
        resourceId: z.string().min(1).optional(),
      }),
    )
    .use(requireProject({ project: ["update"] }))
    .handler(async ({ input, context }) => {
      const existing = await db.query.app.findFirst({
        where: {
          key: input.key,
          projectId: context.project.id,
        },
      });

      if (existing) {
        throw new ORPCError("BAD_REQUEST", {
          message: "An app with this key already exists in this project.",
        });
      }

      const [createdApp] = await db
        .insert(app)
        .values({
          description: input.description?.trim() || undefined,
          key: input.key,
          name: input.name?.trim() || undefined,
          projectId: context.project.id,
          resourceId: input.resourceId ?? context.project.id,
        })
        .returning();

      if (!createdApp) {
        throw new ORPCError("BAD_REQUEST", { message: "Failed to create app." });
      }

      return createdApp;
    }),
};
