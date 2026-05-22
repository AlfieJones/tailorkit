import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nitro",
  rewrites: [
    {
      source: "/",
      destination: "/home",
      missing: [
        {
          type: "cookie",
          key: "tailorkit.session_token",
        },
      ],
    },
  ],
};
