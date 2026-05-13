import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@tailorkit/ui/components/button";
import {
  Card,
  CardDescription,
  CardFrame,
  CardFrameFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@tailorkit/ui/components/card";
import { Field, FieldLabel } from "@tailorkit/ui/components/field";
import { Input } from "@tailorkit/ui/components/input";

export const Route = createFileRoute("/(app)/$orgSlug/~/(org)/settings/")({
  component: OrgSettingsGeneral,
});

function OrgSettingsGeneral() {
  const { orgSlug } = Route.useParams();
  const orgName = orgSlug.charAt(0).toUpperCase() + orgSlug.slice(1);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">General</h1>
        <p className="mt-1 text-muted-foreground text-sm">Manage your organisation settings.</p>
      </div>

      <CardFrame>
        <Card>
          <CardHeader>
            <CardTitle>Organisation details</CardTitle>
            <CardDescription>Update your organisation name and URL slug.</CardDescription>
          </CardHeader>
          <CardPanel className="flex flex-col gap-4">
            <Field>
              <FieldLabel>Organisation name</FieldLabel>
              <Input defaultValue={orgName} />
            </Field>
            <Field>
              <FieldLabel>Slug</FieldLabel>
              <Input defaultValue={orgSlug} />
              <p className="text-muted-foreground text-xs">Your org URL: tailorkit.com/{orgSlug}</p>
            </Field>
          </CardPanel>
        </Card>
        <CardFrameFooter className="flex justify-end">
          <Button size="sm">Save changes</Button>
        </CardFrameFooter>
      </CardFrame>
    </div>
  );
}
