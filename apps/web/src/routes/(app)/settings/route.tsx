import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@tailorkit/ui/components/sidebar";
import { Separator } from "@tailorkit/ui/components/separator";

import { NavBreadcrumb } from "@/components/nav-breadcrumb";
import { UserSettingsSidebar } from "@/components/user-settings-sidebar";

export const Route = createFileRoute("/(app)/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  const returnTo =
    typeof document !== "undefined"
      ? `/${document.cookie.match(/last-org=([^;]+)/)?.[1] ?? ""}`
      : "/";

  return (
    <SidebarProvider>
      <UserSettingsSidebar returnTo={returnTo} />
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
