"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@tailorkit/ui/components/button";
import {
  Card,
  CardFrame,
  CardFrameFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@tailorkit/ui/components/card";
import { Logo } from "@tailorkit/ui/components/logo";
import { useState } from "react";

import { authClient } from "#lib/auth-client";
import { getSameOriginPath } from "#lib/safe-return-url";

export const Route = createFileRoute("/(auth)/two-factor")({
  component: TwoFactorPage,
});

function TwoFactorPage() {
  const [code, setCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const verify = async () => {
    setError(null);
    setIsPending(true);
    try {
      const result = useBackupCode
        ? await authClient.twoFactor.verifyBackupCode({ code })
        : await authClient.twoFactor.verifyTotp({ code });

      if (result.error) {
        setError(
          result.error.message ||
            (useBackupCode
              ? "That backup code is not valid."
              : "That verification code is not valid."),
        );
        return;
      }

      const returnPath = getSameOriginPath(
        window.sessionStorage.getItem("tailorkit.two-factor-return-to") ?? undefined,
        window.location.origin,
      );
      window.sessionStorage.removeItem("tailorkit.two-factor-return-to");
      window.location.assign(returnPath ?? "/");
    } catch {
      setError(
        useBackupCode
          ? "Unable to verify that backup code. Please try again."
          : "Unable to verify that authentication code. Please try again.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-4">
        <a className="flex items-center gap-2" href="https://tailorkit.dev/home">
          <Logo className="size-6" />
          <span className="font-semibold text-lg">TailorKit</span>
        </a>
        <CardFrame className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Verify it’s you</CardTitle>
            </CardHeader>
            <CardPanel className="flex flex-col gap-4">
              <p className="text-muted-foreground text-sm">
                {useBackupCode
                  ? "Enter one of the backup codes you saved when you enabled two-factor authentication."
                  : "Enter the current code from your authenticator app."}
              </p>
              <label className="flex flex-col gap-1.5 font-medium text-sm">
                {useBackupCode ? "Backup code" : "Authentication code"}
                <input
                  autoComplete="one-time-code"
                  autoFocus
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  inputMode={useBackupCode ? "text" : "numeric"}
                  onChange={(event) =>
                    setCode(
                      useBackupCode
                        ? event.target.value
                        : event.target.value.replaceAll(/\D/gu, ""),
                    )
                  }
                  placeholder={useBackupCode ? "Enter backup code" : "123456"}
                  value={code}
                />
              </label>
              {error ? (
                <p className="text-destructive text-sm" role="alert">
                  {error}
                </p>
              ) : null}
              <Button
                disabled={!code || (!useBackupCode && code.length !== 6)}
                loading={isPending}
                onClick={() => void verify()}
                type="button"
              >
                Verify
              </Button>
              <button
                className="w-fit text-muted-foreground text-sm hover:text-foreground hover:underline"
                onClick={() => {
                  setCode("");
                  setError(null);
                  setUseBackupCode((current) => !current);
                }}
                type="button"
              >
                {useBackupCode ? "Use an authenticator code" : "Use a backup code"}
              </button>
            </CardPanel>
          </Card>
          <CardFrameFooter>
            <Link
              className="text-muted-foreground text-sm hover:underline"
              search={{
                email: undefined,
                error: undefined,
                error_description: undefined,
                return_to: undefined,
              }}
              to="/login"
            >
              Back to sign in
            </Link>
          </CardFrameFooter>
        </CardFrame>
      </div>
    </div>
  );
}
