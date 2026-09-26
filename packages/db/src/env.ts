import * as z from "zod";
import { createEnv } from "@tailorkit/env";

export const env = createEnv({
  scope: "db",
  schema: { DATABASE_URL: z.url() },
  required: ["DATABASE_URL"],
});
