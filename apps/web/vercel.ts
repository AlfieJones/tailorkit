import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  rewrites: [
    {
      destination: "https://tailorkit-docs.vercel.app",
      missing: [
        {
          key: "tailorkit.session_token",
          type: "cookie",
        },
      ],
      source: "/",
    },
    {
      destination: "https://tailorkit-docs.vercel.app/docs/:path*",
      source: "/docs/:path*",
    },
  ],
};
