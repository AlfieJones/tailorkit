import { auth } from "@tailorkit/auth";
import { db } from "@tailorkit/db";
import { env } from "@tailorkit/env/server";
import { publicProcedure, protectedProcedure, requireOrg } from "../procedures";
import z from "zod";
import { validateOrgSlug } from "@tailorkit/db/validate-org-slug";

const MANUAL_ORG_ONBOARDING_MESSAGE =
  "We're currently onboarding users manually. Contact us to create an organisation for your account.";

export const userRouter = {
  getSession: publicProcedure.handler(({ context }) => ({
    session: context.session,
    user: context.user,
  })),

  getOrgs: protectedProcedure.handler(async ({ context }) => {
    const orgs = await db.query.organization.findMany({
      where: {
        members: { userId: context.user.id },
      },
    });

    return orgs;
  }),

  getOrg: protectedProcedure
    .input(z.union([z.object({ orgId: z.string() }), z.object({ orgSlug: z.string() })]))
    .use(requireOrg())
    .handler(({ context }) => context.org),

  checkOrgSlug: protectedProcedure
    .input(z.object({ slug: z.string().min(2).max(48) }))
    .handler(async ({ input, errors }) => {
      const result = validateOrgSlug(input.slug);
      if (!result.valid) {
        throw errors.BAD_REQUEST({ message: result.reason });
      }

      const existingOrg = await db.query.organization.findFirst({
        columns: { id: true },
        where: { slug: input.slug },
      });

      return { available: !existingOrg };
    }),

  createOrg: protectedProcedure
    .input(z.object({ name: z.string().min(1), slug: z.string().min(2).max(48) }))
    .handler(async ({ input, context, errors }) => {
      if (env.VERCEL_ENV === "production") {
        throw errors.FORBIDDEN({ message: MANUAL_ORG_ONBOARDING_MESSAGE });
      }

      const result = validateOrgSlug(input.slug);
      if (!result.valid) {
        throw errors.BAD_REQUEST({ message: result.reason });
      }

      const existingOrg = await db.query.organization.findFirst({
        columns: { id: true },
        where: { slug: input.slug },
      });

      if (existingOrg) {
        throw errors.BAD_REQUEST({ message: "This organisation slug is already taken." });
      }

      const org = await auth.api.createOrganization({
        body: { name: input.name, slug: input.slug, userId: context.user.id },
      });

      return org;
    }),

  getPendingInvitations: protectedProcedure.handler(async ({ context }) => {
    const invitations = await db.query.invitation.findMany({
      where: { email: context.user.email, status: "pending", expiresAt: { gt: new Date() } },
      with: { organization: true },
    });
    return invitations;
  }),

  acceptInvitation: protectedProcedure
    .input(z.object({ invitationId: z.string() }))
    .handler(({ input, context }) =>
      auth.api.acceptInvitation({
        body: { invitationId: input.invitationId },
        headers: context.headers,
      }),
    ),

  rejectInvitation: protectedProcedure
    .input(z.object({ invitationId: z.string() }))
    .handler(({ input, context }) =>
      auth.api.rejectInvitation({
        body: { invitationId: input.invitationId },
        headers: context.headers,
      }),
    ),
};
