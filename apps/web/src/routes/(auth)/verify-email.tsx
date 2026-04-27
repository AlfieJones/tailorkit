"use client";

import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@tailorkit/ui/components/button";
import {
  Card,
  CardFrame,
  CardFrameDescription,
  CardFrameFooter,
  CardFrameHeader,
  CardFrameTitle,
  CardPanel,
} from "@tailorkit/ui/components/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@tailorkit/ui/components/field";
import { OTPField, OTPFieldInput } from "@tailorkit/ui/components/otp-field";
import { toastManager } from "@tailorkit/ui/components/toast";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/(auth)/verify-email")({
  component: RouteComponent,
  validateSearch: (search) => ({
    email: search.email as string,
  }),
});

const OTP_LENGTH = 6;
const SLOT_KEYS = Array.from({ length: OTP_LENGTH }, (_, i) => `slot-${i}`);

function RouteComponent() {
  const { email } = useSearch({ from: "/(auth)/verify-email" });
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startResendTimer = useCallback(() => {
    setResendCountdown(60);
    timerRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const sendOtp = useCallback(async () => {
    setSending(true);
    const result = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });
    setSending(false);
    if (result.error) {
      toastManager.add({
        description: result.error.message || "Failed to send code",
        title: "Error",
        type: "error",
      });
      return;
    }
    startResendTimer();
  }, [email, startResendTimer]);

  useEffect(() => {
    if (email) {
      sendOtp();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [email, sendOtp]);

  const verifyOtp = async (code: string) => {
    setVerifying(true);
    setInvalid(false);
    const result = await authClient.emailOtp.verifyEmail({ email, otp: code });
    setVerifying(false);
    if (result.error) {
      setInvalid(true);
      toastManager.add({
        description: result.error.message || "Invalid or expired code",
        title: "Verification failed",
        type: "error",
      });
      setOtp("");
      return;
    }
    toastManager.add({
      description: "Your email has been verified.",
      title: "Email verified",
      type: "success",
    });
    navigate({ to: "/" });
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setInvalid(false);
    if (value.length === OTP_LENGTH) {
      verifyOtp(value);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <CardFrame className="w-full max-w-sm">
        <CardFrameHeader>
          <CardFrameTitle>Verify your email</CardFrameTitle>
          <CardFrameDescription>
            {email
              ? `We sent a 6-digit code to ${email}`
              : "Enter the 6-digit code sent to your email"}
          </CardFrameDescription>
        </CardFrameHeader>
        <Card>
          <CardPanel>
            <div className="flex flex-col items-center gap-6">
              <Field className="items-center">
                <FieldLabel>Verification code</FieldLabel>
                <OTPField
                  length={OTP_LENGTH}
                  value={otp}
                  onValueChange={handleOtpChange}
                  disabled={verifying}
                  size="lg"
                >
                  {SLOT_KEYS.map((key, index) => (
                    <OTPFieldInput
                      key={key}
                      aria-invalid={invalid || undefined}
                      aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                    />
                  ))}
                </OTPField>
                {invalid && <FieldError>Invalid or expired code. Please try again.</FieldError>}
                {verifying && <FieldDescription>Verifying…</FieldDescription>}
              </Field>

              <div className="flex flex-col items-center gap-2">
                <p className="text-muted-foreground text-sm">Didn't receive a code?</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={sendOtp}
                  disabled={sending || resendCountdown > 0}
                  loading={sending}
                >
                  {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend code"}
                </Button>
              </div>
            </div>
          </CardPanel>
        </Card>
        <CardFrameFooter>
          <p className="text-muted-foreground text-sm">
            <Link to="/login" className="text-foreground hover:underline underline-offset-4">
              Back to sign in
            </Link>
          </p>
        </CardFrameFooter>
      </CardFrame>
    </div>
  );
}
