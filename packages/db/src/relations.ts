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
  },
  app: {
    activeVersion: r.one.appVersion({
      from: r.app.activeVersionId,
      to: r.appVersion.id,
    }),
    pendingUploads: r.many.pendingAssetUpload({
      from: r.app.id,
      to: r.pendingAssetUpload.appId,
    }),
    versions: r.many.appVersion({
      from: r.app.id,
      to: r.appVersion.appId,
    }),
  },
  appVersion: {
    app: r.one.app({
      from: r.appVersion.appId,
      to: r.app.id,
    }),
    clientFile: r.one.appVersionClientFile({
      from: r.appVersion.id,
      to: r.appVersionClientFile.versionId,
    }),
  },
  pendingAssetUpload: {
    app: r.one.app({
      from: r.pendingAssetUpload.appId,
      to: r.app.id,
    }),
  },
  appVersionClientFile: {
    version: r.one.appVersion({
      from: r.appVersionClientFile.versionId,
      to: r.appVersion.id,
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
