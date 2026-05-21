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

import { AccountLayout } from "@/components/account-layout";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/(app)/account/security")({
  component: SecurityPage,
});

function SecurityPage() {
  const form = useAppForm({
    defaultValues: { currentPassword: "", newPassword: "", newPasswordRepeat: "" },
    onSubmit: async ({ value }) => {
      const result = await authClient.changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
        revokeOtherSessions: true,
      });

      if (result.error) {
        toastManager.add({
          description: result.error.message || "Failed to update password",
          title: "Error",
          type: "error",
        });
        return;
      }

      toastManager.add({
        description: "Your password has been updated.",
        title: "Password updated",
        type: "success",
      });
      form.reset();
    },
    validators: {
      onSubmit: z
        .object({
          currentPassword: z.string().min(1, "Current password is required"),
          newPassword: z.string().min(10, "Password must be at least 10 characters"),
          newPasswordRepeat: z.string().min(10, "Confirm password is required"),
        })
        .refine((data) => data.newPassword === data.newPasswordRepeat, {
          message: "Passwords do not match",
          path: ["newPasswordRepeat"],
        }),
    },
  });

  return (
    <AccountLayout>
      <div className="space-y-6 max-w-5xl w-full mx-auto">
        <CardFrame className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
            </CardHeader>

            <form
              id="change-password-form"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              <CardPanel className="flex flex-col gap-4 max-w-lg">
                <form.AppField name="currentPassword">
                  {(field) => (
                    <field.SecretTextField label="Current password" placeholder="••••••••" />
                  )}
                </form.AppField>

                <form.AppField name="newPassword">
                  {(field) => <field.SecretTextField label="New password" placeholder="••••••••" />}
                </form.AppField>

                <form.AppField name="newPasswordRepeat">
                  {(field) => (
                    <field.SecretTextField label="Confirm new password" placeholder="••••••••" />
                  )}
                </form.AppField>
              </CardPanel>
            </form>
          </Card>

          <CardFrameFooter className="flex justify-end">
            <form.AppForm>
              <form.SubmitButton form="change-password-form" size="sm">
                Update password
              </form.SubmitButton>
            </form.AppForm>
          </CardFrameFooter>
        </CardFrame>
      </div>
    </AccountLayout>
  );
}
