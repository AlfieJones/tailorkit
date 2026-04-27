import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@tailorkit/ui/components/button";

export const Route = createFileRoute("/(app)/settings/security")({
  component: SettingsSecurity,
});

function SettingsSecurity() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Security</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Manage your password and authentication settings.
        </p>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <h2 className="font-medium text-sm">Change password</h2>
        <div className="space-y-1">
          <label className="text-muted-foreground text-xs">Current password</label>
          <input
            className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            type="password"
          />
        </div>
        <div className="space-y-1">
          <label className="text-muted-foreground text-xs">New password</label>
          <input
            className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            type="password"
          />
        </div>
        <Button size="sm">Update password</Button>
      </div>
    </div>
  );
}
