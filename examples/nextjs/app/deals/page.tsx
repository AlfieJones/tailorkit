import { DealTable, MetricCard, PageHeader } from "@/components/crm-ui";
import { deals } from "@/lib/crm-data";

export default function DealsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader description="Open opportunities and expected close dates." title="Deals" />

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Open deals" value={deals.length} />
        <MetricCard label="Largest deal" value={deals[0]?.amount ?? "$0"} />
      </section>

      <section className="flex flex-col gap-3">
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
