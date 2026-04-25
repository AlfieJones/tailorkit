import { polarClient } from "@polar-sh/better-auth";
import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [polarClient(), emailOTPClient(), organizationClient()],
});
