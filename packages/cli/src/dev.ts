import { createServer } from "vite";
import type { InlineConfig } from "vite";

import type { LoadedTailorKitConfig } from "@tailorkit/app/config";

export const devSandbox = async (
  loadedConfig: LoadedTailorKitConfig,
  port: number | undefined,
): Promise<void> => {
  const viteConfig = (loadedConfig.config.vite ?? {}) as InlineConfig;
  const server = await createServer({
    ...viteConfig,
    configFile: false,
    root: loadedConfig.root,
    server: {
      port,
      ...viteConfig.server,
    },
  });

  await server.listen();
  server.printUrls();
  server.bindCLIShortcuts({ print: true });

  await new Promise<never>(() => {});
};
