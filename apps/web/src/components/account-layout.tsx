import { useQuery } from "@tanstack/react-query";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Building2Icon, ChevronLeftIcon, MailIcon, ShieldIcon, UserIcon } from "lucide-react";
import type { ReactNode } from "react";

import { SidebarLayoutHeader } from "@/components/sidebar-layout-header";
import { SidebarBrand } from "@/components/sidebar/sidebar-brand";
import { SidebarUserMenu } from "@/components/sidebar/sidebar-user-menu";
import { orpc } from "@/utils/orpc";
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

export function AccountSidebar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isActive = (path: string) => pathname === path;

  const { data: orgs } = useQuery(orpc.user.getOrgs.queryOptions());
  const activeOrgId =
    typeof window !== "undefined" ? (sessionStorage.getItem("active-org-id") ?? "") : "";
  const backOrg = orgs?.find((org) => org.id === activeOrgId) ?? orgs?.[0];

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarHeaderRow>
          <SidebarBrand />
        </SidebarHeaderRow>
        <Link
          className="-mx-1 relative flex w-[calc(100%+0.5rem)] items-center rounded px-1 py-1.5 font-medium text-foreground text-sm transition-colors hover:bg-accent"
          params={backOrg?.slug ? { orgSlug: backOrg.slug } : undefined}
          to={backOrg?.slug ? "/$orgSlug" : "/"}
        >
          <ChevronLeftIcon className="absolute left-1 size-4 text-muted-foreground" />
          <span className="flex-1 text-center">Account</span>
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
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isActive("/account/organizations")}
                render={<Link to="/account/organizations" />}
              >
                <Building2Icon />
                <span>Organisations</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isActive("/account/invites")}
                render={<Link to="/account/invites" />}
              >
                <MailIcon />
                <span>Invites</span>
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

export function AccountLayout({ children }: { children?: ReactNode }) {
  return (
    <SidebarProvider>
      <AccountSidebar />
      <SidebarInset>
        <SidebarLayoutHeader />
        <main className="flex flex-1 flex-col gap-4 p-6">{children ?? <Outlet />}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
