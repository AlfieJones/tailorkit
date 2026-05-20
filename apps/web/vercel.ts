import type { VercelConfig } from "@vercel/config/v1";

const docsOrigin = "https://tailorkit-docs.vercel.app";

export const config: VercelConfig = {
  rewrites: [
    {
      destination: docsOrigin,
      missing: [
        {
          key: "tailorkit.session_token",
          type: "cookie",
        },
      ],
      source: "/",
    },
    {
      destination: `${docsOrigin}/docs/:path*`,
      source: "/docs/:path*",
    },
  ],
};
