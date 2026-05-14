import z from "zod";
import { protectedRouter, requireApp } from "../procedures";

const listAppDeployments = protectedRouter
  .route({
    path: "/",
    method: "GET",
  })
  .input(z.object({ appId: z.string() }))
  .output(z.array(z.object({})))
  .use(requireApp)
  .handler(async () => {});

const getAppDeployment = protectedRouter
  .route({
    path: "/:deploymentId",
    method: "GET",
  })
  .input(z.object({ appId: z.string(), deploymentId: z.string() }))
  .output(z.object({}))
  .use(requireApp)
  .handler(async () => {});

const createAppDeployment = protectedRouter
  .route({
    path: "/",
    method: "POST",
  })
  .input(z.object({ appId: z.string() }))
  .output(z.object({}))
  .use(requireApp)
  .handler(async () => {});

const publishAppDeployment = protectedRouter
  .route({
    path: "/:deploymentId",
    method: "POST",
  })
  .input(
    z.object({
      appId: z.string(),
      deploymentId: z.string(),
      rollout: z.boolean().optional().default(true),
    }),
  )
  .output(z.object({}))
  .use(requireApp)
  .handler(async () => {});

export const deploymentRouter = protectedRouter.prefix("/deployments").router({
  list: listAppDeployments,
  get: getAppDeployment,
  create: createAppDeployment,
  publish: publishAppDeployment,
});
