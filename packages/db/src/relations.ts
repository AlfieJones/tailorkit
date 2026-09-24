import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  passkey: {
    user: r.one.user({
      from: r.passkey.userId,
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
    previewSessions: r.many.previewSession({
      from: r.project.id,
      to: r.previewSession.projectId,
    }),
    appOrigins: r.many.appOrigin({ from: r.project.id, to: r.appOrigin.projectId }),
    builderConversations: r.many.builderConversation({
      from: r.project.id,
      to: r.builderConversation.projectId,
    }),
    builderRuns: r.many.builderRun({ from: r.project.id, to: r.builderRun.projectId }),
    appSourceRevisions: r.many.appSourceRevision({
      from: r.project.id,
      to: r.appSourceRevision.projectId,
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
    previewSessions: r.many.previewSession({
      from: r.cliToken.id,
      to: r.previewSession.cliTokenId,
    }),
  },

  previewSession: {
    app: r.one.app({ from: r.previewSession.appId, to: r.app.id }),
    cliToken: r.one.cliToken({ from: r.previewSession.cliTokenId, to: r.cliToken.id }),
    project: r.one.project({ from: r.previewSession.projectId, to: r.project.id }),
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
    previewSessions: r.many.previewSession({
      from: r.app.id,
      to: r.previewSession.appId,
    }),
    origins: r.many.appOrigin({ from: r.app.id, to: r.appOrigin.appId }),
    builderConversations: r.many.builderConversation({
      from: r.app.id,
      to: r.builderConversation.appId,
    }),
    builderRuns: r.many.builderRun({ from: r.app.id, to: r.builderRun.appId }),
    sourceRevisions: r.many.appSourceRevision({ from: r.app.id, to: r.appSourceRevision.appId }),
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
  appOrigin: {
    app: r.one.app({ from: r.appOrigin.appId, to: r.app.id }),
    project: r.one.project({ from: r.appOrigin.projectId, to: r.project.id }),
  },
  builderConversation: {
    app: r.one.app({ from: r.builderConversation.appId, to: r.app.id }),
    project: r.one.project({ from: r.builderConversation.projectId, to: r.project.id }),
    runs: r.many.builderRun({ from: r.builderConversation.id, to: r.builderRun.conversationId }),
    revisions: r.many.appSourceRevision({
      from: r.builderConversation.id,
      to: r.appSourceRevision.conversationId,
    }),
  },
  builderRun: {
    app: r.one.app({ from: r.builderRun.appId, to: r.app.id }),
    conversation: r.one.builderConversation({
      from: r.builderRun.conversationId,
      to: r.builderConversation.id,
    }),
    project: r.one.project({ from: r.builderRun.projectId, to: r.project.id }),
    revisions: r.many.appSourceRevision({ from: r.builderRun.id, to: r.appSourceRevision.runId }),
  },
  appSourceRevision: {
    app: r.one.app({ from: r.appSourceRevision.appId, to: r.app.id }),
    conversation: r.one.builderConversation({
      from: r.appSourceRevision.conversationId,
      to: r.builderConversation.id,
    }),
    project: r.one.project({ from: r.appSourceRevision.projectId, to: r.project.id }),
    run: r.one.builderRun({ from: r.appSourceRevision.runId, to: r.builderRun.id }),
  },

  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  twoFactor: {
    user: r.one.user({
      from: r.twoFactor.userId,
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
    passkeys: r.many.passkey({
      from: r.user.id,
      to: r.passkey.userId,
    }),
    twoFactors: r.many.twoFactor({
      from: r.user.id,
      to: r.twoFactor.userId,
    }),
  },
}));
