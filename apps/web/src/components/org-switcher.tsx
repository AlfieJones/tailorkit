import { useState } from "react";
import { BuildingIcon, CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@tailorkit/ui/components/avatar";
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

import { CreateOrgDialog } from "./create-org-dialog";

interface Org {
  name: string;
  slug: string;
}

const MOCK_ORGS: Org[] = [
  { name: "Acme Corp", slug: "acme" },
  { name: "Globex Inc", slug: "globex" },
];

interface OrgSwitcherProps {
  orgSlug: string;
}

export function OrgSwitcher({ orgSlug }: OrgSwitcherProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const currentOrg = MOCK_ORGS.find((o) => o.slug === orgSlug) ?? {
    name: orgSlug.charAt(0).toUpperCase() + orgSlug.slice(1),
    slug: orgSlug,
  };

  const initials = currentOrg.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            size="lg"
          />
        }
      >
        <Avatar className="size-6 rounded-md">
          <AvatarFallback className="rounded-md bg-primary text-[10px] text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="truncate font-medium text-sm">{currentOrg.name}</span>
        <ChevronsUpDownIcon className="ml-auto size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64" side="right">
        <DropdownMenuLabel className="text-muted-foreground text-xs">
          Organisations
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {MOCK_ORGS.map((org) => (
            <DropdownMenuItem
              key={org.slug}
              onSelect={() => {
                setOpen(false);
                document.cookie = `last-org=${org.slug}; path=/; max-age=${60 * 60 * 24 * 30}`;
                navigate({ params: { orgSlug: org.slug }, to: "/$orgSlug" });
              }}
            >
              <Avatar className="size-5 rounded-sm">
                <AvatarFallback className="rounded-sm text-[10px]">
                  {org.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {org.name}
              {org.slug === orgSlug && <CheckIcon className="ml-auto size-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <CreateOrgDialog>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <div className="flex size-5 items-center justify-center rounded-sm border">
              <PlusIcon className="size-3.5" />
            </div>
            Create organisation
          </DropdownMenuItem>
        </CreateOrgDialog>
        <DropdownMenuItem>
          <BuildingIcon />
          Manage organisations
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
