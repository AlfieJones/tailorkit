import { auth } from "@tailorkit/auth";
import { publicProcedure } from "..";
import z from "zod";
import { db } from "@tailorkit/db";

export const userRouter = {
  getSession: publicProcedure.handler(({ context }) => ({
    session: context.session,
    user: context.user,
  })),

  getOrgs: publicProcedure.handler(({ context }) =>
    auth.api.listOrganizations({ headers: context.headers }),
  ),

  getOrg: publicProcedure
    .input(z.union([z.object({ orgId: z.string() }), z.object({ orgSlug: z.string() })]))
    .handler(({ context, input }) => {
      const org = db.query.organization.findFirst({
        where: {
          orgId: input.orgId,
          slug: input.orgSlug,
        },
      });
      return org;
    }),
};
