import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@tailorkit/ui/components/sidebar";

import { ProjectSidebar } from "@/components/sidebar/project-sidebar";
import { SidebarLayoutHeader } from "@/components/sidebar-layout-header";

export const Route = createFileRoute("/(app)/$orgSlug/$projectSlug")({
  component: ProjectLayout,
});

function ProjectLayout() {
  const { orgSlug, projectSlug } = Route.useParams();

  return (
    <SidebarProvider>
      <ProjectSidebar orgSlug={orgSlug} projectSlug={projectSlug} />
      <SidebarInset>
        <SidebarLayoutHeader />
        <main className="flex flex-1 flex-col gap-4 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
