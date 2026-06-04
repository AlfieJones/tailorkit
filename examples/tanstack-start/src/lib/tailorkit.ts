import { actions, components, screens } from "@examples/shared";
import { createTailorKit } from "tailorkit";

export const tailorKit = createTailorKit({
  assetsBaseUrl: process.env.TAILORKIT_ASSETS_BASE_URL ?? "http://localhost:8333/tailorkit",
  projectKey: process.env.TAILORKIT_PROJECT_KEY,
  $internal: {
    platformBaseUrl:
      process.env.TAILORKIT_PLATFORM_BASE_URL ?? "http://localhost:3000/api/platform",
  },
  actions,
  components,
  screens,
});
