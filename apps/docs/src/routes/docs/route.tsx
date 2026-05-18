import { createFileRoute, Outlet } from "@tanstack/react-router";

import { Footer } from "@/components/footer";

export const Route = createFileRoute("/docs")({
  component: DocsRoute,
});

function DocsRoute() {
  return (
    <>
      <Outlet />
      <Footer />
    </>
  );
}
