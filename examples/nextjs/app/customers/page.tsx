import { CustomerTable } from "@/components/customer-table";
import { MetricCard, PageHeader } from "@/components/crm-ui";
import { customers } from "@/lib/crm-data";

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader description="Accounts, owners, and current pipeline value." title="Customers" />

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Total" value={customers.length} />
        <MetricCard
          label="Active"
          value={customers.filter((customer) => customer.status === "Active").length}
        />
        <MetricCard
          label="At risk"
          value={customers.filter((customer) => customer.status === "At risk").length}
        />
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-semibold text-lg">Customer list</h2>
          <p className="text-muted-foreground text-sm">
            Open an account to view contact details and next steps.
          </p>
        </div>
        <CustomerTable />
      </section>
    </div>
  );
}
