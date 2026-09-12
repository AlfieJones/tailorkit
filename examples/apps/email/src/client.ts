import { defineClient } from "@tailorkit/app";
import navigation from "./screens/navigation";
import defaultScreen from "./screens/default";

const client = defineClient({
  viewports: {
    panel: { screens: { "/": defaultScreen } },
    navbar: { screens: { "/": navigation } },
  },
});

export default client;
