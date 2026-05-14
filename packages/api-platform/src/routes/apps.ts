import z from "zod";
import { protectedRouter, requireApp } from "../procedures";
import { App } from "@tailorkit/db/schema/apps";

const listApps = protectedRouter
  .route({
    path: "/",
    method: "GET",
  })
  .input(z.object({}))
  .output(z.array(z.object({})))
  .handler(async () => {});

const getApp = protectedRouter
  .route({
    path: "/:appId",
    method: "GET",
  })
  .input(z.object({ appId: z.string(), resourceId: z.string() }))
  .output(z.object({}))
  .use(requireApp)
  .handler(async () => {});

const createApp = protectedRouter
  .route({
    path: "/",
    method: "POST",
  })
  .input(App.pick({ name: true, description: true, resourceId: true }))
  .output(z.object({}))
  .handler(async () => {});

const deleteApp = protectedRouter
  .route({
    path: "/:appId",
    method: "DELETE",
  })
  .input(z.object({ appId: z.string() }))
  .output(z.object({}))
  .handler(async () => {});

const updateApp = protectedRouter
  .route({
    path: "/:appId",
    method: "PUT",
  })
  .input(z.object({ appId: z.string() }))
  .output(z.object({}))
  .handler(async () => {});

const deploy = protectedRouter
  .route({
    path: "/:appId/deploy",
    method: "POST",
  })
  .input(z.object({ appId: z.string(), deploymentId: z.string() }))
  .output(z.object({}))
  .use(requireApp)
  .handler(async () => {});

export const appRouter = protectedRouter.prefix("/apps").router({
  list: listApps,
  get: getApp,
  create: createApp,
  delete: deleteApp,
  update: updateApp,
  deploy,
});
