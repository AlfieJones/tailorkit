import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Building2Icon, MailIcon, PlusIcon } from "lucide-react";

import { AccountLayout } from "#components/account-layout";
import { CreateOrgDialog } from "#components/create-org-dialog";
import { PageLayout } from "#components/page-layout";
import { isOrgCreationManaged } from "#lib/org-creation";
import { orpc } from "#lib/orpc";
import { Avatar, AvatarFallback } from "@tailorkit/ui/components/avatar";
import { Badge } from "@tailorkit/ui/components/badge";
import { Button } from "@tailorkit/ui/components/button";
import { Card, CardFrame } from "@tailorkit/ui/components/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@tailorkit/ui/components/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tailorkit/ui/components/table";

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
      <PageLayout
        actions={
          <>
            <Button render={<Link to="/account/invites" />} size="sm" variant="outline">
              <MailIcon />
              Invites
              {pendingInviteCount > 0 && (
                <Badge size="sm" variant="info">
                  {pendingInviteCount}
                </Badge>
              )}
            </Button>
            {isOrgCreationManaged ? (
              <Button render={<Link to="/account/request-organization" />} size="sm">
                <PlusIcon />
                New organisation
              </Button>
            ) : (
              <CreateOrgDialog>
                <Button size="sm" type="button">
                  <PlusIcon />
                  New organisation
                </Button>
              </CreateOrgDialog>
            )}
          </>
        }
        description="View your organisations and create a new workspace."
        title="Organisations"
      >
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
                  {isOrgCreationManaged ? (
                    <Button render={<Link to="/account/request-organization" />} size="sm">
                      <PlusIcon />
                      Create organisation
                    </Button>
                  ) : (
                    <CreateOrgDialog>
                      <Button size="sm" type="button">
                        <PlusIcon />
                        Create organisation
                      </Button>
                    </CreateOrgDialog>
                  )}
                </EmptyContent>
              </Empty>
            </Card>
          </CardFrame>
        ) : (
          <CardFrame className="w-full">
            <Table className="table-fixed" variant="card">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[48%]">Organisation</TableHead>
                  <TableHead className="w-[24%]">Slug</TableHead>
                  <TableHead className="w-[18%]">Created</TableHead>
                  <TableHead className="w-[10%] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orgs.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="size-8 rounded-md">
                          <AvatarFallback className="rounded-md bg-primary text-primary-foreground text-xs">
                            {orgInitials(org.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate font-medium text-sm">{org.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="truncate text-muted-foreground">
                      {org.slug ? `/${org.slug}` : "No slug set"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(org.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        {org.slug ? (
                          <Button
                            render={
                              <Link params={{ orgSlug: org.slug }} to="/$orgSlug/~/projects" />
                            }
                            size="sm"
                            variant="outline"
                          >
                            Open
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">Unavailable</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardFrame>
        )}
      </PageLayout>
    </AccountLayout>
  );
}
