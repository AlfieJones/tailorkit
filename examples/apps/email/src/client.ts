import { defineClient } from "@tailorkit/app";
import navigation from "./views/navigation";
import defaultView from "./views/default";

const client = defineClient({
  slots: {
    panel: { "/": defaultView },
    navbar: { "/": navigation },
  },
});

export default client;
