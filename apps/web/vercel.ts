import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nitro",
  redirects: [
    {
      source: "/homepage",
      destination: "/home",
      permanent: true,
    },
  ],
};
