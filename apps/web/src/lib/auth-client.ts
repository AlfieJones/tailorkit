import { createAuthClient } from "better-auth/react";
import {
  emailOTPClient,
  lastLoginMethodClient,
  organizationClient,
} from "better-auth/client/plugins";
import { ac, roles } from "@tailorkit/auth/lib/permissions";
import { dashClient } from "@better-auth/infra/client";

export const authClient = createAuthClient({
  plugins: [
    dashClient(),
    emailOTPClient(),
    lastLoginMethodClient(),
    organizationClient({
      ac,
      roles,
    }),
  ],
});
