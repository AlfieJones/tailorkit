import { defineClient } from "@tailorkit/app";
import defaultScreen from "./screens/default";

const client = defineClient({
  screens: {
    "/": defaultScreen,
  },
});

export default client;
