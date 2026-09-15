"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@tailorkit/ui/components/button";
import {
  Card,
  CardFooter,
  CardFrame,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@tailorkit/ui/components/card";
import { Logo } from "@tailorkit/ui/components/logo";
import { OTPField, OTPFieldInput, OTPFieldSeparator } from "@tailorkit/ui/components/otp-field";
import { KeyRoundIcon } from "lucide-react";
import { Fragment, useState } from "react";

import { authClient } from "#lib/auth-client";

export const Route = createFileRoute("/(auth)/two-factor")({
  component: TwoFactorPage,
});

function getStoredReturnTo() {
  const returnTo = window.sessionStorage.getItem("tailorkit:return_to");
  window.sessionStorage.removeItem("tailorkit:return_to");
  window.sessionStorage.removeItem("tailorkit:two_factor_email");
  return returnTo || "/";
}

function TwoFactorPage() {
  const [code, setCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [passkeyPending, setPasskeyPending] = useState(false);

  const complete = () => {
    window.location.assign(getStoredReturnTo());
  };

  const verify = async () => {
    if (code.length !== (recoveryCode ? 10 : 6)) {
      setError(recoveryCode ? "Enter your 10-character recovery code." : "Enter the 6-digit code.");
      return;
    }

    setError(null);
    setPending(true);
    const result = recoveryCode
      ? await authClient.twoFactor.verifyBackupCode({ code })
      : await authClient.twoFactor.verifyTotp({ code });
    setPending(false);

    if (result.error) {
      setError(result.error.message || "That code could not be verified. Try again.");
      return;
    }

    complete();
  };

  const continueWithPasskey = async () => {
    setError(null);
    setPasskeyPending(true);
    const result = await authClient.signIn.passkey();
    setPasskeyPending(false);

    if (result.error) {
      if ("code" in result.error && result.error.code === "AUTH_CANCELLED") {
        setError("No passkey was selected. Enter your authenticator or recovery code instead.");
      } else {
        setError(result.error.message || "Passkey verification failed. Try another method.");
      }
      return;
    }

    const expectedEmail = window.sessionStorage.getItem("tailorkit:two_factor_email");
    if (expectedEmail && result.data.user.email !== expectedEmail) {
      await authClient.signOut();
      setError(
        "This passkey belongs to a different account. Use a passkey for this account instead.",
      );
      return;
    }

    complete();
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
              <CardTitle>Verify your identity</CardTitle>
              <p className="text-muted-foreground text-sm">
                {recoveryCode
                  ? "Enter one of your unused recovery codes."
                  : "Enter the code from your authenticator app or continue with a passkey."}
              </p>
            </CardHeader>
            <CardPanel className="flex flex-col gap-5">
              {error ? (
                <p className="text-destructive text-sm" role="alert">
                  {error}
                </p>
              ) : null}

              {recoveryCode ? (
                <input
                  aria-label="Recovery code"
                  autoComplete="one-time-code"
                  className="h-11 w-full rounded-lg border bg-background px-3 font-mono text-center text-base uppercase outline-none focus-visible:ring-3 focus-visible:ring-ring/24"
                  maxLength={10}
                  onChange={(event) =>
                    setCode(event.target.value.replaceAll(/[^a-zA-Z0-9]/gu, "").toUpperCase())
                  }
                  value={code}
                />
              ) : (
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
              )}

              <Button
                className="w-full"
                disabled={!code}
                loading={pending}
                onClick={() => void verify()}
              >
                Verify
              </Button>
              <Button
                className="w-full"
                loading={passkeyPending}
                onClick={() => void continueWithPasskey()}
                type="button"
                variant="outline"
              >
                <KeyRoundIcon />
                Continue with passkey
              </Button>
            </CardPanel>
            <CardFooter className="flex justify-center pt-2">
              <button
                className="text-muted-foreground text-sm hover:text-foreground hover:underline"
                onClick={() => {
                  setCode("");
                  setError(null);
                  setRecoveryCode((current) => !current);
                }}
                type="button"
              >
                {recoveryCode ? "Use an authenticator code instead" : "Use a recovery code instead"}
              </button>
            </CardFooter>
          </Card>
          <CardFooter className="justify-center">
            <Link
              className="text-muted-foreground text-sm hover:text-foreground hover:underline"
              search={{ return_to: undefined }}
              to="/login"
            >
              Return to sign in
            </Link>
          </CardFooter>
        </CardFrame>
      </div>
    </div>
  );
}
