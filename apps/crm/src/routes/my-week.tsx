import { createFileRoute } from "@tanstack/react-router";
import { CrmApp } from "#components/crm-app";

export const Route = createFileRoute("/my-week")({ component: () => <CrmApp page="my-week" /> });
