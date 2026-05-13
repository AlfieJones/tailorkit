import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Building2Icon, MailIcon, PlusIcon } from "lucide-react";

import { AccountLayout } from "@/components/account-layout";
import { CreateOrgDialog } from "@/components/create-org-dialog";
import { orpc } from "@/utils/orpc";
import { Avatar, AvatarFallback } from "@tailorkit/ui/components/avatar";
import { Badge } from "@tailorkit/ui/components/badge";
import { Button } from "@tailorkit/ui/components/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFrame,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@tailorkit/ui/components/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@tailorkit/ui/components/empty";

export const Route = createFileRoute("/(app)/account/organizations")({
  component: OrganizationsPage,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(context.orpc.user.getOrgs.queryOptions()),
      context.queryClient.ensureQueryData(context.orpc.user.getPendingInvitations.queryOptions()),
    ]);
  },
});

function orgInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

function OrganizationsPage() {
  const { data: orgs } = useSuspenseQuery(orpc.user.getOrgs.queryOptions());
  const { data: invitations } = useSuspenseQuery(orpc.user.getPendingInvitations.queryOptions());
  const pendingInviteCount = invitations.length;

  return (
    <AccountLayout>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-semibold text-2xl tracking-normal">Organisations</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              View your organisations and create a new workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button render={<Link to="/account/invites" />} size="sm" variant="outline">
              <MailIcon />
              Invites
              {pendingInviteCount > 0 && (
                <Badge size="sm" variant="info">
                  {pendingInviteCount}
                </Badge>
              )}
            </Button>
            <CreateOrgDialog>
              <Button size="sm">
                <PlusIcon />
                New organisation
              </Button>
            </CreateOrgDialog>
          </div>
        </div>

        {orgs.length === 0 ? (
          <CardFrame>
            <Card>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Building2Icon />
                  </EmptyMedia>
                  <EmptyTitle>No organisations yet</EmptyTitle>
                  <EmptyDescription>
                    Create an organisation to start adding projects and teammates.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <CreateOrgDialog>
                    <Button size="sm">
                      <PlusIcon />
                      Create organisation
                    </Button>
                  </CreateOrgDialog>
                </EmptyContent>
              </Empty>
            </Card>
          </CardFrame>
        ) : (
          <CardFrame>
            {orgs.map((org) => (
              <Card key={org.id}>
                <CardHeader>
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-10 rounded-md">
                      <AvatarFallback className="rounded-md bg-primary text-primary-foreground">
                        {orgInitials(org.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">{org.name}</CardTitle>
                      <CardDescription className="truncate">
                        {org.slug ? `/${org.slug}` : "No slug set"}
                      </CardDescription>
                    </div>
                  </div>
                  {org.slug && (
                    <CardAction>
                      <Button
                        render={<Link params={{ orgSlug: org.slug }} to="/$orgSlug/~/projects" />}
                        size="sm"
                        variant="outline"
                      >
                        Open
                      </Button>
                    </CardAction>
                  )}
                </CardHeader>
                <CardPanel className="pt-0">
                  <p className="text-muted-foreground text-sm">
                    Created {formatDate(org.createdAt)}
                  </p>
                </CardPanel>
              </Card>
            ))}
          </CardFrame>
        )}
      </div>
    </AccountLayout>
  );
}
