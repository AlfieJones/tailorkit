import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

const statement = {
  ...defaultStatements,

  apiKey: ["create", "read", "update", "delete"],
  projectApiKey: ["create", "read", "update", "delete"],
  project: ["create", "share", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

const member = ac.newRole({
  apiKey: ["create", "read"],
  projectApiKey: ["create", "read"],
  project: ["create"],
  ...memberAc.statements,
});

const admin = ac.newRole({
  apiKey: ["create", "read", "update", "delete"],
  projectApiKey: ["create", "read", "update", "delete"],
  project: ["create", "update"],
  ...adminAc.statements,
});

const owner = ac.newRole({
  apiKey: ["create", "read", "update", "delete"],
  projectApiKey: ["create", "read", "update", "delete"],
  project: ["create", "update", "delete"],
  ...ownerAc.statements,
});

export const roles = {
  member,
  admin,
  owner,
};
