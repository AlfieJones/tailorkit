import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@tailorkit/ui/components/button";

export const Route = createFileRoute("/(app)/$orgSlug/(org)/settings/")({
  component: OrgSettingsGeneral,
});

function OrgSettingsGeneral() {
  const { orgSlug } = Route.useParams();
  const orgName = orgSlug.charAt(0).toUpperCase() + orgSlug.slice(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">General</h1>
        <p className="mt-1 text-muted-foreground text-sm">Manage your organisation settings.</p>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <div className="space-y-1">
          <label className="font-medium text-sm">Organisation name</label>
          <input
            className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            defaultValue={orgName}
          />
        </div>
        <div className="space-y-1">
          <label className="font-medium text-sm">Slug</label>
          <input
            className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            defaultValue={orgSlug}
          />
          <p className="text-muted-foreground text-xs">Your org URL: tailorkit.com/{orgSlug}</p>
        </div>
        <Button size="sm">Save changes</Button>
      </div>
    </div>
  );
}
