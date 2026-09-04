import { assetConfig, required } from "./config.ts";

export function vercelAssetEnvironment(stage: string, env: NodeJS.ProcessEnv) {
  const config = assetConfig(stage, env);
  const projectId = required(env, "ASSET_VERCEL_PROJECT_ID");
  const teamId = required(env, "ASSET_VERCEL_TEAM_ID");
  // Staging uses a dedicated backend project, not all PR previews of production.
  // Its own production target supplies the stable staging PLATFORM_ORIGIN.
  if (stage === "staging" && projectId === "prj_j6dnFezdIT69bfAJyahTm1QKKLC9") {
    throw new Error("Staging must target a separate Vercel backend project");
  }
  const values = {
    ASSET_DOMAIN: config.domain,
    ASSET_GATEWAY_SECRET: config.gatewaySecret,
    BLOB_BUCKET: config.bucketName,
    BLOB_ENDPOINT: `https://${config.accountId}.r2.cloudflarestorage.com`,
    BLOB_REGION: "auto",
    BLOB_FORCE_PATH_STYLE: "false",
  };
  return {
    projectId,
    teamId,
    variables: Object.entries(values).map(([key, value]) => ({
      key,
      value,
      target: ["production"],
      type: key === "ASSET_GATEWAY_SECRET" ? "sensitive" : "plain",
      comment: "Managed by the TailorKit asset infrastructure workflow",
    })),
  };
}

export async function syncVercelAssets(stage: string, env: NodeJS.ProcessEnv, request = fetch) {
  const { projectId, teamId, variables } = vercelAssetEnvironment(stage, env);
  const token = required(env, "VERCEL_TOKEN");
  const url = new URL(`https://api.vercel.com/v10/projects/${encodeURIComponent(projectId)}/env`);
  url.searchParams.set("teamId", teamId);
  url.searchParams.set("upsert", "true");
  const response = await request(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(variables),
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    // Vercel responses may contain submitted values: never log their bodies.
    throw new Error(`Vercel asset environment sync failed (HTTP ${response.status})`);
  }
  const result: unknown = await response.json();
  if (
    typeof result !== "object" ||
    result === null ||
    !("failed" in result) ||
    !Array.isArray(result.failed) ||
    result.failed.length > 0 ||
    !("created" in result) ||
    !Array.isArray(result.created)
  ) {
    throw new Error("Vercel did not confirm all asset environment updates");
  }
  const created = result.created;
  if (
    !variables.every((variable) =>
      created.some(
        (item) =>
          typeof item === "object" && item !== null && "key" in item && item.key === variable.key,
      ),
    )
  ) {
    throw new Error("Vercel did not confirm all asset environment updates");
  }
}
