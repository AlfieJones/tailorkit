import { Outlet, createFileRoute, useRouterState, Link } from "@tanstack/react-router";

import { SidebarLayoutHeader } from "@/components/sidebar-layout-header";
import { useQuery } from "@tanstack/react-query";

import { ChevronLeftIcon, ShieldIcon, UserIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarHeaderRow,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@tailorkit/ui/components/sidebar";

import { orpc } from "@/utils/orpc";
import { SidebarBrand } from "@/components/sidebar/sidebar-brand";
import { SidebarUserMenu } from "@/components/sidebar/sidebar-user-menu";

export const Route = createFileRoute("/(app)/account/settings")({
  component: SettingsLayout,
});

export function UserSettingsSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (path: string) => pathname === path;

  const { data: orgs } = useQuery(orpc.user.getOrgs.queryOptions());
  const activeOrgId =
    typeof window !== "undefined" ? (sessionStorage.getItem("active-org-id") ?? "") : "";
  const backOrgId = activeOrgId || orgs?.[0]?.id;

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarHeaderRow>
          <SidebarBrand />
        </SidebarHeaderRow>
        <Link
          className="-mx-1 relative flex w-[calc(100%+0.5rem)] items-center rounded px-1 py-1.5 text-foreground text-sm font-medium hover:bg-accent transition-colors"
          params={backOrgId ? { orgSlug: backOrgId } : undefined}
          to={backOrgId ? "/$orgSlug" : "/"}
        >
          <ChevronLeftIcon className="absolute left-1 size-4 text-muted-foreground" />
          <span className="flex-1 text-center">Settings</span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isActive("/account/settings")}
                render={<Link to="/account/settings" />}
              >
                <UserIcon />
                <span>Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isActive("/account/settings/security")}
                render={<Link to="/account/settings/security" />}
              >
                <ShieldIcon />
                <span>Security</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarUserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}

function SettingsLayout() {
  return (
    <SidebarProvider>
      <UserSettingsSidebar />
      <SidebarInset>
        <SidebarLayoutHeader />
        <main className="flex flex-1 flex-col gap-4 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
