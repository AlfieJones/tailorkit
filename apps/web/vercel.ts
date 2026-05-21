import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  rewrites: [
    {
      source: "/",
      missing: [
        {
          key: "tailorkit.session_token",
          type: "cookie",
          value: { re: ".+" },
        },
      ],
      destination: "https://tailorkit-docs.vercel.app",
    },
    {
      source: "/docs/:path*",
      destination: "https://tailorkit-docs.vercel.app/docs/:path*",
    },
    {
      source: "/docs-assets/:path*",
      destination: "https://tailorkit-docs.vercel.app/docs-assets/:path*",
    },
  ],
};
