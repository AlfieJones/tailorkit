import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoyIcon, MessageCircleIcon } from "lucide-react";
import { Button } from "@tailorkit/ui/components/button";

export const Route = createFileRoute("/(app)/$orgSlug/support")({
  component: SupportPage,
});

function SupportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Support</h1>
          <p className="mt-1 text-muted-foreground text-sm">Get help and manage support tickets.</p>
        </div>
        <Button size="sm">
          <MessageCircleIcon />
          New ticket
        </Button>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <LifeBuoyIcon className="size-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-sm">No open tickets</p>
          <p className="mt-1 text-muted-foreground text-xs">
            Create a ticket and our team will get back to you.
          </p>
        </div>
      </div>
    </div>
  );
}
