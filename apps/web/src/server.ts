import { initializeObservability } from "@tailorkit/observability";

await initializeObservability("tailorkit-web");

const { default: handler, createServerEntry } = await import("@tanstack/react-start/server-entry");

export default createServerEntry({
  fetch(request) {
    return handler.fetch(request);
  },
});
