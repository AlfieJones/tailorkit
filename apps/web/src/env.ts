import * as z from "zod";
import { createEnv } from "@tailorkit/env";

export const env = createEnv(
  "web",
  z.object({ VERCEL_ENV: z.string().optional() }),
  import.meta.url,
);
