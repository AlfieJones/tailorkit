"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Badge } from "@tailorkit/ui/components/badge";
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
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@tailorkit/ui/components/dialog";
import { Field, FieldLabel } from "@tailorkit/ui/components/field";
import { Input } from "@tailorkit/ui/components/input";
import { Skeleton } from "@tailorkit/ui/components/skeleton";
import { toastManager } from "@tailorkit/ui/components/toast";
import { useAppForm } from "@tailorkit/ui/form";
import { LaptopIcon, SmartphoneIcon } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { z } from "zod";

import { AccountLayout } from "#components/account-layout";
import { PageLayout } from "#components/page-layout";
import { client } from "#lib/orpc";
import {
  getTotpSecret,
  TwoFactorSetupDialog as TwoFactorSetupDialogScreen,
} from "./two-factor-dialog";

export const Route = createFileRoute("/(app)/account/security/")({
  component: SecurityPage,
  validateSearch: z.object({
    error: z.string().optional(),
    error_description: z.string().optional(),
  }),
});

const activeSessionsQueryKey = ["auth", "active-sessions"] as const;
function TwoFactorStatus({
  isLoading,
  sessionError,
}: {
  isLoading: boolean;
  sessionError: Error | null;
}) {
  if (isLoading) {
    return null;
  }

  if (sessionError) {
    return (
      <p className="text-destructive text-sm" role="alert">
        Security settings could not be loaded. Please refresh and try again.
      </p>
    );
  }

  return null;
}

