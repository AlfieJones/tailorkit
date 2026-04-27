import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@tailorkit/ui/components/sidebar";
import { Separator } from "@tailorkit/ui/components/separator";
import { useEffect } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { NavBreadcrumb } from "@/components/nav-breadcrumb";
import { setCookie } from "@tanstack/react-start/server";

export const Route = createFileRoute("/(app)/$orgSlug")({
  component: OrgLayout,
  loader: async ({ context }) => {
    await context.queryClient.ensureData(context.orpc.user.getOrgs());
  },
});

function OrgLayout() {
  const { orgSlug } = Route.useParams();

  useEffect(() => {
    window.cookieStore.set("active-org-id", orgSlug, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  }, [orgSlug]);

  return (
    <SidebarProvider>
      <AppSidebar orgSlug={orgSlug} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator className="h-4" orientation="vertical" />
          <NavBreadcrumb />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
