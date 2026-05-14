import type { Organization } from "@tailorkit/db/schema/auth";
import type { Project } from "@tailorkit/db/schema/project";

export interface Context {
  project: Project;
  organization: Organization;
}
