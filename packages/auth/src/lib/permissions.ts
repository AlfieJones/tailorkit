import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

const statement = {
  ...defaultStatements,

  project: ["create", "share", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

const member = ac.newRole({
  project: ["create"],
  ...memberAc.statements,
});

const admin = ac.newRole({
  project: ["create", "update"],
  ...adminAc.statements,
});

const owner = ac.newRole({
  project: ["create", "update", "delete"],
  ...ownerAc.statements,
});

export const roles = {
  member,
  admin,
  owner,
};
