"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { BarChart3, Building2, Handshake, Users } from "lucide-react";
import type { DemoUser } from "@examples/shared";
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
} from "@tailorkit/ui/sidebar";
import { ThemeToggle } from "@tailorkit/ui/theme-toggle";
import { UserMenu } from "@/components/user-menu";

const navItems = [
  { icon: BarChart3, href: "/", label: "Overview" },
  { icon: Users, href: "/customers", label: "Customers" },
  { icon: Handshake, href: "/deals", label: "Deals" },
] as const;

export function AppSidebar({ signOut, user }: { signOut: () => Promise<void>; user: DemoUser }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-sm">Northwind CRM</p>
            <p className="text-muted-foreground text-xs">Next.js host app</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = href === "/" ? pathname === href : pathname.startsWith(href);

              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    data-active={isActive || undefined}
                    render={<Link href={href} />}
                  >
                    <Icon aria-hidden="true" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-1">
          <UserMenu signOut={signOut} user={user} />
          <ThemeToggle
            aria-pressed={resolvedTheme === "dark"}
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
