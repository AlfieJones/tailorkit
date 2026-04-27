import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@tailorkit/ui/components/sidebar";
import { Separator } from "@tailorkit/ui/components/separator";

import { NavBreadcrumb } from "@/components/nav-breadcrumb";
import { ProjectSidebar } from "@/components/project-sidebar";

export const Route = createFileRoute("/(app)/$orgSlug/$projectSlug")({
  component: ProjectLayout,
});

function ProjectLayout() {
  const { orgSlug, projectSlug } = Route.useParams();

  return (
    <SidebarProvider>
      <ProjectSidebar orgSlug={orgSlug} projectSlug={projectSlug} />
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
