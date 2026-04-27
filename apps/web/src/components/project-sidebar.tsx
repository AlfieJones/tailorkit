import {
  ArrowLeftIcon,
  CheckSquareIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  SettingsIcon,
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
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { cn } from "@tailorkit/ui/lib/utils";

import { FindCommand } from "./find-command";
import { SidebarUserMenu } from "./sidebar-user-menu";

interface ProjectSidebarProps {
  orgSlug: string;
  projectSlug: string;
}

export function ProjectSidebar({ orgSlug, projectSlug }: ProjectSidebarProps) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const base = `/${orgSlug}/${projectSlug}`;
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const projectName = projectSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <Button
          className="-mx-1 justify-start gap-1.5 text-muted-foreground"
          size="sm"
          variant="ghost"
          onClick={() => navigate({ params: { orgSlug }, to: "/$orgSlug/projects" })}
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to projects
        </Button>

        <div className="flex min-w-0 items-center justify-between gap-1 pt-1">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-md",
                "bg-violet-500/15 text-violet-600 dark:text-violet-400",
              )}
            >
              <span className="font-bold text-[10px]">{projectName.charAt(0).toUpperCase()}</span>
            </div>
            <span className="truncate font-medium text-sm">{projectName}</span>
          </div>
          <SidebarTrigger className="-mr-1 text-muted-foreground" />
        </div>

        <FindCommand orgSlug={orgSlug} />
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Project</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={pathname === base}
                render={<Link params={{ orgSlug, projectSlug }} to="/$orgSlug/$projectSlug" />}
                tooltip="Overview"
              >
                <LayoutDashboardIcon />
                <span>Overview</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isActive(`${base}/tasks`)}
                render={
                  <Link params={{ orgSlug, projectSlug }} to="/$orgSlug/$projectSlug/tasks" />
                }
                tooltip="Tasks"
              >
                <CheckSquareIcon />
                <span>Tasks</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isActive(`${base}/docs`)}
                render={<Link params={{ orgSlug, projectSlug }} to="/$orgSlug/$projectSlug/docs" />}
                tooltip="Docs"
              >
                <FileTextIcon />
                <span>Docs</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isActive(`${base}/settings`)}
                render={
                  <Link params={{ orgSlug, projectSlug }} to="/$orgSlug/$projectSlug/settings" />
                }
                tooltip="Settings"
              >
                <SettingsIcon />
                <span>Settings</span>
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

export function ProjectSidebarHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
    </header>
  );
}
