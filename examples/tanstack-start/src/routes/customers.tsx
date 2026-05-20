import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { Card, CardDescription, CardHeader, CardTitle } from "@tailorkit/ui/card";
import { CustomerTable } from "#/components/customer-table";
import { customers } from "#/lib/crm-data";
import { PageHeader } from "./index";

export const Route = createFileRoute("/customers")({ component: CustomersPage });

function CustomersPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (pathname !== "/customers") {
    return <Outlet />;
  }

  return (
    <div className="space-y-6">
      <PageHeader description="Accounts, owners, and current pipeline value." title="Customers" />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-lg">
          <CardHeader className="p-4">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl">{customers.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg">
          <CardHeader className="p-4">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-2xl">
              {customers.filter((customer) => customer.status === "Active").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg">
          <CardHeader className="p-4">
            <CardDescription>At risk</CardDescription>
            <CardTitle className="text-2xl">
              {customers.filter((customer) => customer.status === "At risk").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-semibold text-lg">Customer list</h2>
          <p className="text-muted-foreground text-sm">
            Click through to view contact details and next steps.
          </p>
        </div>
        <CustomerTable />
      </section>
    </div>
  );
}
