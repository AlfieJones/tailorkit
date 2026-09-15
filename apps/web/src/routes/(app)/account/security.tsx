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
import { toastManager } from "@tailorkit/ui/components/toast";
import { useAppForm } from "@tailorkit/ui/form";
import { LaptopIcon, KeyRoundIcon, Link2Icon, ShieldCheckIcon, SmartphoneIcon } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import type { ReactNode } from "react";
import QRCode from "qrcode";
import { z } from "zod";

import { AccountLayout } from "#components/account-layout";
import { PageLayout } from "#components/page-layout";
import { authClient } from "#lib/auth-client";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@tailorkit/ui/components/dialog";
import { OTPField, OTPFieldInput, OTPFieldSeparator } from "@tailorkit/ui/components/otp-field";

export const Route = createFileRoute("/(app)/account/security")({
  component: SecurityPage,
  validateSearch: z.object({
    error: z.string().optional(),
    error_description: z.string().optional(),
  }),
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

  const revokeOtherMutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.revokeOtherSessions();
      if (result.error) {
        throw new Error(result.error.message || "Failed to sign out other sessions");
      }
    },
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

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
    <path
      fill="currentColor"
      d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.91-2.78.62-3.37-1.21-3.37-1.21-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1.01.07 1.54 1.06 1.54 1.06.9 1.57 2.35 1.12 2.93.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.93a9.4 9.4 0 0 1 2.5.35c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9 0 1.38-.01 2.49-.01 2.83 0 .27.18.59.69.49A10.26 10.26 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"
    />
  </svg>
);

const passkeysQueryKey = ["auth", "passkeys"] as const;

