import { ORPCError } from "@orpc/server";
import { db } from "@tailorkit/db";
import { App, app } from "@tailorkit/db/schema/apps";
import { eq } from "drizzle-orm";
import z from "zod";
import { paginatedOutput, paginationQuery } from "../pagination";
import { o, protectedRouter, requireApp } from "../procedures";

const listApps = protectedRouter
  .route({
    path: "/",
    method: "GET",
  })
  .input(z.object({ query: paginationQuery }))
  .output(paginatedOutput(App))
  .handler(async ({ context, input }) => {
    const { page, pageSize } = input.query;
    const apps = await db.query.app.findMany({
      where: {
        projectId: context.project.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      limit: pageSize + 1,
      offset: (page - 1) * pageSize,
    });

    return {
      body: {
        items: apps.slice(0, pageSize),
        pagination: {
          hasMore: apps.length > pageSize,
          page,
          pageSize,
        },
      },
    };
  });

const getApp = protectedRouter
  .route({
    path: "/:appId",
    method: "GET",
  })
  .input(z.object({ params: z.object({ appId: z.string() }) }))
  .output(z.object({ body: App }))
  .use(requireApp, ({ params: { appId } }) => ({ appId }))
  .handler(({ context }) => ({ body: context.app }));

const createApp = protectedRouter
  .route({
    path: "/",
    method: "POST",
  })
  .input(
    z.object({
      body: App.pick({ name: true, description: true, resourceId: true }),
    }),
  )
  .output(z.object({ body: App }))
  .handler(async ({ context, input }) => {
    const [createdApp] = await db
      .insert(app)
      .values({
        description: input.body.description?.trim() || undefined,
        name: input.body.name.trim(),
        projectId: context.project.id,
        resourceId: input.body.resourceId,
      })
      .returning();

    if (!createdApp) {
      throw new ORPCError("BAD_REQUEST", { message: "Failed to create app." });
    }

    return { body: createdApp };
  });

const deleteApp = protectedRouter
  .route({
    path: "/:appId",
    method: "DELETE",
  })
  .input(z.object({ params: z.object({ appId: z.string() }) }))
  .output(z.object({ body: z.object({ id: z.uuid({ version: "v7" }) }) }))
  .use(requireApp, ({ params: { appId } }) => ({ appId }))
  .handler(async ({ context }) => {
    await db.delete(app).where(eq(app.id, context.app.id));

    return { body: { id: context.app.id } };
  });

const updateApp = protectedRouter
  .route({
    path: "/:appId",
    method: "PUT",
  })
  .input(
    z.object({
      body: App.pick({ name: true, description: true, resourceId: true }),
      params: z.object({ appId: z.string() }),
    }),
  )
  .output(z.object({ body: App }))
  .use(requireApp, ({ params: { appId } }) => ({ appId }))
  .handler(async ({ context, input }) => {
    const [updatedApp] = await db
      .update(app)
      .set({
        description:
          input.body.description === undefined ? undefined : input.body.description?.trim() || null,
        name: input.body.name?.trim(),
        resourceId: input.body.resourceId,
      })
      .where(eq(app.id, context.app.id))
      .returning();

    if (!updatedApp) {
      throw new ORPCError("BAD_REQUEST", { message: "Failed to update app." });
    }

    return { body: updatedApp };
  });

const deploy = protectedRouter
  .route({
    path: "/:appId/deploy",
    method: "POST",
  })
  .input(
    z.object({
      body: z.object({ deploymentId: z.string() }),
      params: z.object({ appId: z.string() }),
    }),
  )
  .output(z.object({ body: App }))
  .use(requireApp, ({ params: { appId } }) => ({ appId }))
  .handler(async ({ context, input }) => {
    const deployment = await db.query.appDeployment.findFirst({
      where: {
        appId: context.app.id,
        id: input.body.deploymentId,
      },
    });

    if (!deployment) {
      throw new ORPCError("NOT_FOUND", { message: "Deployment not found." });
    }

    const [updatedApp] = await db
      .update(app)
      .set({ currentDeploymentId: deployment.id })
      .where(eq(app.id, context.app.id))
      .returning();

    if (!updatedApp) {
      throw new ORPCError("BAD_REQUEST", { message: "Failed to deploy app." });
    }

    return { body: updatedApp };
  });

export const appRouter = o.prefix("/apps").router({
  list: listApps,
  get: getApp,
  create: createApp,
  delete: deleteApp,
  update: updateApp,
  deploy,
});
