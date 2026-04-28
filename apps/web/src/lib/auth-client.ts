// import { polarClient } from "@polar-sh/better-auth";
import { createAuthClient } from "better-auth/react";
import { emailOTPClient, organizationClient } from "better-auth/client/plugins";
import { ac, roles } from "@tailorkit/auth/lib/permissions";

export const authClient = createAuthClient({
  plugins: [
    emailOTPClient(),
    organizationClient({
      ac,
      roles,
    }),
  ],
});