function Passkeys() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const { data: passkeys, isPending } = useQuery({
    queryKey: passkeysQueryKey,
    queryFn: async () => {
      const result = await authClient.passkey.listUserPasskeys();
      if (result.error) {
        throw new Error(result.error.message || "Failed to load passkeys");
      }
      return result.data ?? [];
    },
  });

  const addPasskey = async () => {
    setError(null);
    setAdding(true);
    const result = await authClient.passkey.addPasskey({ name: "Passkey" });
    setAdding(false);
    if (result.error) {
      setError(result.error.message || "Your passkey could not be added.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: passkeysQueryKey });
    toastManager.add({
      description: "You can now use it as a primary sign-in method or to verify your identity.",
      title: "Passkey added",
      type: "success",
    });
  };

  const removePasskey = async (id: string) => {
    setError(null);
    const result = await authClient.passkey.deletePasskey({ id });
    if (result.error) {
      setError(result.error.message || "This passkey could not be removed.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: passkeysQueryKey });
  };

  return (
    <CardFrame className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRoundIcon />
            Passkeys
          </CardTitle>
          <CardDescription>
            Sign in without a password using your device, password manager, or security key.
          </CardDescription>
        </CardHeader>
        <CardPanel className="flex flex-col gap-3 pt-0">
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          {isPending ? <p className="text-muted-foreground text-sm">Loading passkeys...</p> : null}
          {!isPending && passkeys?.length === 0 ? (
            <p className="text-muted-foreground text-sm">No passkeys have been added yet.</p>
          ) : null}
          {passkeys?.map((passkey) => (
            <div className="flex items-center gap-3 rounded-xl border p-4" key={passkey.id}>
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-muted">
                <KeyRoundIcon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">{passkey.name || "Passkey"}</p>
                <p className="text-muted-foreground text-sm">
                  Added {formatLastActive(passkey.createdAt)}
                </p>
              </div>
              <Button
                onClick={() => void removePasskey(passkey.id)}
                size="sm"
                variant="destructive-outline"
              >
                Remove
              </Button>
            </div>
          ))}
        </CardPanel>
      </Card>
      <CardFrameFooter className="flex justify-end">
        <Button
          loading={adding}
          onClick={() => void addPasskey()}
          size="sm"
          type="button"
          variant="outline"
        >
          Add passkey
        </Button>
      </CardFrameFooter>
    </CardFrame>
  );
}

function TwoFactorAuthentication() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [totpURI, setTotpURI] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { data: session } = useQuery({
    queryKey: ["auth", "current-session"],
    queryFn: async () => {
      const result = await authClient.getSession();
      if (result.error) {
        throw new Error(result.error.message || "Failed to load your security settings");
      }
      return result.data;
    },
  });
  const enabled = Boolean(session?.user?.twoFactorEnabled);

  useEffect(() => {
    if (!totpURI) {
      setQrCode(null);
      return;
    }
    void QRCode.toDataURL(totpURI, { margin: 1, width: 240 }).then(setQrCode);
  }, [totpURI]);

  const resetSetup = () => {
    setCode("");
    setError(null);
    setPassword("");
    setTotpURI(null);
    setBackupCodes([]);
  };

  const enable = async () => {
    setError(null);
    setPending(true);
    const result = await authClient.twoFactor.enable({
      method: "totp",
      password: password || undefined,
    });
    setPending(false);
    if (result.error) {
      setError(result.error.message || "Two-factor authentication could not be started.");
      return;
    }
    if (result.data.method !== "totp") {
      setError("Authenticator-app setup could not be started.");
      return;
    }
    setTotpURI(result.data.totpURI);
    setBackupCodes(result.data.backupCodes);
  };

  const confirm = async () => {
    setError(null);
    setPending(true);
    const result = await authClient.twoFactor.verifyTotp({ code });
    setPending(false);
    if (result.error) {
      setError(result.error.message || "That authenticator code could not be verified.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["auth", "current-session"] });
  };

  const disable = async () => {
    setError(null);
    setPending(true);
    const result = await authClient.twoFactor.disable({ password: password || undefined });
    setPending(false);
    if (result.error) {
      setError(result.error.message || "Two-factor authentication could not be disabled.");
      return;
    }
    setOpen(false);
    resetSetup();
    await queryClient.invalidateQueries({ queryKey: ["auth", "current-session"] });
  };

  let dialogDescription =
    "Enter your password to protect this security change. Passwordless accounts can leave it blank.";
  if (enabled) {
    dialogDescription = "Enter your password to turn off authenticator-app verification.";
  } else if (totpURI) {
    dialogDescription =
      "Scan this code, then enter the six-digit code from your authenticator app.";
  }

  let dialogContent: ReactNode = (
    <input
      autoComplete="current-password"
      className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/24"
      onChange={(event) => setPassword(event.target.value)}
      placeholder="Current password"
      type="password"
      value={password}
    />
  );
  if (totpURI) {
    dialogContent = (
      <>
        {qrCode ? (
          <img
            alt="Authenticator app setup QR code"
            className="mx-auto size-52 rounded-lg border bg-white p-2"
            src={qrCode}
          />
        ) : null}
        <OTPField
          aria-label="Authenticator code"
          autoComplete="one-time-code"
          length={6}
          onValueChange={setCode}
          value={code}
        >
          {Array.from({ length: 6 }, (_, index) => (
            <Fragment key={`digit-${index}`}>
              <OTPFieldInput aria-label={`Digit ${index + 1} of 6`} />
              {index === 2 ? <OTPFieldSeparator /> : null}
            </Fragment>
          ))}
        </OTPField>
      </>
    );
  }
  if (backupCodes.length > 0 && enabled) {
    dialogContent = (
      <>
        <p className="font-medium text-sm">Save these recovery codes somewhere safe.</p>
        <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/40 p-3 font-mono text-sm">
          {backupCodes.map((backupCode) => (
            <span key={backupCode}>{backupCode}</span>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">
          Each code works once. You won’t see them again.
        </p>
      </>
    );
  }

  let dialogAction: ReactNode = (
    <Button loading={pending} onClick={() => void enable()}>
      Continue
    </Button>
  );
  if (enabled) {
    dialogAction = (
      <Button loading={pending} onClick={() => void disable()} variant="destructive">
        Disable 2FA
      </Button>
    );
  }
  if (totpURI) {
    dialogAction = (
      <Button disabled={code.length !== 6} loading={pending} onClick={() => void confirm()}>
        Verify and enable
      </Button>
    );
  }
  if (backupCodes.length > 0 && enabled) {
    dialogAction = <Button onClick={() => setOpen(false)}>Done</Button>;
  }

  return (
    <>
      <CardFrame className="w-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheckIcon />
              Authenticator app
            </CardTitle>
            <CardDescription>
              {enabled
                ? "Your account requires a second verification step when signing in with a password."
                : "Add a time-based code from an authenticator app as an extra sign-in check."}
            </CardDescription>
          </CardHeader>
          <CardPanel className="pt-0">
            <p className="text-muted-foreground text-sm">
              {enabled
                ? "Passkeys and recovery codes can also be used from the verification screen."
                : "You’ll scan a QR code and save recovery codes during setup."}
            </p>
          </CardPanel>
        </Card>
        <CardFrameFooter className="flex justify-end">
          <Button
            onClick={() => setOpen(true)}
            size="sm"
            type="button"
            variant={enabled ? "outline" : "default"}
          >
            {enabled ? "Manage" : "Set up authenticator app"}
          </Button>
        </CardFrameFooter>
      </CardFrame>

      <Dialog
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            resetSetup();
          }
        }}
        open={open}
      >
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>
              {enabled ? "Manage authenticator app" : "Set up authenticator app"}
            </DialogTitle>
            <p className="text-muted-foreground text-sm">{dialogDescription}</p>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-6 pb-6">
            {error ? <p className="text-destructive text-sm">{error}</p> : null}
            {dialogContent}
          </div>
          <DialogFooter>{dialogAction}</DialogFooter>
        </DialogPopup>
      </Dialog>
    </>
  );
}

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

          <Passkeys />

          <TwoFactorAuthentication />

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
                      loading={linkPending || accountsQuery.isPending}
                      onClick={() => void linkGitHub()}
                      size="sm"
                      variant="outline"
                    >
                      Link
                    </Button>
                  )}
                </div>
              </CardPanel>
            </Card>
          </CardFrame>

          <ActiveSessions />
        </div>
      </PageLayout>
    </AccountLayout>
  );
}
