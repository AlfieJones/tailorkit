import { Link, createFileRoute } from "@tanstack/react-router";

import { AccountLayout } from "#components/account-layout";
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
        description="Organisation creation is currently managed by the TailorKit team."
        title="Create an organisation"
      >
        <CardFrame>
          <Card>
            <CardHeader>
              <CardTitle>Manual onboarding</CardTitle>
            </CardHeader>
            <CardPanel className="flex flex-col gap-4">
              <p className="text-muted-foreground text-sm">
                We're currently onboarding users manually. Contact us to create an organisation for
                your account.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button render={<Link to="/account/invites" />} size="sm" variant="outline">
                  View invites
                </Button>
                <Button
                  render={<a aria-label="Contact us" href="mailto:hello@tailorkit.com" />}
                  size="sm"
                >
                  Contact us
                </Button>
              </div>
            </CardPanel>
          </Card>
        </CardFrame>
      </PageLayout>
    </AccountLayout>
  );
}
