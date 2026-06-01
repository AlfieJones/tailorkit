import { initializeObservability, withRequestSpan } from "@tailorkit/observability";

await initializeObservability("tailorkit-web");

const { default: handler, createServerEntry } = await import("@tanstack/react-start/server-entry");

export default createServerEntry({
  fetch(request) {
    return withRequestSpan(request, "web.request", (span) =>
      handler.fetch(request).then((response) => {
        span.setAttribute("http.response.status_code", response.status);
        return response;
      }),
    );
  },
});
