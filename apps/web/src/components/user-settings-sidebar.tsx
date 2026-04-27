import { ArrowLeftIcon, BellIcon, PaletteIcon, ShieldIcon, UserIcon } from "lucide-react";
import { Button } from "@tailorkit/ui/components/button";
import { Separator } from "@tailorkit/ui/components/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@tailorkit/ui/components/sidebar";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";

import { Logo } from "./logo";
import { SidebarUserMenu } from "./sidebar-user-menu";

interface UserSettingsSidebarProps {
  returnTo?: string;
}

export function UserSettingsSidebar({ returnTo = "/" }: UserSettingsSidebarProps) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (path: string) => pathname === path;

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center justify-between gap-1">
          <Logo />
          <SidebarTrigger className="-mr-1 text-muted-foreground" />
        </div>
        <Button
          className="-mx-1 justify-start gap-1.5 text-muted-foreground"
          size="sm"
          variant="ghost"
          onClick={() => navigate({ to: returnTo as "/" })}
        >
          <ArrowLeftIcon className="size-3.5" />
          Back
        </Button>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={isActive("/settings")} render={<Link to="/settings" />}>
                <UserIcon />
                <span>Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isActive("/settings/security")}
                render={<Link to="/settings/security" />}
              >
                <ShieldIcon />
                <span>Security</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isActive("/settings/notifications")}
                render={<Link to="/settings/notifications" />}
              >
                <BellIcon />
                <span>Notifications</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isActive("/settings/appearance")}
                render={<Link to="/settings/appearance" />}
              >
                <PaletteIcon />
                <span>Appearance</span>
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

export function UserSettingsSidebarHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
    </header>
  );
}
