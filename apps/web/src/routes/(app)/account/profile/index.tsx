"use client";

import {
  Card,
  CardFrame,
  CardFrameFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@tailorkit/ui/components/card";
import { toastManager } from "@tailorkit/ui/components/toast";
import { useAppForm } from "@tailorkit/ui/form";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { authClient } from "#lib/auth-client";

export const Route = createFileRoute("/(app)/account/profile/")({
  component: ProfilePage,
});

function ProfilePage() {
  const { data: session } = useQuery(orpc.user.getSession.queryOptions());

  const form = useAppForm({
    defaultValues: {
      name: session?.user.name ?? "",
    },
    onSubmit: async ({ value }) => {
      const result = await authClient.updateUser({
        name: value.name,
      } as Parameters<typeof authClient.updateUser>[0]);

      if (result.error) {
        toastManager.add({
          description: result.error.message || "Failed to update profile",
          title: "Error",
          type: "error",
        });
        return;
      }

      toastManager.add({
        description: "Your profile has been updated.",
        title: "Profile updated",
        type: "success",
      });
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, "Name is required"),
      }),
    },
  });

  return (
    <div className="space-y-6 max-w-5xl w-full mx-auto">
      <CardFrame className="w-full">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>

          <form
            id="profile-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <CardPanel className="flex flex-col gap-4 max-w-lg">
              <form.AppField name="name">
                {(field) => <field.TextField label="Display name" placeholder="Your name" />}
              </form.AppField>
            </CardPanel>
          </form>
        </Card>

        <CardFrameFooter className="flex justify-end">
          <form.AppForm>
            <form.SubmitButton form="profile-form" size="sm">
              Save changes
            </form.SubmitButton>
          </form.AppForm>
        </CardFrameFooter>
      </CardFrame>
    </div>
  );
}
