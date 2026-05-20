import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  invitation: {
    user: r.one.user({
      from: r.invitation.inviterId,
      to: r.user.id,
    }),
    organization: r.one.organization({
      from: r.invitation.organizationId,
      to: r.organization.id,
    }),
  },
  member: {
    organization: r.one.organization({
      from: r.member.organizationId,
      to: r.organization.id,
    }),
    user: r.one.user({
      from: r.member.userId,
      to: r.user.id,
    }),
  },
  organization: {
    invitations: r.many.invitation({
      from: r.organization.id,
      to: r.invitation.organizationId,
    }),
    members: r.many.member({
      from: r.organization.id,
      to: r.member.organizationId,
    }),
    projects: r.many.project({
      from: r.organization.id,
      to: r.project.organizationId,
    }),
  },
  project: {
    organization: r.one.organization({
      from: r.project.organizationId,
      to: r.organization.id,
    }),
    apps: r.many.app({
      from: r.project.id,
      to: r.app.projectId,
    }),
    cliAuthSessions: r.many.cliAuthSession({
      from: r.project.id,
      to: r.cliAuthSession.projectId,
    }),
    cliTokens: r.many.cliToken({
      from: r.project.id,
      to: r.cliToken.projectId,
    }),
  },

  cliAuthSession: {
    project: r.one.project({
      from: r.cliAuthSession.projectId,
      to: r.project.id,
    }),
  },

  cliToken: {
    project: r.one.project({
      from: r.cliToken.projectId,
      to: r.project.id,
    }),
  },

  app: {
    project: r.one.project({
      from: r.app.projectId,
      to: r.project.id,
    }),
    currentDeployment: r.one.appDeployment({
      from: r.app.currentDeploymentId,
      to: r.appDeployment.id,
    }),
    deployments: r.many.appDeployment({
      from: r.app.id,
      to: r.appDeployment.appId,
    }),
  },

  appDeployment: {
    app: r.one.app({
      from: r.appDeployment.appId,
      to: r.app.id,
    }),
    files: r.many.appDeploymentFile({
      from: r.appDeployment.id,
      to: r.appDeploymentFile.appDeploymentId,
    }),
  },

  appDeploymentFile: {
    appDeployment: r.one.appDeployment({
      from: r.appDeploymentFile.appDeploymentId,
      to: r.appDeployment.id,
    }),
  },

  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  user: {
    accounts: r.many.account({
      from: r.user.id,
      to: r.account.userId,
    }),
    invitations: r.many.invitation({
      from: r.user.id,
      to: r.invitation.inviterId,
    }),
    members: r.many.member({
      from: r.user.id,
      to: r.member.userId,
    }),
    sessions: r.many.session({
      from: r.user.id,
      to: r.session.userId,
    }),
  },
}));
