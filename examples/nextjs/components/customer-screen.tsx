"use client";

import { useScope } from "tailorkit/react";

import type { Customer } from "@/lib/crm-data";
import "@/lib/tailorkit-client";

interface CustomerListContext {
  customers: Customer[];
}

export function CustomerListScreen({ context }: { context: CustomerListContext }) {
  useScope({ context, scope: "/customers" });
  return null;
}

export function CustomerDetailScreen({ context }: { context: { customer: Customer } }) {
  useScope({ context, scope: "/customers/detail" });
  return null;
}
