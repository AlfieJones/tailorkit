import type { Organization } from "@tailorkit/db/schema/auth";
import type { Project } from "@tailorkit/db/schema/project";
import { getStorage } from "@tailorkit/storage";
import type { Storage } from "@tailorkit/storage";
import { auth } from "@tailorkit/auth";
import { db } from "@tailorkit/db";

export interface Context {
  project: Project;
  organization: Organization;
  storage: Storage;
}

export async function createContext({ request }: { request: Request }): Promise<Context> {
  const storage = getStorage();
  if (!storage) {
    throw new Error("Storage not initialized");
  }

  const [scheme, key] = request.headers.get("authorization")?.split(" ") ?? [];

  if (!key) {
    throw new Error("Authorization header not found");
  }
  if (scheme !== "Bearer") {
    throw new Error("Invalid authorization scheme");
  }

  const apiKey = await auth.api.verifyApiKey({ body: { key } });

  if (!apiKey || !apiKey.valid) {
    throw new Error("Invalid API key");
  }

  const projectId: string = apiKey.key?.metadata?.projectId;
  if (!projectId) {
    throw new Error("Project ID not found in API key metadata");
  }

  const project = await db.query.project.findFirst({
    where: {
      id: projectId,
    },
    with: { organization: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (!project.organization) {
    throw new Error("Organization not found");
  }

  return {
    project,
    organization: project.organization,
    storage,
  };
}
