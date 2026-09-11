"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Button } from "@tailorkit/ui/components/button";
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
import { Link2Icon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { AccountLayout } from "#components/account-layout";
import { PageLayout } from "#components/page-layout";
import { authClient } from "#lib/auth-client";

export const Route = createFileRoute("/(app)/account/security")({
  component: SecurityPage,
  validateSearch: z.object({
    error: z.string().optional(),
    error_description: z.string().optional(),
  }),
});

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
    <path
      fill="currentColor"
      d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.91-2.78.62-3.37-1.21-3.37-1.21-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1.01.07 1.54 1.06 1.54 1.06.9 1.57 2.35 1.12 2.93.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.93a9.4 9.4 0 0 1 2.5.35c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9 0 1.38-.01 2.49-.01 2.83 0 .27.18.59.69.49A10.26 10.26 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"
    />
  </svg>
);

function SecurityPage() {
  const { error, error_description } = useSearch({ from: "/(app)/account/security" });
  const queryClient = useQueryClient();
  const [linkPending, setLinkPending] = useState(false);
  const [unlinkPending, setUnlinkPending] = useState(false);
  const accountsQuery = useQuery({
    queryKey: ["auth", "accounts"],
    queryFn: async () => {
      const result = await authClient.listAccounts();
      if (result.error) {
        throw new Error(result.error.message || "Failed to load linked accounts");
      }
      return result.data;
    },
  });
  const githubAccount = accountsQuery.data?.find((account) => account.providerId === "github");
  const canUnlinkGitHub = Boolean(githubAccount && (accountsQuery.data?.length ?? 0) > 1);

  const linkGitHub = async () => {
    setLinkPending(true);
    const result = await authClient.linkSocial({
      callbackURL: "/account/security",
      errorCallbackURL: "/account/security",
      provider: "github",
    });

    if (result.error) {
      setLinkPending(false);
      toastManager.add({
        description: result.error.message || "Failed to link GitHub",
        title: "Error",
        type: "error",
      });
    }
  };

  const unlinkGitHub = async () => {
    if (!githubAccount || !canUnlinkGitHub) {
      return;
    }

    setUnlinkPending(true);
    const result = await authClient.unlinkAccount({ accountId: githubAccount.id });
    setUnlinkPending(false);

    if (result.error) {
      toastManager.add({
        description: result.error.message || "Failed to unlink GitHub",
        title: "Error",
        type: "error",
      });
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["auth", "accounts"] });
    toastManager.add({
      description: "GitHub has been unlinked from your account.",
      title: "Account unlinked",
      type: "success",
    });
  };

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
      <PageLayout description="Update your password and keep your account secure." title="Security">
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

        <CardFrame className="w-full">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2Icon />
                Linked accounts
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Connect an external account for another way to sign in.
              </p>
            </CardHeader>

            <CardPanel>
              {(error_description || error || accountsQuery.error) && (
                <p className="mb-4 text-destructive text-sm" role="alert">
                  {error_description || error || accountsQuery.error?.message}
                </p>
              )}

              <div className="flex items-center gap-3 rounded-xl border p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <GitHubIcon />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">GitHub</p>
                  <p className="text-muted-foreground text-sm">
                    {githubAccount ? "Connected" : "Sign in with GitHub"}
                  </p>
                </div>

                {githubAccount ? (
                  <Button
                    variant="destructive-outline"
                    size="sm"
                    disabled={!canUnlinkGitHub}
                    loading={unlinkPending}
                    onClick={() => void unlinkGitHub()}
                    title={
                      canUnlinkGitHub
                        ? "Unlink GitHub"
                        : "GitHub cannot be unlinked because it is your only sign-in method"
                    }
                  >
                    Unlink
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    loading={linkPending || accountsQuery.isPending}
                    onClick={() => void linkGitHub()}
                  >
                    Link
                  </Button>
                )}
              </div>
            </CardPanel>
          </Card>
        </CardFrame>
      </PageLayout>
    </AccountLayout>
  );
}
