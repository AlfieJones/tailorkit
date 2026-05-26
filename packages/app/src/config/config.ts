import { z } from "zod";

const clientConfigSchema = z.object({
  entry: z.string().default("./src/client.ts"),
});

const buildConfigSchema = z.object({
  outDir: z.string().default(".tailorkit"),
});

const deployConfigSchema = z.object({
  appId: z.string().optional(),
  authToken: z.string().optional(),
});

const tailorkitConfigSchema = z.object({
  build: buildConfigSchema.optional(),
  client: clientConfigSchema.optional(),
  deploy: deployConfigSchema.optional(),
  host: z.string().url().optional(),
});

export type TailorKitConfig = z.input<typeof tailorkitConfigSchema>;
export type ResolvedTailorKitConfig = z.output<typeof tailorkitConfigSchema>;

export { tailorkitConfigSchema };

export const defineConfig = (config: TailorKitConfig): TailorKitConfig => config;
export const defineTailorKitConfig = defineConfig;
