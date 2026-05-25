import { createAuthClient } from "better-auth/react";
import { emailOTPClient, organizationClient } from "better-auth/client/plugins";
import { ac, roles } from "@tailorkit/auth/lib/permissions";
import { dashClient } from "@better-auth/infra/client";

export const authClient = createAuthClient({
  plugins: [
    dashClient(),
    emailOTPClient(),
    organizationClient({
      ac,
      roles,
    }),
  ],
});
