import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { render } from "@react-email/render";
import { env, getBaseUrl } from "@tailorkit/env/server";
import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import type SESTransport from "nodemailer/lib/ses-transport";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { BetterAuthOtpTemplate, betterAuthEmailSubjects } from "./templates/better-auth";
import type { BetterAuthEmailType } from "./templates/better-auth";
import { InvitationTemplate } from "./templates/better-auth/invitation";

export interface SendEmailInput {
  from?: string;
  html: string;
  replyTo?: string;
  subject: string;
  text?: string;
  to: string;
}

export interface SendBetterAuthOtpInput {
  email: string;
  otp: string;
  type: BetterAuthEmailType;
}

export interface SendOrganizationInvitationEmailInput {
  email: string;
  invitationId: string;
  inviterName?: string;
  organizationName: string;
  role?: string | null;
}

let cachedTransporter: Mail | undefined;

const hasSesCredentials = () =>
  Boolean(env.AWS_ROLE_ARN || (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY));

const resolveAwsRegion = () => env.AWS_REGION ?? env.AWS_DEFAULT_REGION ?? "us-east-1";

const createSmtpTransport = (smtpUrl: string) => nodemailer.createTransport(smtpUrl);

const createSesTransport = () => {
  const sesClient = new SESv2Client({ region: resolveAwsRegion() });

  const options: SESTransport.Options = {
    SES: { SendEmailCommand, sesClient },
  };

  return nodemailer.createTransport(options);
};

const getTransporter = () => {
  cachedTransporter ??= (() => {
    if (env.SMTP_URL) {
      return createSmtpTransport(env.SMTP_URL);
    }

    if (hasSesCredentials()) {
      return createSesTransport();
    }

    throw new Error("Email transport requires SMTP_URL or AWS credentials for SES.");
  })();

  return cachedTransporter;
};

const resolveFrom = (type?: BetterAuthEmailType) => {
  if (type) {
    return env.SMTP_FROM_AUTH ?? env.SMTP_FROM;
  }

  return env.SMTP_FROM;
};

const renderBetterAuthOtpEmail = async ({
  otp,
  type,
}: Pick<SendBetterAuthOtpInput, "otp" | "type">) => {
  const component = BetterAuthOtpTemplate({ logoBaseUrl: getBaseUrl(), otp, type });

  return {
    html: await render(component),
    text: await render(component, { plainText: true }),
  };
};

export const sendEmail = async ({ from, html, replyTo, subject, text, to }: SendEmailInput) => {
  const transporter = getTransporter();
  const message: SMTPTransport.MailOptions = {
    from: from ?? resolveFrom(),
    html,
    replyTo: replyTo ?? env.SMTP_REPLY_TO,
    subject,
    text,
    to,
  };

  await transporter.sendMail(message);
};

export const sendBetterAuthOtpEmail = async ({ email, otp, type }: SendBetterAuthOtpInput) => {
  const { html, text } = await renderBetterAuthOtpEmail({ otp, type });

  await sendEmail({
    from: resolveFrom(type),
    html,
    replyTo: env.SMTP_REPLY_TO,
    subject: betterAuthEmailSubjects[type],
    text,
    to: email,
  });
};

export const sendOrganizationInvitationEmail = async ({
  email,
  invitationId,
  inviterName,
  organizationName,
  role,
}: SendOrganizationInvitationEmailInput) => {
  const acceptUrl = new URL("/account/invites", getBaseUrl());
  acceptUrl.searchParams.set("invitationId", invitationId);

  const component = InvitationTemplate({
    acceptUrl: acceptUrl.toString(),
    inviterName,
    logoBaseUrl: getBaseUrl(),
    organizationName,
    role: role ?? "member",
  });

  await sendEmail({
    from: env.SMTP_FROM_INVITE ?? env.SMTP_FROM_AUTH ?? env.SMTP_FROM,
    html: await render(component),
    replyTo: env.SMTP_REPLY_TO,
    subject: `${inviterName ?? "Someone"} invited you to join ${organizationName}`,
    text: await render(component, { plainText: true }),
    to: email,
  });
};

export { BetterAuthOtpTemplate, InvitationTemplate };
export type { BetterAuthEmailType };
