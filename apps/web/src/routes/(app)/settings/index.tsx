import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@tailorkit/ui/components/button";

export const Route = createFileRoute("/(app)/settings/")({
  component: SettingsProfile,
});

function SettingsProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Profile</h1>
        <p className="mt-1 text-muted-foreground text-sm">Manage your personal account details.</p>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <div className="space-y-1">
          <label className="font-medium text-sm">Display name</label>
          <input
            className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Your name"
          />
        </div>
        <div className="space-y-1">
          <label className="font-medium text-sm">Email</label>
          <input
            className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="you@example.com"
            type="email"
          />
        </div>
        <div className="space-y-1">
          <label className="font-medium text-sm">Bio</label>
          <textarea
            className="flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Tell us a bit about yourself"
          />
        </div>
        <Button size="sm">Save changes</Button>
      </div>
    </div>
  );
}
