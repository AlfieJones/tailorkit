import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { DealTable, MetricCard, PageHeader } from "#components/crm-ui";
import { deals } from "#lib/crm-data";

export const Route = createFileRoute("/deals")({ component: DealsPage });

function DealsPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (pathname !== "/deals") {
    return <Outlet />;
  }

  return (
    <div className="space-y-6">
      <PageHeader description="Open opportunities and expected close dates." title="Deals" />

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Open deals" value={deals.length} />
        <MetricCard label="Largest deal" value={deals[0]?.amount ?? "$0"} />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-semibold text-lg">Deal list</h2>
          <p className="text-muted-foreground text-sm">
            Open opportunities by stage, owner, and value.
          </p>
        </div>
        <DealTable />
      </section>
    </div>
  );
}
