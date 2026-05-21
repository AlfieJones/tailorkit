import { createAuthClient } from "better-auth/react";
import { emailOTPClient, organizationClient } from "better-auth/client/plugins";
import { ac, roles } from "@tailorkit/auth/lib/permissions";
import { sentinelClient, dashClient } from "@better-auth/infra/client";

export const authClient = createAuthClient({
  plugins: [
    sentinelClient(),
    dashClient(),
    emailOTPClient(),
    organizationClient({
      ac,
      roles,
    }),
  ],
});
