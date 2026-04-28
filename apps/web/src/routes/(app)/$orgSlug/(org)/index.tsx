import { createFileRoute } from "@tanstack/react-router";
import { FolderIcon, LifeBuoyIcon, UsersIcon } from "lucide-react";

export const Route = createFileRoute("/(app)/$orgSlug/(org)/")({
  component: OrgHome,
});

function OrgHome() {
  const { orgSlug } = Route.useParams();
  const orgName = orgSlug.charAt(0).toUpperCase() + orgSlug.slice(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">{orgName}</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Welcome to your organisation dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(
          [
            { icon: FolderIcon, label: "Projects", value: "—" },
            { icon: UsersIcon, label: "Members", value: "—" },
            { icon: LifeBuoyIcon, label: "Open tickets", value: "—" },
          ] as const
        ).map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 rounded-lg border bg-card p-4">
            <div className="flex size-9 items-center justify-center rounded-md bg-muted">
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-lg leading-none">{value}</p>
              <p className="mt-0.5 text-muted-foreground text-xs">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
