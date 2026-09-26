import * as z from "zod";
import { createEnv } from "@tailorkit/env";

export const env = createEnv({
  scope: "web",
  schema: { VERCEL_ENV: z.string().optional() },
  moduleUrl: import.meta.url,
});
