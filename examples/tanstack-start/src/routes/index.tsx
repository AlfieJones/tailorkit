import { Badge } from "@tailorkit/ui/badge";
import { Card, CardDescription, CardFrame, CardHeader, CardTitle } from "@tailorkit/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@tailorkit/ui/table";
import { createFileRoute } from "@tanstack/react-router";
import { CustomerTable } from "#/components/customer-table";
import { customers, deals } from "#/lib/crm-data";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="space-y-6">
      <PageHeader description="A small CRM workspace focused on customer accounts." title="CRM" />

      <section className="grid gap-4 md:grid-cols-2">
        <MetricCard label="Customers" value={customers.length.toString()} />
        <MetricCard label="Open deals" value={deals.length.toString()} />
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

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="p-4">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export function PageHeader({ description, title }: { description?: string; title: string }) {
  return (
    <div>
      <h1 className="font-semibold text-2xl tracking-normal">{title}</h1>
      {description ? <p className="mt-1 text-muted-foreground text-sm">{description}</p> : null}
    </div>
  );
}

export function DealTable() {
  return (
    <CardFrame className="w-full">
      <Table variant="card">
        <TableHeader>
          <TableRow>
            <TableHead>Account</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals.map((deal) => (
            <TableRow key={deal.id}>
              <TableCell className="font-medium">{deal.account}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  <span
                    aria-hidden="true"
                    className={`size-1.5 rounded-full ${getStageIndicatorClassName(deal.stage)}`}
                  />
                  {deal.stage}
                </Badge>
              </TableCell>
              <TableCell>{deal.owner}</TableCell>
              <TableCell className="text-right">{deal.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total Pipeline</TableCell>
            <TableCell className="text-right">{formatDealTotal()}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </CardFrame>
  );
}

function getStageIndicatorClassName(stage: string) {
  if (stage === "Negotiation") {
    return "bg-emerald-500";
  }

  if (stage === "Proposal") {
    return "bg-sky-500";
  }

  return "bg-amber-500";
}

function formatDealTotal() {
  const total = deals.reduce((sum, deal) => sum + Number(deal.amount.replaceAll(/[$,]/g, "")), 0);

  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(total);
}
