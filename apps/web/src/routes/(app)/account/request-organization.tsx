import { Link, createFileRoute } from "@tanstack/react-router";

import { AccountLayout } from "#components/account-layout";
import { CreateOrgDialog } from "#components/create-org-dialog";
import { PageLayout } from "#components/page-layout";
import { Button } from "@tailorkit/ui/components/button";
import { Card, CardFrame, CardHeader, CardPanel, CardTitle } from "@tailorkit/ui/components/card";

export const Route = createFileRoute("/(app)/account/request-organization")({
  component: RequestOrganizationPage,
});

function RequestOrganizationPage() {
  return (
    <AccountLayout>
      <PageLayout
        description="Create a workspace for your projects and collaborators."
        title="Create an organisation"
      >
        <CardFrame>
          <Card>
            <CardHeader>
              <CardTitle>New workspace</CardTitle>
            </CardHeader>
            <CardPanel className="flex flex-col gap-4">
              <p className="text-muted-foreground text-sm">
                Create an organisation to start building and managing TailorKit projects.
              </p>
              <div className="flex flex-wrap gap-2">
                <CreateOrgDialog>
                  <Button size="sm">Create organisation</Button>
                </CreateOrgDialog>
                <Button render={<Link to="/account/invites" />} size="sm" variant="outline">
                  View invites
                </Button>
              </div>
            </CardPanel>
          </Card>
        </CardFrame>
      </PageLayout>
    </AccountLayout>
  );
}
