import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tailorkit/ui/card";
import { customers } from "#/lib/crm-data";
import { CustomerTable, PageHeader } from "./index";

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

      <Card className="rounded-lg">
        <CardHeader className="p-4">
          <CardTitle>Customer list</CardTitle>
          <CardDescription>Click through to view contact details and next steps.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <CustomerTable />
        </CardContent>
      </Card>
    </div>
  );
}
