import type { Organization } from "@tailorkit/db/schema/auth";
import type { Project } from "@tailorkit/db/schema/project";
import type { Storage } from "@tailorkit/storage";

export interface Context {
  project: Project;
  organization: Organization;
  storage: Storage;
}
