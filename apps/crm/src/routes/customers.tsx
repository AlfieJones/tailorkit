import { createFileRoute } from "@tanstack/react-router";
import { CrmApp } from "#components/crm-app";

export const Route = createFileRoute("/customers")({
  component: () => <CrmApp page="customers" />,
});
