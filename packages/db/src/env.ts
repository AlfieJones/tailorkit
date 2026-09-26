import * as z from "zod";
import { createEnv } from "@tailorkit/env";

export const env = createEnv("db", z.object({ DATABASE_URL: z.url() }), import.meta.url, [
  "DATABASE_URL",
]);
