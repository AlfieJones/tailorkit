import { Badge } from "@tailorkit/ui/badge";
import { Button } from "@tailorkit/ui/button";
import { CardFrame } from "@tailorkit/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tailorkit/ui/table";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { customers } from "#/lib/crm-data";

export function CustomerTable({ limit }: { limit?: number }) {
  const visibleCustomers = typeof limit === "number" ? customers.slice(0, limit) : customers;

  return (
    <CardFrame className="w-full">
      <Table variant="card">
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
                <Badge variant="outline">
                  <span
                    aria-hidden="true"
                    className={`size-1.5 rounded-full ${getStatusIndicatorClassName(customer.status)}`}
                  />
                  {customer.status}
                </Badge>
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
    </CardFrame>
  );
}

function getStatusIndicatorClassName(status: string) {
  if (status === "Active") {
    return "bg-emerald-500";
  }

  if (status === "At risk") {
    return "bg-amber-500";
  }

  return "bg-sky-500";
}
