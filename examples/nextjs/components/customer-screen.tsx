"use client";

import type { DemoUser } from "@examples/shared";
import type { Customer } from "@/lib/crm-data";
import tailor from "@/lib/tailorkit-client";

interface CustomerListContext {
  customers: Customer[];
  user: DemoUser;
}

export function CustomerListScreen({ context }: { context: CustomerListContext }) {
  tailor.useCurrentScreen({ context, screen: "/customers" });
  return null;
}

export function CustomerDetailScreen({
  context,
}: {
  context: CustomerListContext & { customer: Customer };
}) {
  tailor.useCurrentScreen({ context, screen: "/customers/detail" });
  return null;
}
