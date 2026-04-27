import { useState } from "react";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  FolderIcon,
  LifeBuoyIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
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
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@tailorkit/ui/lib/utils";

import { FindCommand } from "./find-command";
import { Logo } from "./logo";
import { OrgSwitcher } from "./org-switcher";
import { SidebarUserMenu } from "./sidebar-user-menu";

type SidebarPanel = "main" | "settings";

interface AppSidebarProps {
  orgSlug: string;
}

export function AppSidebar({ orgSlug }: AppSidebarProps) {
  const [panel, setPanel] = useState<SidebarPanel>("main");
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <Sidebar collapsible="offcanvas">
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Main panel */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col transition-transform duration-200 ease-in-out",
            panel === "settings" ? "-translate-x-full" : "translate-x-0",
          )}
        >
          <SidebarHeader>
            <div className="flex items-center justify-between gap-1">
              <Logo />
              <SidebarTrigger className="-mr-1 text-muted-foreground" />
            </div>
            <OrgSwitcher orgSlug={orgSlug} />
            <FindCommand orgSlug={orgSlug} />
          </SidebarHeader>

          <SidebarSeparator />

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Platform</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive(`/${orgSlug}/projects`)}
                    render={<Link params={{ orgSlug }} to="/$orgSlug/projects" />}
                    tooltip="Projects"
                  >
                    <FolderIcon />
                    <span>Projects</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive(`/${orgSlug}/support`)}
                    render={<Link params={{ orgSlug }} to="/$orgSlug/support" />}
                    tooltip="Support"
                  >
                    <LifeBuoyIcon />
                    <span>Support</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="justify-between"
                    tooltip="Settings"
                    onClick={() => setPanel("settings")}
                  >
                    <span className="flex items-center gap-2">
                      <SettingsIcon />
                      Settings
                    </span>
                    <ChevronRightIcon className="size-4 text-muted-foreground" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarUserMenu />
          </SidebarFooter>
        </div>

        {/* Settings panel */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col transition-transform duration-200 ease-in-out",
            panel === "settings" ? "translate-x-0" : "translate-x-full",
          )}
        >
          <SidebarHeader>
            <Button
              className="-mx-1 justify-start gap-1.5 text-muted-foreground"
              size="sm"
              variant="ghost"
              onClick={() => setPanel("main")}
            >
              <ArrowLeftIcon className="size-3.5" />
              Back
            </Button>
            <p className="px-1 font-semibold text-sm">Settings</p>
          </SidebarHeader>

          <SidebarSeparator />

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Organisation</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === `/${orgSlug}/settings`}
                    render={<Link params={{ orgSlug }} to="/$orgSlug/settings/" />}
                  >
                    <SettingsIcon />
                    <span>General</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive(`/${orgSlug}/settings/members`)}
                    render={<Link params={{ orgSlug }} to="/$orgSlug/settings/members" />}
                  >
                    <UsersIcon />
                    <span>Members</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive(`/${orgSlug}/settings/billing`)}
                    render={<Link params={{ orgSlug }} to="/$orgSlug/settings/billing" />}
                  >
                    <CreditCardIcon />
                    <span>Billing</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarUserMenu />
          </SidebarFooter>
        </div>
      </div>
    </Sidebar>
  );
}

export function AppSidebarHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
    </header>
  );
}
