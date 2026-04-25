import { Resend } from "resend";
import { env } from "@tailorkit/env/server";

const resend = new Resend(env.RESEND_API_KEY);

const FROM = "TailorKit <noreply@tailorkit.com>";

export async function sendOtpEmail({
  email,
  otp,
  type,
}: {
  email: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password" | "change-email";
}) {
  const subjects: Record<typeof type, string> = {
    "change-email": "Confirm your new email",
    "email-verification": "Verify your email",
    "forget-password": "Reset your password",
    "sign-in": "Your sign-in code",
  };

  const headings: Record<typeof type, string> = {
    "change-email": "Confirm your new email",
    "email-verification": "Verify your email address",
    "forget-password": "Reset your password",
    "sign-in": "Sign in to TailorKit",
  };

  const descriptions: Record<typeof type, string> = {
    "change-email": "Use the code below to confirm your new email address.",
    "email-verification": "Use the code below to verify your email address.",
    "forget-password": "Use the code below to reset your password.",
    "sign-in": "Use the code below to sign in to your account.",
  };

  await resend.emails.send({
    from: FROM,
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 8px;">${headings[type]}</h2>
        <p style="color: #555; margin-bottom: 24px;">${descriptions[type]}</p>
        <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; text-align: center; letter-spacing: 8px; font-size: 32px; font-weight: bold; font-family: monospace;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 13px; margin-top: 16px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
    subject: subjects[type],
    to: email,
  });
}
