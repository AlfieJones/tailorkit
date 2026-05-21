import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "tanstack-start",
  redirects: [
    {
      source: "/homepage",
      destination: "/home",
      permanent: true,
    },
  ],
  rewrites: [
    {
      source: "/",
      // missing: [
      //   {
      //     key: "tailorkit.session_token",
      //     type: "cookie",
      //   },
      // ],
      destination: "https://tailorkit-docs.vercel.app",
    },
    {
      source: "/home",
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
