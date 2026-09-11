"use client";

import {
  Card,
  CardDescription,
  CardFrame,
  CardFrameFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@tailorkit/ui/components/card";
import { Badge } from "@tailorkit/ui/components/badge";
import { Button } from "@tailorkit/ui/components/button";
import { toastManager } from "@tailorkit/ui/components/toast";
import { useAppForm } from "@tailorkit/ui/form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LaptopIcon, SmartphoneIcon } from "lucide-react";
import type { ReactNode } from "react";
import { z } from "zod";

import { AccountLayout } from "#components/account-layout";
import { PageLayout } from "#components/page-layout";
import { authClient } from "#lib/auth-client";

export const Route = createFileRoute("/(app)/account/security")({
  component: SecurityPage,
});

const activeSessionsQueryKey = ["auth", "active-sessions"] as const;

function getDeviceDetails(userAgent?: string | null) {
  if (!userAgent) {
    return { browser: "Unknown browser", isMobile: false, os: "Unknown device" };
  }

  const isMobile = /Android|iPhone|iPad|iPod/iu.test(userAgent);
  let os = "Unknown device";
  let browser = "Unknown browser";

  if (/iPhone|iPad|iPod/iu.test(userAgent)) {
    os = "iOS";
  } else if (/Android/iu.test(userAgent)) {
    os = "Android";
  } else if (/Windows/iu.test(userAgent)) {
    os = "Windows";
  } else if (/Mac OS X|Macintosh/iu.test(userAgent)) {
    os = "macOS";
  } else if (/Linux/iu.test(userAgent)) {
    os = "Linux";
  }

  if (/Edg\//iu.test(userAgent)) {
    browser = "Edge";
  } else if (/Firefox\/|FxiOS\//iu.test(userAgent)) {
    browser = "Firefox";
  } else if (/Chrome\/|CriOS\//iu.test(userAgent)) {
    browser = "Chrome";
  } else if (/Safari\//iu.test(userAgent)) {
    browser = "Safari";
  }

  return { browser, isMobile, os };
}

function formatLastActive(value: Date | string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ActiveSessions() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: currentSession } = useQuery({
    enabled: typeof window !== "undefined",
    queryFn: async () => {
      const result = await authClient.getSession();
      if (result.error) {
        throw new Error(result.error.message || "Failed to load the current session");
      }
      return result.data?.session ?? null;
    },
    queryKey: ["auth", "current-session"],
  });
  const {
    data: sessions,
    error,
    isPending,
  } = useQuery({
    enabled: typeof window !== "undefined",
    queryFn: async () => {
      const result = await authClient.listSessions();
      if (result.error) {
        throw new Error(result.error.message || "Failed to load active sessions");
      }
      return result.data ?? [];
    },
    queryKey: activeSessionsQueryKey,
  });

  const revokeMutation = useMutation({
    mutationFn: async (token: string) => {
      const result = await authClient.revokeSession({ token });
      if (result.error) {
        throw new Error(result.error.message || "Failed to sign out session");
      }
    },
    onError: (mutationError) => {
      toastManager.add({
        description: mutationError.message,
        title: "Couldn't sign out session",
        type: "error",
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: activeSessionsQueryKey });
      toastManager.add({
        description: "The session has been signed out.",
        title: "Session ended",
        type: "success",
      });
    },
  });

  const sortedSessions = sessions
    ? [
        ...sessions.filter((session) => session.token === currentSession?.token),
        ...sessions.filter((session) => session.token !== currentSession?.token),
      ]
    : undefined;

  let sessionsContent: ReactNode;
  if (isPending) {
    sessionsContent = (
      <p className="px-4 py-6 text-muted-foreground text-sm">Loading active sessions...</p>
    );
  } else if (error) {
    sessionsContent = (
      <p className="px-4 py-6 text-destructive-foreground text-sm">
        Active sessions could not be loaded. Please try again.
      </p>
    );
  } else if (!sortedSessions?.length) {
    sessionsContent = (
      <p className="px-4 py-6 text-muted-foreground text-sm">No active sessions found.</p>
    );
  } else {
    sessionsContent = sortedSessions.map((session) => {
      const device = getDeviceDetails(session.userAgent);
      const isCurrent = session.token === currentSession?.token;
      const DeviceIcon = device.isMobile ? SmartphoneIcon : LaptopIcon;

      return (
        <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center" key={session.id}>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-muted">
              <DeviceIcon aria-hidden="true" className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-sm">
                  {device.os}, {device.browser}
                </p>
                {isCurrent ? <Badge variant="secondary">Current</Badge> : null}
              </div>
              <p className="mt-0.5 text-muted-foreground text-sm">
                Last active {formatLastActive(session.updatedAt)}
              </p>
            </div>
          </div>

          <Button
            className="self-start sm:self-center"
            loading={revokeMutation.isPending && revokeMutation.variables === session.token}
            onClick={() => {
              if (isCurrent) {
                navigate({ to: "/logout" });
                return;
              }
              revokeMutation.mutate(session.token);
            }}
            size="sm"
            type="button"
            variant="destructive-outline"
          >
            Sign out
          </Button>
        </div>
      );
    });
  }

  return (
    <CardFrame className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>Manage the devices currently signed in to your account.</CardDescription>
        </CardHeader>

        <CardPanel className="pt-0">
          <div className="divide-y overflow-hidden rounded-xl border">{sessionsContent}</div>
        </CardPanel>
      </Card>
    </CardFrame>
  );
}

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
      <PageLayout description="Update your password and keep your account secure." title="Security">
        <div className="flex flex-col gap-6">
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
                    {(field) => (
                      <field.SecretTextField label="New password" placeholder="••••••••" />
                    )}
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

          <ActiveSessions />
        </div>
      </PageLayout>
    </AccountLayout>
  );
}
