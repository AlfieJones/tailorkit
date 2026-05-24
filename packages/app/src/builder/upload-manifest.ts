import { z } from "zod";

export const tailorkitUploadManifestSchema = z.object({
  assets: z.object({
    client: z.string().min(1),
  }),
  version: z.literal(1),
});

export type TailorKitUploadManifest = z.output<typeof tailorkitUploadManifestSchema>;

export const createTailorKitUploadManifest = (): TailorKitUploadManifest =>
  tailorkitUploadManifestSchema.parse({
    assets: {
      client: "client.js",
    },
    version: 1,
  });
