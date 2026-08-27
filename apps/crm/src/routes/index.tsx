import { createFileRoute } from "@tanstack/react-router";
import { CrmApp } from "#components/crm-app";

export const Route = createFileRoute("/")({ component: () => <CrmApp page="overview" /> });
