import { Badge } from "@tailorkit/ui/badge";
import { Button } from "@tailorkit/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tailorkit/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tailorkit/ui/table";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
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

      <section>
        <Card className="rounded-lg">
          <CardHeader className="p-4">
            <CardTitle>Customers</CardTitle>
            <CardDescription>Click a row to open the customer record.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <CustomerTable limit={4} />
          </CardContent>
        </Card>
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

export function CustomerTable({ limit }: { limit?: number }) {
  const visibleCustomers = typeof limit === "number" ? customers.slice(0, limit) : customers;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Value</TableHead>
          <TableHead className="w-px" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {visibleCustomers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>
              <div className="font-medium">{customer.name}</div>
              <div className="mt-1 text-muted-foreground text-xs">{customer.company}</div>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(customer.status)}>{customer.status}</Badge>
            </TableCell>
            <TableCell>{customer.owner}</TableCell>
            <TableCell>{customer.value}</TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="ghost"
                render={<Link to="/customers/$customerId" params={{ customerId: customer.id }} />}
              >
                View
                <ArrowRight aria-hidden="true" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function DealTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Account</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Close date</TableHead>
          <TableHead className="w-px" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {deals.map((deal) => (
          <TableRow key={deal.id}>
            <TableCell className="font-medium">{deal.account}</TableCell>
            <TableCell>
              <Badge variant="secondary">{deal.stage}</Badge>
            </TableCell>
            <TableCell>{deal.amount}</TableCell>
            <TableCell>{deal.closeDate}</TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="ghost"
                render={<Link to="/deals/$dealId" params={{ dealId: deal.id }} />}
              >
                View
                <ArrowRight aria-hidden="true" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function getStatusVariant(status: string) {
  if (status === "Active") {
    return "success";
  }

  if (status === "At risk") {
    return "warning";
  }

  return "info";
}
