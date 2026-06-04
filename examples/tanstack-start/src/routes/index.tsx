import { createFileRoute } from "@tanstack/react-router";
import { MetricCard, PageHeader } from "#components/crm-ui";
import { CustomerTable } from "#components/customer-table";
import { customers, deals } from "#lib/crm-data";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="space-y-6">
      <PageHeader description="A small CRM workspace focused on customer accounts." title="CRM" />

      <section className="grid gap-4 md:grid-cols-2">
        <MetricCard label="Customers" value={customers.length} />
        <MetricCard label="Open deals" value={deals.length} />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-semibold text-lg">Customers</h2>
          <p className="text-muted-foreground text-sm">
            Accounts by status, owner, and current value.
          </p>
        </div>
        <CustomerTable limit={4} />
      </section>
    </div>
  );
}
