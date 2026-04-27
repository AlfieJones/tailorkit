"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@tailorkit/ui/components/button";
import {
  Card,
  CardFrame,
  CardFrameDescription,
  CardFrameHeader,
  CardFrameTitle,
  CardPanel,
} from "@tailorkit/ui/components/card";
import { Field, FieldError, FieldLabel } from "@tailorkit/ui/components/field";
import { Form } from "@tailorkit/ui/components/form";
import { Input } from "@tailorkit/ui/components/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@tailorkit/ui/components/input-group";
import { OTPField, OTPFieldInput } from "@tailorkit/ui/components/otp-field";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@tailorkit/ui/components/tooltip";
import { toastManager } from "@tailorkit/ui/components/toast";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/(auth)/forgot-password")({
  component: RouteComponent,
});

const OTP_LENGTH = 6;
const SLOT_KEYS = Array.from({ length: OTP_LENGTH }, (_, i) => `slot-${i}`);

type Step = "email" | "reset";

function RouteComponent() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpInvalid, setOtpInvalid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resending, setResending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startResendTimer = () => {
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
  };

  const sendOtp = async (targetEmail: string) => {
    const result = await authClient.emailOtp.sendVerificationOtp({
      email: targetEmail,
      type: "forget-password",
    });
    if (result.error) {
      toastManager.add({
        description: result.error.message || "Failed to send code",
        title: "Error",
        type: "error",
      });
      return false;
    }
    startResendTimer();
    return true;
  };

  const emailForm = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      const sent = await sendOtp(value.email);
      if (sent) {
        setEmail(value.email);
        setStep("reset");
      }
    },
    validators: {
      onSubmit: z.object({ email: z.email("Invalid email address") }),
    },
  });

  const resetForm = useForm({
    defaultValues: { confirmPassword: "", password: "" },
    onSubmit: async ({ value }) => {
      if (!otp || otp.length < OTP_LENGTH) {
        setOtpInvalid(true);
        return;
      }
      const result = await authClient.emailOtp.resetPassword({
        email,
        otp,
        password: value.password,
      });
      if (result.error) {
        if (result.error.code === "INVALID_OTP" || result.error.code === "OTP_EXPIRED") {
          setOtpInvalid(true);
          setOtp("");
        }
        toastManager.add({
          description: result.error.message || "Failed to reset password",
          title: "Reset failed",
          type: "error",
        });
        return;
      }
      toastManager.add({
        description: "Your password has been updated. Please sign in.",
        title: "Password reset",
        type: "success",
      });
      navigate({ to: "/login" });
    },
    validators: {
      onSubmit: z
        .object({
          confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
          password: z.string().min(8, "Password must be at least 8 characters"),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords do not match",
          path: ["confirmPassword"],
        }),
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <CardFrame className="w-full max-w-sm">
        <CardFrameHeader>
          <CardFrameTitle>
            {step === "email" ? "Forgot password?" : "Reset password"}
          </CardFrameTitle>
          <CardFrameDescription>
            {step === "email"
              ? "Enter your email and we'll send you a code"
              : `Enter the code sent to ${email} and choose a new password`}
          </CardFrameDescription>
        </CardFrameHeader>
        <Card>
          <CardPanel>
            {step === "email" ? (
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  emailForm.handleSubmit();
                }}
                className="flex w-full flex-col gap-4"
              >
                <emailForm.Field name="email">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        placeholder="you@example.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={field.state.meta.errors.length > 0 || undefined}
                      />
                      {field.state.meta.errors.map((error) => (
                        <FieldError key={error?.message}>{error?.message}</FieldError>
                      ))}
                    </Field>
                  )}
                </emailForm.Field>

                <emailForm.Subscribe
                  selector={(state) => ({
                    canSubmit: state.canSubmit,
                    isSubmitting: state.isSubmitting,
                  })}
                >
                  {({ canSubmit, isSubmitting }) => (
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!canSubmit || isSubmitting}
                      loading={isSubmitting}
                    >
                      Send code
                    </Button>
                  )}
                </emailForm.Subscribe>

                <div className="text-center">
                  <Link to="/login" className="text-muted-foreground text-sm hover:underline">
                    Back to sign in
                  </Link>
                </div>
              </Form>
            ) : (
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  resetForm.handleSubmit();
                }}
                className="flex w-full flex-col gap-6"
              >
                <Field className="items-center">
                  <FieldLabel>Verification code</FieldLabel>
                  <OTPField
                    length={OTP_LENGTH}
                    value={otp}
                    onValueChange={(value) => {
                      setOtp(value);
                      setOtpInvalid(false);
                    }}
                    size="lg"
                  >
                    {SLOT_KEYS.map((key, index) => (
                      <OTPFieldInput
                        key={key}
                        aria-invalid={otpInvalid || undefined}
                        aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                      />
                    ))}
                  </OTPField>
                  {otpInvalid && <FieldError>Invalid or expired code.</FieldError>}
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-xs">Didn't get it?</span>
                    <Button
                      variant="link"
                      size="sm"
                      type="button"
                      onClick={async () => {
                        setResending(true);
                        await sendOtp(email);
                        setResending(false);
                        setOtp("");
                        setOtpInvalid(false);
                      }}
                      disabled={resending || resendCountdown > 0}
                      loading={resending}
                      className="h-auto p-0 text-xs"
                    >
                      {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend code"}
                    </Button>
                  </div>
                </Field>

                <div className="flex flex-col gap-4">
                  <resetForm.Field name="password">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={field.state.meta.errors.length > 0 || undefined}
                          />
                          <InputGroupAddon align="inline-end">
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Button
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    onClick={() => setShowPassword(!showPassword)}
                                    size="icon-xs"
                                    type="button"
                                    variant="ghost"
                                  />
                                }
                              >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                              </TooltipTrigger>
                              <TooltipPopup>
                                {showPassword ? "Hide password" : "Show password"}
                              </TooltipPopup>
                            </Tooltip>
                          </InputGroupAddon>
                        </InputGroup>
                        {field.state.meta.errors.map((error) => (
                          <FieldError key={error?.message}>{error?.message}</FieldError>
                        ))}
                      </Field>
                    )}
                  </resetForm.Field>

                  <resetForm.Field name="confirmPassword">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            placeholder="••••••••"
                            type={showConfirm ? "text" : "password"}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={field.state.meta.errors.length > 0 || undefined}
                          />
                          <InputGroupAddon align="inline-end">
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Button
                                    aria-label={showConfirm ? "Hide password" : "Show password"}
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    size="icon-xs"
                                    type="button"
                                    variant="ghost"
                                  />
                                }
                              >
                                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                              </TooltipTrigger>
                              <TooltipPopup>
                                {showConfirm ? "Hide password" : "Show password"}
                              </TooltipPopup>
                            </Tooltip>
                          </InputGroupAddon>
                        </InputGroup>
                        {field.state.meta.errors.map((error) => (
                          <FieldError key={error?.message}>{error?.message}</FieldError>
                        ))}
                      </Field>
                    )}
                  </resetForm.Field>
                </div>

                <resetForm.Subscribe
                  selector={(state) => ({
                    canSubmit: state.canSubmit,
                    isSubmitting: state.isSubmitting,
                  })}
                >
                  {({ canSubmit, isSubmitting }) => (
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!canSubmit || isSubmitting || otp.length < OTP_LENGTH}
                      loading={isSubmitting}
                    >
                      Reset password
                    </Button>
                  )}
                </resetForm.Subscribe>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                      setOtpInvalid(false);
                    }}
                    className="text-muted-foreground text-sm hover:underline"
                  >
                    Use a different email
                  </button>
                </div>
              </Form>
            )}
          </CardPanel>
        </Card>
      </CardFrame>
    </div>
  );
}
