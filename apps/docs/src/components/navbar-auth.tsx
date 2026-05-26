import {
  LaptopMinimalIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
  UserIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@tailorkit/ui/components/avatar";
import { Button } from "@tailorkit/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tailorkit/ui/components/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@tailorkit/ui/components/toggle-group";

type DocsSession = {
  user?: {
    email?: string | null;
    image?: string | null;
    name?: string | null;
  } | null;
} | null;

const authLinks = {
  account: "/account/profile",
  dashboard: "/",
  login: "/login",
  logout: "/logout",
  signUp: "/sign-up",
};

export function NavbarAuth() {
  const [session, setSession] = useState<DocsSession>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/get-session", {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!(response.ok && response.headers.get("content-type")?.includes("application/json"))) {
          return;
        }

        const nextSession = (await response.json()) as DocsSession;

        if (!cancelled) {
          setSession(nextSession);
        }
      } catch {
        if (!cancelled) {
          setSession(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return <div className="h-8 w-28" />;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" render={<a href={authLinks.login} />}>
          Login
        </Button>
        <Button size="sm" render={<a href={authLinks.signUp} />}>
          Sign up
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" render={<a href={authLinks.dashboard} />}>
        <LayoutDashboardIcon />
        Dashboard
      </Button>
      <UserMenu session={session} />
    </div>
  );
}

function UserMenu({ session }: { session: NonNullable<DocsSession> }) {
  const { setTheme, theme } = useTheme();
  const user = session.user;
  const name = user?.name || "User";
  const email = user?.email || "";
  const image = user?.image || undefined;
  const initials = useMemo(
    () =>
      name
        .split(" ")
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "U",
    [name],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button aria-label="Open user menu" size="icon-sm" variant="ghost" />}
      >
        <Avatar className="size-7 rounded-lg">
          {image && <AvatarImage alt={name} src={image} />}
          <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5">
            <Avatar className="size-7 rounded-lg">
              {image && <AvatarImage alt={name} src={image} />}
              <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col text-sm leading-tight">
              <span className="truncate font-medium">{name}</span>
              <span className="truncate text-muted-foreground text-xs">{email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<a href={authLinks.account} />}>
          <UserIcon />
          Account settings
        </DropdownMenuItem>
        <DropdownMenuItem render={<a href={authLinks.dashboard} />}>
          <LayoutDashboardIcon />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem render={<a href={authLinks.account} />}>
          <SettingsIcon />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem closeOnClick={false} className="p-0 data-highlighted:bg-transparent">
          <div className="flex w-full items-center justify-between gap-3">
            <p className="px-2 text-sm">Theme</p>
            <ToggleGroup
              aria-label="Theme"
              size="sm"
              value={[theme ?? "system"]}
              variant="default"
              onValueChange={(value) => {
                const nextTheme = value[0];

                if (nextTheme === "system" || nextTheme === "light" || nextTheme === "dark") {
                  setTheme(nextTheme);
                }
              }}
            >
              <ToggleGroupItem aria-label="System theme" title="System" value="system">
                <LaptopMinimalIcon />
              </ToggleGroupItem>
              <ToggleGroupItem aria-label="Light theme" title="Light" value="light">
                <SunIcon />
              </ToggleGroupItem>
              <ToggleGroupItem aria-label="Dark theme" title="Dark" value="dark">
                <MoonIcon />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<a href={authLinks.logout} />} variant="destructive">
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
