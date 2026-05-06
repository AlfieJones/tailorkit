import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tailorkit/ui/card";
import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { deals } from "#/lib/crm-data";
import { DealTable, PageHeader } from "./index";

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
        <Card className="rounded-lg">
          <CardHeader className="p-4">
            <CardDescription>Open deals</CardDescription>
            <CardTitle className="text-2xl">{deals.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg sm:col-span-2">
          <CardHeader className="p-4">
            <CardDescription>Largest deal</CardDescription>
            <CardTitle className="text-2xl">{deals[0]?.amount ?? "$0"}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="rounded-lg">
        <CardHeader className="p-4">
          <CardTitle>Deal list</CardTitle>
          <CardDescription>
            Click through to view owner, probability, and next step.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DealTable />
        </CardContent>
      </Card>
    </div>
  );
}
