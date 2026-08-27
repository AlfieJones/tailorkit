import { createFileRoute } from "@tanstack/react-router";
import { CrmApp } from "#components/crm-app";

export const Route = createFileRoute("/follow-ups")({ component: () => <CrmApp page="tasks" /> });