function TwoFactorAuthentication({
  hasCredentialAccount,
  isLoading,
  sessionUser,
  sessionError,
}: {
  hasCredentialAccount: boolean;
  isLoading: boolean;
  sessionUser: { email?: string | null; twoFactorEnabled?: boolean | null } | null | undefined;
  sessionError: Error | null;
}) {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [totpURI, setTotpURI] = useState<string | null>(null);
  const [pendingBackupCodes, setPendingBackupCodes] = useState<string[]>([]);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [backupCodesSaved, setBackupCodesSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [regeneratePassword, setRegeneratePassword] = useState("");
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [enabling, setEnabling] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const isEnabled = sessionUser?.twoFactorEnabled === true;
  const isReady = !isLoading && !sessionError;
  let description: ReactNode =
    "Use an authenticator app to add a second step whenever you sign in.";

  if (isLoading) {
    description = <Skeleton aria-hidden="true" className="h-10 w-full max-w-[30rem] sm:h-5" />;
  } else if (isEnabled) {
    description = "Your account is protected with an authenticator app.";
  }

  const enable = async () => {
    setError(null);
    setEnabling(true);
    try {
      const result = await client.user.enableTwoFactor({ method: "totp", password });
      setEnabling(false);
      if (result.method !== "totp") {
        setError("Unable to start authenticator setup. Please try again.");
        return;
      }

      setPendingBackupCodes(result.backupCodes ?? []);
      setTotpURI(result.totpURI ?? null);
      setPassword("");
    } catch (requestError) {
      setEnabling(false);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to start authenticator setup. Please try again.",
      );
    }
  };

  const verify = async () => {
    setError(null);
    setVerifying(true);
    try {
      await client.user.verifyTotp({ code });
      setVerifying(false);
    } catch (requestError) {
      setVerifying(false);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "That code is not valid. Try the current code from your app.",
      );
      return;
    }

    setCode("");
    setTotpURI(null);
    setBackupCodes(pendingBackupCodes);
    setBackupCodesSaved(false);
    setVerificationStep(false);
    setPendingBackupCodes([]);
    toastManager.add({
      description: "Authenticator-app verification is now required whenever you sign in.",
      title: "Two-factor authentication enabled",
      type: "success",
    });
    await queryClient.invalidateQueries({ queryKey: ["auth", "current-user"] });
  };

  const disable = async () => {
    setError(null);
    setDisabling(true);
    try {
      await client.user.disableTwoFactor({ password });
      setDisabling(false);
    } catch (requestError) {
      setDisabling(false);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to disable two-factor authentication.",
      );
      return;
    }

    setPassword("");
    toastManager.add({
      description: "Authenticator-app verification is no longer required.",
      title: "Two-factor authentication disabled",
      type: "success",
    });
    await queryClient.invalidateQueries({ queryKey: ["auth", "current-user"] });
    setDisableOpen(false);
  };

  const resetSetup = () => {
    setPassword("");
    setCode("");
    setTotpURI(null);
    setPendingBackupCodes([]);
    setBackupCodes([]);
    setBackupCodesSaved(false);
    setError(null);
  };

  const handleSetupOpenChange = (open: boolean) => {
    if (!open && backupCodes.length > 0 && !backupCodesSaved) {
      return;
    }

    setSetupOpen(open);
    if (!open) {
      resetSetup();
    }
  };

  const handleDisableOpenChange = (open: boolean) => {
    setDisableOpen(open);
    if (!open) {
      setPassword("");
      setError(null);
    }
  };

  const handleRegenerateOpenChange = (open: boolean) => {
    setRegenerateOpen(open);
    if (!open) {
      setRegeneratePassword("");
      setRegenerateError(null);
    }
  };

  const copyTotpSecret = async () => {
    if (!totpURI) {
      return;
    }

    try {
      await navigator.clipboard.writeText(getTotpSecret(totpURI));
      toastManager.add({ title: "Setup key copied", type: "success" });
    } catch {
      setError("Unable to copy the setup key. Please try again.");
    }
  };

  const copyBackupCodes = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      toastManager.add({ title: "Recovery codes copied", type: "success" });
    } catch {
      setError("Unable to copy the recovery codes. Please try again.");
    }
  };

  const downloadBackupCodes = () => {
    const downloadURL = URL.createObjectURL(
      new Blob([backupCodes.join("\n")], { type: "text/plain" }),
    );
    const link = document.createElement("a");
    link.download = "recovery-codes.txt";
    link.href = downloadURL;
    link.click();
    URL.revokeObjectURL(downloadURL);
    toastManager.add({ title: "Recovery codes downloaded", type: "success" });
  };

  const regenerateBackupCodes = async () => {
    setRegenerateError(null);
    setRegenerating(true);
    try {
      const result = await client.user.generateBackupCodes({ password: regeneratePassword });
      setRegenerating(false);
      setBackupCodes(result.backupCodes);
    } catch (requestError) {
      setRegenerating(false);
      setRegenerateError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to regenerate recovery codes.",
      );
      return;
    }
    setBackupCodesSaved(false);
    setRegenerateOpen(false);
    setSetupOpen(true);
    toastManager.add({
      description: "Your previous recovery codes no longer work.",
      title: "Recovery codes regenerated",
      type: "success",
    });
  };

  return (
    <CardFrame className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Two-factor authentication</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardPanel className="flex max-w-lg flex-col gap-4">
          <TwoFactorStatus isLoading={isLoading} sessionError={sessionError} />

          {isReady && !hasCredentialAccount && (
            <>
              <p className="text-muted-foreground text-sm">
                Create a password before enabling two-factor authentication. This ensures your
                authenticator is an additional factor, not the only credential protecting this
                account.
              </p>
              <Button
                className="w-fit"
                onClick={() => {
                  window.location.assign(
                    `/forgot-password?email=${encodeURIComponent(sessionUser?.email ?? "")}&return_to=/account/security`,
                  );
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                Create a password
              </Button>
            </>
          )}
        </CardPanel>
      </Card>

      {isLoading ? (
        <CardFrameFooter className="flex justify-end">
          <Skeleton className="h-7 w-24" />
        </CardFrameFooter>
      ) : null}

      {isReady && hasCredentialAccount && (
        <CardFrameFooter className="flex flex-wrap justify-end gap-2">
          {isEnabled ? (
            <>
              <Button
                onClick={() => setRegenerateOpen(true)}
                size="sm"
                type="button"
                variant="outline"
              >
                Regenerate recovery codes
              </Button>
              <Button
                onClick={() => setDisableOpen(true)}
                size="sm"
                type="button"
                variant="destructive-outline"
              >
                Disable two-factor authentication
              </Button>
            </>
          ) : (
            <Button onClick={() => setSetupOpen(true)} size="sm" type="button">
              Enable 2FA
            </Button>
          )}
        </CardFrameFooter>
      )}

      <TwoFactorSetupDialogScreen
        backupCodes={backupCodes}
        backupCodesSaved={backupCodesSaved}
        code={code}
        enabling={enabling}
        error={error}
        onBackupCodesSavedChange={setBackupCodesSaved}
        onBackToQr={() => setVerificationStep(false)}
        onCopyBackupCodes={copyBackupCodes}
        onCopyTotpSecret={copyTotpSecret}
        onDownloadBackupCodes={downloadBackupCodes}
        onEnable={enable}
        onOpenChange={handleSetupOpenChange}
        onPasswordChange={setPassword}
        onVerify={verify}
        open={setupOpen}
        password={password}
        setCode={setCode}
        showVerificationStep={verificationStep}
        onContinueToVerification={() => setVerificationStep(true)}
        totpURI={totpURI}
        verifying={verifying}
      />

      <DisableTwoFactorDialog
        disabling={disabling}
        error={error}
        onDisable={disable}
        onOpenChange={handleDisableOpenChange}
        onPasswordChange={setPassword}
        open={disableOpen}
        password={password}
      />

      <RegenerateBackupCodesDialog
        error={regenerateError}
        loading={regenerating}
        onOpenChange={handleRegenerateOpenChange}
        onPasswordChange={setRegeneratePassword}
        onRegenerate={regenerateBackupCodes}
        open={regenerateOpen}
        password={regeneratePassword}
      />
    </CardFrame>
  );
}

function RegenerateBackupCodesDialog({
  error,
  loading,
  onOpenChange,
  onPasswordChange,
  onRegenerate,
  open,
  password,
}: {
  error: string | null;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onPasswordChange: (password: string) => void;
  onRegenerate: () => Promise<void>;
  open: boolean;
  password: string;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="max-w-md">
        <DialogHeader>
          <DialogTitle>Regenerate recovery codes</DialogTitle>
          <DialogDescription>
            Your current recovery codes will stop working. Enter your password to generate a new
            set.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input
              autoComplete="current-password"
              onChange={(event) => onPasswordChange(event.target.value)}
              type="password"
              value={password}
            />
          </Field>
          {error ? (
            <p className="mt-3 text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button size="sm" type="button" variant="ghost" />}>
            Cancel
          </DialogClose>
          <Button
            disabled={!password}
            loading={loading}
            onClick={() => void onRegenerate()}
            size="sm"
            type="button"
          >
            Regenerate codes
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

function DisableTwoFactorDialog({
  disabling,
  error,
  onDisable,
  onOpenChange,
  onPasswordChange,
  open,
  password,
}: {
  disabling: boolean;
  error: string | null;
  onDisable: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
  onPasswordChange: (password: string) => void;
  open: boolean;
  password: string;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="max-w-md">
        <DialogHeader>
          <DialogTitle>Disable two-factor authentication</DialogTitle>
          <DialogDescription>
            Enter your password to remove authenticator-app protection.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input
              autoComplete="current-password"
              onChange={(event) => onPasswordChange(event.target.value)}
              type="password"
              value={password}
            />
          </Field>
          {error ? (
            <p className="mt-3 text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button size="sm" type="button" variant="ghost" />}>
            Cancel
          </DialogClose>
          <Button
            disabled={!password}
            loading={disabling}
            onClick={() => void onDisable()}
            size="sm"
            type="button"
            variant="destructive-outline"
          >
            Disable 2FA
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

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
      const result = await client.user.getSession();
      return result.session ?? null;
    },
    queryKey: ["auth", "current-session"],
  });
  const {
    data: sessions,
    error,
    isPending,
  } = useQuery({
    enabled: typeof window !== "undefined",
    queryFn: () => client.user.listSessions(),
    queryKey: activeSessionsQueryKey,
  });

  const revokeMutation = useMutation({
    mutationFn: (token: string) => client.user.revokeSession({ token }),
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

  const revokeOtherMutation = useMutation({
    mutationFn: () => client.user.revokeOtherSessions(),
    onError: (mutationError) => {
      toastManager.add({
        description: mutationError.message,
        title: "Couldn't sign out other sessions",
        type: "error",
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: activeSessionsQueryKey });
      toastManager.add({
        description: "All other devices have been signed out.",
        title: "Other sessions ended",
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
    sessionsContent = <ActiveSessionsSkeleton />;
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
          <CardTitle className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>Active sessions</span>
            <Button
              disabled={!sortedSessions?.some((session) => session.token !== currentSession?.token)}
              loading={revokeOtherMutation.isPending}
              onClick={() => revokeOtherMutation.mutate()}
              size="sm"
              type="button"
              variant="destructive-outline"
            >
              Sign out all other sessions
            </Button>
          </CardTitle>
          <CardDescription>Manage the devices currently signed in to your account.</CardDescription>
        </CardHeader>

        <CardPanel className="pt-0">
          <div className="divide-y overflow-hidden rounded-xl border">{sessionsContent}</div>
        </CardPanel>
      </Card>
    </CardFrame>
  );
}

function ActiveSessionsSkeleton() {
  return Array.from({ length: 3 }, (_, index) => (
    <div
      className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center"
      key={`session-skeleton-${index}`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>
      <Skeleton className="h-7 w-16 self-start sm:self-center" />
    </div>
  ));
}

function LinkedAccountsSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <GitHubIcon />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm">GitHub</p>
        <Skeleton className="mt-1 h-4 w-28" />
      </div>
      <Skeleton className="h-7 w-12" />
    </div>
  );
}

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
    <path
      fill="currentColor"
      d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.91-2.78.62-3.37-1.21-3.37-1.21-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1.01.07 1.54 1.06 1.54 1.06.9 1.57 2.35 1.12 2.93.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.93a9.4 9.4 0 0 1 2.5.35c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9 0 1.38-.01 2.49-.01 2.83 0 .27.18.59.69.49A10.26 10.26 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"
    />
  </svg>
);

function SecurityPage() {
  const { error, error_description } = useSearch({ from: "/(app)/account/security/" });
  const queryClient = useQueryClient();
  const [linkPending, setLinkPending] = useState(false);
  const [unlinkPending, setUnlinkPending] = useState(false);
  const accountsQuery = useQuery({
    queryKey: ["auth", "accounts"],
    queryFn: () => client.user.listAccounts(),
  });
  const sessionQuery = useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: async () => {
      const result = await client.user.getSession();
      return result.user ?? null;
    },
  });
  const githubAccount = accountsQuery.data?.find((account) => account.providerId === "github");
  const hasCredentialAccount = accountsQuery.data?.some(
    (account) => account.providerId === "credential",
  );
  const canUnlinkGitHub = Boolean(githubAccount && (accountsQuery.data?.length ?? 0) > 1);

  const linkGitHub = async () => {
    setLinkPending(true);
    try {
      const result = await client.user.linkSocial({
        callbackURL: "/account/security",
        errorCallbackURL: "/account/security",
        provider: "github",
      });
      if (result.url) {
        window.location.assign(result.url);
      }
    } catch (requestError) {
      setLinkPending(false);
      toastManager.add({
        description: requestError instanceof Error ? requestError.message : "Failed to link GitHub",
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
    try {
      await client.user.unlinkAccount({ accountId: githubAccount.id });
      setUnlinkPending(false);
    } catch (requestError) {
      setUnlinkPending(false);
      toastManager.add({
        description:
          requestError instanceof Error ? requestError.message : "Failed to unlink GitHub",
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
      try {
        await client.user.changePassword({
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
          revokeOtherSessions: true,
        });
      } catch (requestError) {
        toastManager.add({
          description:
            requestError instanceof Error ? requestError.message : "Failed to update password",
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
          <TwoFactorAuthentication
            hasCredentialAccount={hasCredentialAccount === true}
            isLoading={accountsQuery.isPending || sessionQuery.isPending}
            sessionError={accountsQuery.error ?? sessionQuery.error ?? null}
            sessionUser={sessionQuery.data}
          />

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

          <CardFrame className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Linked accounts</CardTitle>
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

                {accountsQuery.isPending ? (
                  <LinkedAccountsSkeleton />
                ) : (
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
                        disabled={!canUnlinkGitHub}
                        loading={unlinkPending}
                        onClick={() => void unlinkGitHub()}
                        size="sm"
                        title={
                          canUnlinkGitHub
                            ? "Unlink GitHub"
                            : "GitHub cannot be unlinked because it is your only sign-in method"
                        }
                        variant="destructive-outline"
                      >
                        Unlink
                      </Button>
                    ) : (
                      <Button
                        loading={linkPending}
                        onClick={() => void linkGitHub()}
                        size="sm"
                        variant="outline"
                      >
                        Link
                      </Button>
                    )}
                  </div>
                )}
              </CardPanel>
            </Card>
          </CardFrame>

          <ActiveSessions />
        </div>
      </PageLayout>
    </AccountLayout>
  );
}
