import { ChevronsUpDownIcon, LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@tailorkit/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tailorkit/ui/components/dropdown-menu";
import { SidebarMenuButton } from "@tailorkit/ui/components/sidebar";
import { useNavigate } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

export function SidebarUserMenu() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  const name = session?.user.name ?? "User";
  const email = session?.user.email ?? "";
  const image = session?.user.image ?? undefined;
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            size="lg"
          />
        }
      >
        <Avatar className="size-7 rounded-lg">
          {image && <AvatarImage alt={name} src={image} />}
          <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col text-left text-sm leading-tight">
          <span className="truncate font-medium">{name}</span>
          <span className="truncate text-muted-foreground text-xs">{email}</span>
        </div>
        <ChevronsUpDownIcon className="ml-auto size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56" side="top">
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
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => navigate({ to: "/settings" })}>
            <UserIcon />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate({ to: "/settings/security" })}>
            <SettingsIcon />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() =>
            authClient.signOut({
              fetchOptions: { onSuccess: () => navigate({ to: "/login" }) },
            })
          }
        >
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
