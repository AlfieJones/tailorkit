import { z } from "zod";

const clientConfigSchema = z.object({
  entry: z.string().default("./src/client.ts"),
});

const buildConfigSchema = z.object({
  outDir: z.string().default(".tailorkit"),
});

const tailorkitConfigSchema = z.object({
  client: clientConfigSchema.optional(),
  build: buildConfigSchema.optional(),
});

export type TailorKitConfig = z.input<typeof tailorkitConfigSchema>;
export type ResolvedTailorKitConfig = z.output<typeof tailorkitConfigSchema>;

export { tailorkitConfigSchema };

export const defineConfig = (config: TailorKitConfig): TailorKitConfig => config;
