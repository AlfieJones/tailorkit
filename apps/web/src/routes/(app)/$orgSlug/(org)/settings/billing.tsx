import { createFileRoute } from "@tanstack/react-router";
import { CreditCardIcon } from "lucide-react";
import { Button } from "@tailorkit/ui/components/button";

export const Route = createFileRoute("/(app)/$orgSlug/(org)/settings/billing")({
  component: OrgSettingsBilling,
});

function OrgSettingsBilling() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Billing</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Manage your subscription and payment details.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <CreditCardIcon className="size-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-sm">Free plan</p>
          <p className="mt-1 text-muted-foreground text-xs">Upgrade to unlock more features.</p>
        </div>
        <Button size="sm">Upgrade plan</Button>
      </div>
    </div>
  );
}
