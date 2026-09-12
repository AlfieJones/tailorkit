"use client";

import { useScope } from "tailorkit/react";

import type { Customer } from "@/lib/crm-data";
import "@/lib/tailorkit-client";

interface CustomerListContext {
  customers: Customer[];
}

export function CustomerListScreen({ context }: { context: CustomerListContext }) {
  useScope("/customers", { context });
  return null;
}

export function CustomerDetailScreen({ context }: { context: { customer: Customer } }) {
  useScope("/customers/detail", { context });
  return null;
}
