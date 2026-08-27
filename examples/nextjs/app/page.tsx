import { CustomerTable } from "@/components/customer-table";
import { MetricCard, PageHeader } from "@/components/crm-ui";
import { customers, deals } from "@/lib/crm-data";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="A small CRM workspace whose interface can be extended with TailorKit apps."
        title="CRM overview"
      />

      <section className="grid gap-4 md:grid-cols-2">
        <MetricCard label="Customers" value={customers.length} />
        <MetricCard label="Open deals" value={deals.length} />
      </section>

      <section className="flex flex-col gap-3">
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
