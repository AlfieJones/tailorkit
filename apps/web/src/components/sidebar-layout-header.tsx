import { Separator } from "@tailorkit/ui/components/separator";
import { SidebarTrigger, useSidebar } from "@tailorkit/ui/components/sidebar";

import { NavBreadcrumb } from "@/components/nav-breadcrumb";
import { useHeaderActions } from "@/components/header-actions";

export function SidebarLayoutHeader() {
  const { open } = useSidebar();
  const { actions } = useHeaderActions();
  return (
    <header className="flex h-13 shrink-0 items-center gap-2 border-b px-4">
      {/* Mobile: always show trigger to open sheet */}
      <SidebarTrigger className="-ml-1 lg:hidden" />
      <Separator className="h-4 lg:hidden" orientation="vertical" />
      {/* Desktop: only show trigger when sidebar is collapsed */}
      {!open && (
        <>
          <SidebarTrigger className="-ml-1 hidden lg:flex" />
          <Separator className="hidden h-4 lg:block" orientation="vertical" />
        </>
      )}
      <NavBreadcrumb />
      {actions && <div className="ml-auto">{actions}</div>}
    </header>
  );
}
