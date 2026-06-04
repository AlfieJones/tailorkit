import type { DemoUser } from "@examples/shared";
import { Link } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@tailorkit/ui/sidebar";
import { ThemeToggle } from "@tailorkit/ui/theme-toggle";
import { BarChart3, Building2, Handshake, Users } from "lucide-react";
import { useThemeMode } from "#lib/use-theme.tsx";
import { UserMenu } from "./user-menu";

const navItems = [
  { icon: BarChart3, label: "Overview", to: "/" },
  { icon: Users, label: "Customers", to: "/customers" },
  { icon: Handshake, label: "Deals", to: "/deals" },
] as const;

export function AppSidebar({ signOut, user }: { signOut: () => Promise<void>; user: DemoUser }) {
  const { isDark, toggleTheme } = useThemeMode();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-sm">Northwind CRM</p>
            <p className="text-muted-foreground text-xs">Sales workspace</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map(({ icon: Icon, label, to }) => (
              <SidebarMenuItem key={to}>
                <SidebarMenuButton
                  render={
                    <Link
                      to={to}
                      activeOptions={{ exact: to === "/" }}
                      activeProps={{ "data-active": true }}
                    />
                  }
                >
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-1">
          <UserMenu signOut={signOut} user={user} />
          <ThemeToggle aria-pressed={isDark} onClick={toggleTheme} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
