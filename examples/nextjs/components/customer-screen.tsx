"use client";

import { useView } from "tailorkit/react";

import type { Customer } from "@/lib/crm-data";
import "@/lib/tailorkit-client";

interface CustomerListContext {
  customers: Customer[];
}

export function CustomerListView({ context }: { context: CustomerListContext }) {
  useView("/customers", { context });
  return null;
}

export function CustomerDetailView({ context }: { context: { customer: Customer } }) {
  useView("/customers/detail", { context });
  return null;
}
