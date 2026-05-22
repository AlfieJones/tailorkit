import { Badge } from "@tailorkit/ui/badge";
import { Button } from "@tailorkit/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tailorkit/ui/card";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getDeal } from "#lib/crm-data";

export const Route = createFileRoute("/deals/$dealId")({
  component: DealDetailPage,
  loader: ({ params }) => {
    const deal = getDeal(params.dealId);

    if (!deal) {
      throw notFound();
    }

    return { deal };
  },
});

function DealDetailPage() {
  const { deal } = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <Button size="sm" variant="ghost" render={<Link to="/deals" />}>
        <ArrowLeft aria-hidden="true" />
        Deals
      </Button>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-semibold text-2xl tracking-normal">{deal.account}</h1>
          <Badge variant="secondary">{deal.stage}</Badge>
        </div>
        <p className="mt-1 text-muted-foreground text-sm">{deal.amount}</p>
      </div>

      <Card className="rounded-lg">
        <CardHeader className="p-4">
          <CardTitle>Deal details</CardTitle>
          <CardDescription>Current sales motion and close plan.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 pb-4 pt-0 sm:grid-cols-2">
          <Detail label="Owner" value={deal.owner} />
          <Detail label="Close date" value={deal.closeDate} />
          <Detail label="Probability" value={deal.probability} />
          <Detail label="Next step" value={deal.nextStep} />
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="mt-1 font-medium text-sm">{value}</p>
      </CardContent>
    </Card>
  );
}
