import { db } from "@tailorkit/db";
import { validateProjectSlug } from "@tailorkit/db/validate-project-slug";
import { project } from "@tailorkit/db/schema/project";
import { ORPCError } from "@orpc/server";
import { protectedProcedure, requireOrg, requireProject } from "../procedures";
import z from "zod";

const projectInput = z.object({
  orgSlug: z.string(),
  projectSlug: z.string(),
});

export const projectRouter = {
  list: protectedProcedure
    .input(z.object({ orgSlug: z.string() }))
    .use(requireOrg())
    .handler(({ context }) =>
      db.query.project.findMany({
        where: { organizationId: context.org.id },
        orderBy: { createdAt: "desc" },
      }),
    ),

  get: protectedProcedure
    .input(projectInput)
    .use(requireProject())
    .handler(({ context }) => context.project),

  create: protectedProcedure
    .input(
      z.object({
        orgSlug: z.string(),
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
      }),
    )
    .use(requireOrg({ project: ["create"] }))
    .handler(async ({ input, context, errors }) => {
      const slugResult = validateProjectSlug(input.slug);
      if (!slugResult.valid) {
        throw errors.BAD_REQUEST({ message: slugResult.reason });
      }

      const existing = await db.query.project.findFirst({
        where: { organizationId: context.org.id, slug: input.slug },
      });

      if (existing) {
        throw new ORPCError("BAD_REQUEST", {
          message: "A project with this slug already exists in this organisation.",
        });
      }

      const [createdProject] = await db
        .insert(project)
        .values({
          description: input.description?.trim() || null,
          name: input.name.trim(),
          organizationId: context.org.id,
          slug: input.slug,
        })
        .returning();

      if (!createdProject) {
        throw new ORPCError("BAD_REQUEST", { message: "Failed to create project." });
      }

      return createdProject;
    }),
};
