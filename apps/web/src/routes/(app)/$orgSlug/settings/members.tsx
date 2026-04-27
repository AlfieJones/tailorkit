import { createFileRoute } from "@tanstack/react-router";
import { UserPlusIcon } from "lucide-react";
import { Button } from "@tailorkit/ui/components/button";

export const Route = createFileRoute("/(app)/$orgSlug/settings/members")({
  component: OrgSettingsMembers,
});

function OrgSettingsMembers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Members</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Manage who has access to this organisation.
          </p>
        </div>
        <Button size="sm">
          <UserPlusIcon />
          Invite member
        </Button>
      </div>

      <div className="rounded-lg border">
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-muted font-medium text-xs">
            A
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">Admin User</p>
            <p className="truncate text-muted-foreground text-xs">admin@example.com</p>
          </div>
          <span className="rounded-md bg-muted px-2 py-0.5 font-medium text-xs">Owner</span>
        </div>
      </div>
    </div>
  );
}
