import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import type { LoadedTailorKitConfig } from "@tailorkit/app/config";
import { loadTailorKitConfig } from "@tailorkit/app/config";
import { buildSandbox } from "../src/build";

const testDirectories: string[] = [];

const createProject = async (): Promise<string> => {
  const root = await mkdtemp(path.join(tmpdir(), "tailorkit-build-"));
  testDirectories.push(root);
  await mkdir(path.join(root, "src"), { recursive: true });
  await writeFile(
    path.join(root, "package.json"),
    JSON.stringify({ name: "tailorkit-build-test", type: "module" }),
  );
  return root;
};

const buildProject = async (loadedConfig: LoadedTailorKitConfig): Promise<string> => {
  const outDir = await buildSandbox(loadedConfig);
  return readFile(path.join(outDir, "worker.js"), "utf-8");
};

afterEach(async () => {
  for (const directory of testDirectories.splice(0)) {
    await rm(directory, { force: true, recursive: true });
  }
});

describe("buildSandbox", () => {
  it("emits the default client entry to .tailorkit/client/worker.js", async () => {
    const root = await createProject();
    await writeFile(path.join(root, "tailorkit.config.ts"), "export default {};");
    await writeFile(path.join(root, "src/client.ts"), "globalThis.__defaultClient = 'built';");

    const worker = await buildProject(await loadTailorKitConfig(undefined, root));

    expect(worker).toContain("__defaultClient");
  });

  it("uses the client entry configured in tailorkit.config.ts", async () => {
    const root = await createProject();
    await writeFile(
      path.join(root, "tailorkit.config.ts"),
      `export default {
        client: {
          entry: "./src/custom-client.ts",
        },
        vite: {
          build: {
            minify: false,
          },
        },
      };`,
    );
    await writeFile(path.join(root, "src/client.ts"), "globalThis.__defaultClient = 'wrong';");
    await writeFile(
      path.join(root, "src/custom-client.ts"),
      "globalThis.__configuredClient = 'built';",
    );

    const worker = await buildProject(await loadTailorKitConfig(undefined, root));

    expect(worker).toContain("__configuredClient");
    expect(worker).not.toContain("__defaultClient");
  });
});
